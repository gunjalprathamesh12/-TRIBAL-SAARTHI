import Application from '../models/Application.js';
import Scheme from '../models/Scheme.js';
import ApplicantProfile from '../models/ApplicantProfile.js';
import Document from '../models/Document.js';
import DocumentVerification from '../models/DocumentVerification.js';
import EligibilityResult from '../models/EligibilityResult.js';
import Deficiency from '../models/Deficiency.js';
import AuditLog from '../models/AuditLog.js';
import { evaluateEligibility } from '../services/ai/eligibilityService.js';
import { inspectApplicationForDeficiencies } from '../services/ai/deficiencyService.js';
import { logAuditEvent } from '../services/auditService.js';
import { sendNotification } from '../services/notificationService.js';

// @desc    Start or retrieve existing draft application
// @route   POST /api/applications
export const createApplication = async (req, res, next) => {
  try {
    const { schemeId, profileData } = req.body;

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    let profile = await ApplicantProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await ApplicantProfile.create({
        userId: req.user._id,
        fullName: req.user.name,
        dob: new Date('2003-05-15'),
        gender: 'Male',
        fatherName: 'Late/Shri Father',
        motherName: 'Smt. Mother',
        category: 'ST',
        tribeName: 'Bhil',
        stCertificateNo: `ST/2023/${Math.floor(100000 + Math.random() * 900000)}`,
        state: 'Madhya Pradesh',
        district: 'Jhabua',
        pincode: '457661',
        addressLine: 'Tribal Welfare Area',
        currentEducationLevel: scheme.educationLevels[0] || 'Undergraduate',
        courseName: 'Degree Course',
        previousExamMarksPercentage: 75.0,
        institutionName: 'Govt Autonomous College',
        institutionType: 'Govt College',
        annualFamilyIncome: 180000,
        incomeCertificateNo: `INC/2024/${Math.floor(10000 + Math.random() * 90000)}`,
        accountHolderName: req.user.name,
        accountNumberMasked: 'XXXX XXXX 4821',
        ifscCode: 'SBIN0001234',
        bankName: 'State Bank of India',
        branchName: 'Main Branch',
      });
    }

    // Check if there is already an active draft for this scheme
    let application = await Application.findOne({
      applicantId: req.user._id,
      schemeId: scheme._id,
      status: 'DRAFT',
    });

    if (!application) {
      const year = new Date().getFullYear();
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const appNumber = `TS-${year}-${scheme.schemeCode}-${randomSeq}`;

      application = await Application.create({
        applicationNumber: appNumber,
        applicantId: req.user._id,
        profileId: profile._id,
        schemeId: scheme._id,
        academicYear: scheme.academicYear || `${year}-${year + 1}`,
        status: 'DRAFT',
        currentStage: 'Draft Creation',
        wizardStepCompleted: 1,
        formDataSnapshot: profileData || {},
        statusHistory: [
          {
            status: 'DRAFT',
            stageName: 'Draft Creation',
            updatedBy: req.user._id,
            officerRole: req.user.role,
            remarks: 'Application draft created by applicant.',
          },
        ],
      });

      await logAuditEvent({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'APPLICATION_CREATED',
        entityType: 'Application',
        entityId: application._id,
        reason: `Application draft ${application.applicationNumber} initiated`,
      });
    }

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application draft autosave (wizard step)
// @route   PUT /api/applications/:id/draft
export const updateApplicationDraft = async (req, res, next) => {
  try {
    const { step, formData, profileUpdates } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      applicantId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.status !== 'DRAFT' && application.status !== 'DEFICIENCY_RAISED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit an application that has already been submitted for scrutiny.',
      });
    }

    if (step) application.wizardStepCompleted = Math.max(application.wizardStepCompleted, step);
    if (formData) application.formDataSnapshot = { ...application.formDataSnapshot, ...formData };

    await application.save();

    // Also update applicant profile if provided
    if (profileUpdates && application.profileId) {
      await ApplicantProfile.findByIdAndUpdate(application.profileId, profileUpdates, { new: true });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit application & execute AI verification & rule evaluation pipeline
// @route   POST /api/applications/:id/submit
export const submitApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicantId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const scheme = await Scheme.findById(application.schemeId);
    const profile = await ApplicantProfile.findById(application.profileId);
    const documents = await Document.find({ applicationId: application._id, isCurrentVersion: true });
    const verifications = await DocumentVerification.find({ applicationId: application._id });

    // 1. Run Dynamic Configurable Rule Engine
    const eligibilityResult = await evaluateEligibility({
      applicantProfile: profile,
      scheme,
      applicationDocuments: documents,
    });

    // 2. Run AI Deficiency & Anomaly Detector
    const deficiencyAnalysis = await inspectApplicationForDeficiencies({
      application,
      scheme,
      applicantProfile: profile,
      documents,
      verifications,
    });

    // 3. Save or Update Eligibility Result
    await EligibilityResult.findOneAndUpdate(
      { applicationId: application._id },
      {
        schemeId: scheme._id,
        decision: eligibilityResult.decision,
        compositeMeritScore: eligibilityResult.compositeMeritScore,
        scoreBreakdown: eligibilityResult.scoreBreakdown,
        ruleResults: eligibilityResult.ruleResults,
        failedRules: eligibilityResult.failedRules,
        warnings: eligibilityResult.warnings,
        requiresHumanReview: eligibilityResult.requiresHumanReview,
        humanReviewReasons: eligibilityResult.humanReviewReasons,
      },
      { upsert: true, new: true }
    );

    // 4. Update Application Status & AI Risk Summary
    application.status = 'SUBMITTED';
    application.currentStage = 'Document Verification';
    application.submissionDate = new Date();
    application.wizardStepCompleted = 10;
    application.aiVerificationSummary = {
      overallRiskLevel: deficiencyAnalysis.riskLevel,
      recommendedQueue: deficiencyAnalysis.recommendedQueue,
      confidenceScore: deficiencyAnalysis.confidenceScore,
      flagsCount: deficiencyAnalysis.flagsCount,
      lastEvaluatedAt: new Date(),
      aiSummaryNote: deficiencyAnalysis.aiSummaryNote,
    };
    application.eligibilitySummary = {
      isEligible: eligibilityResult.isEligible,
      decision: eligibilityResult.decision,
      meritScore: eligibilityResult.compositeMeritScore,
      passedRulesCount: eligibilityResult.ruleResults.filter((r) => r.passed).length,
      failedRulesCount: eligibilityResult.failedRules.length,
      summary: `${eligibilityResult.decision}: Score ${eligibilityResult.compositeMeritScore}/100`,
    };

    application.statusHistory.push({
      status: 'SUBMITTED',
      stageName: 'Application Submitted',
      updatedBy: req.user._id,
      officerRole: 'APPLICANT',
      remarks: 'Application submitted successfully with all required documents and declarations.',
    });

    await application.save();

    // 5. Send Multi-Channel Notification
    await sendNotification({
      userId: req.user._id,
      title: 'Application Submitted Successfully',
      message: `Your scholarship application ${application.applicationNumber} for "${scheme.shortTitle}" has been submitted for verification.`,
      type: 'SUCCESS',
      link: `/applicant/application/${application._id}`,
      metadata: { applicationId: application._id },
    });

    // 6. Log Immutable Audit Record
    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'APPLICATION_SUBMITTED',
      entityType: 'Application',
      entityId: application._id,
      newState: { status: application.status, currentStage: application.currentStage },
      reason: 'Application submitted by candidate after 10-step validation.',
    });

    res.json({
      success: true,
      message: 'Application submitted successfully.',
      data: {
        application,
        eligibilityResult,
        deficiencyAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications list with filters, pagination & priority queues
// @route   GET /api/applications
export const getApplications = async (req, res, next) => {
  try {
    const {
      schemeId,
      status,
      stage,
      riskLevel,
      queue,
      search,
      state,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // If applicant, restrict strictly to their own applications
    if (req.user.role === 'APPLICANT') {
      query.applicantId = req.user._id;
    } else {
      // Officers/Admin can filter by scheme, status, risk, queue
      if (schemeId) query.schemeId = schemeId;
      if (status) query.status = status;
      if (stage) query.currentStage = stage;
      if (riskLevel) query['aiVerificationSummary.overallRiskLevel'] = riskLevel;
      if (queue) query['aiVerificationSummary.recommendedQueue'] = queue;
    }

    if (search) {
      query.$or = [
        { applicationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .populate('schemeId', 'schemeCode schemeName shortTitle schemeType financialBenefits')
      .populate('applicantId', 'name email mobile')
      .populate('profileId')
      .populate('assignedOfficer', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: applications.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete application detail bundle
// @route   GET /api/applications/:id
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('schemeId')
      .populate('applicantId', 'name email mobile role')
      .populate('profileId')
      .populate('assignedOfficer', 'name email role designation');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Role check: Applicant can only access own application
    if (req.user.role === 'APPLICANT' && application.applicantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access forbidden.' });
    }

    const documents = await Document.find({ applicationId: application._id, isCurrentVersion: true });
    const verifications = await DocumentVerification.find({ applicationId: application._id });
    const eligibilityResult = await EligibilityResult.findOne({ applicationId: application._id });
    const deficiencies = await Deficiency.find({ applicationId: application._id }).populate('raisedBy', 'name role');
    const auditLogs = await AuditLog.find({ entityId: application._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        application,
        documents,
        verifications,
        eligibilityResult,
        deficiencies,
        auditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Officer updates application stage/status
// @route   PUT /api/applications/:id/stage
export const updateApplicationStage = async (req, res, next) => {
  try {
    const { status, currentStage, remarks } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const previousStatus = application.status;
    application.status = status || application.status;
    if (currentStage) application.currentStage = currentStage;
    application.verificationRemarks = remarks || application.verificationRemarks;
    application.assignedOfficer = req.user._id;

    application.statusHistory.push({
      status: application.status,
      stageName: currentStage || application.currentStage,
      updatedBy: req.user._id,
      officerRole: req.user.role,
      remarks: remarks || `Status updated to ${application.status} by ${req.user.role}`,
    });

    await application.save();

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: status === 'REJECTED' ? 'OFFICER_REJECTED' : 'OFFICER_APPROVED',
      entityType: 'Application',
      entityId: application._id,
      previousState: { status: previousStatus },
      newState: { status: application.status, currentStage: application.currentStage },
      reason: remarks || 'Officer stage update in scrutiny workflow',
    });

    await sendNotification({
      userId: application.applicantId,
      title: `Application Update: ${application.status}`,
      message: `Your scholarship application ${application.applicationNumber} has been updated to "${application.status}" - ${remarks || ''}`,
      type: status === 'REJECTED' ? 'WARNING' : 'INFO',
      link: `/applicant/application/${application._id}`,
    });

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Officer overrides an AI Flag with mandatory justification
// @route   POST /api/applications/:id/override-flag
export const overrideAIFlag = async (req, res, next) => {
  try {
    const { flagCode, documentId, overrideReason } = req.body;

    if (!overrideReason || overrideReason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A detailed manual override reason is strictly mandatory for auditing.',
      });
    }

    const verification = await DocumentVerification.findOne({
      applicationId: req.params.id,
      documentId,
    });

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found.' });
    }

    const targetFlag = verification.aiFlags.find((f) => f.code === flagCode);
    if (!targetFlag) {
      return res.status(404).json({ success: false, message: 'AI flag not found.' });
    }

    targetFlag.isOverridden = true;
    targetFlag.overrideReason = overrideReason;
    targetFlag.overriddenBy = req.user._id;
    targetFlag.overriddenAt = new Date();

    await verification.save();

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'AI_FLAG_OVERRIDDEN',
      entityType: 'Document',
      entityId: documentId,
      previousState: { flagCode, status: 'ACTIVE' },
      newState: { flagCode, status: 'OVERRIDDEN' },
      reason: overrideReason,
    });

    res.json({
      success: true,
      message: 'AI flag successfully overridden with audit record.',
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};
