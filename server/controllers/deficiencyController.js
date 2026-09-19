import Deficiency from '../models/Deficiency.js';
import Application from '../models/Application.js';
import Document from '../models/Document.js';
import DocumentVerification from '../models/DocumentVerification.js';
import ApplicantProfile from '../models/ApplicantProfile.js';
import Scheme from '../models/Scheme.js';
import { logAuditEvent } from '../services/auditService.js';
import { sendNotification } from '../services/notificationService.js';
import { evaluateEligibility } from '../services/ai/eligibilityService.js';
import { inspectApplicationForDeficiencies } from '../services/ai/deficiencyService.js';

// @desc    Get deficiencies list
// @route   GET /api/deficiencies
export const getDeficiencies = async (req, res, next) => {
  try {
    const { applicationId, status } = req.query;
    const query = {};

    if (req.user.role === 'APPLICANT') {
      query.applicantId = req.user._id;
    } else if (applicationId) {
      query.applicationId = applicationId;
    }

    if (status) query.status = status;

    const deficiencies = await Deficiency.find(query)
      .populate('applicationId', 'applicationNumber currentStage status')
      .populate('raisedBy', 'name role designation')
      .populate('correctionSubmission.correctedDocumentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: deficiencies.length,
      data: deficiencies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Officer raises a deficiency
// @route   POST /api/deficiencies
export const raiseDeficiency = async (req, res, next) => {
  try {
    const {
      applicationId,
      documentId,
      category,
      severity = 'HIGH',
      title,
      description,
      remediationInstruction,
      evidence,
      deadlineDays = 15,
    } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const year = new Date().getFullYear();
    const deficiencyCode = `DEF-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const deficiency = await Deficiency.create({
      deficiencyCode,
      applicationId: application._id,
      applicantId: application.applicantId,
      documentId,
      raisedBy: req.user._id,
      category,
      severity,
      title,
      description,
      remediationInstruction,
      evidence,
      status: 'OPEN',
      deadlineDate: new Date(+new Date() + deadlineDays * 24 * 60 * 60 * 1000),
    });

    // Update application stage to Deficiency Resolution
    application.status = 'DEFICIENCY_RAISED';
    application.currentStage = 'Deficiency Resolution';
    application.statusHistory.push({
      status: 'DEFICIENCY_RAISED',
      stageName: 'Deficiency Resolution',
      updatedBy: req.user._id,
      officerRole: req.user.role,
      remarks: `Deficiency raised: ${title}. Remediation requested from applicant.`,
    });
    await application.save();

    // Send notification to student
    await sendNotification({
      userId: application.applicantId,
      title: `Action Required: Deficiency Raised on Application ${application.applicationNumber}`,
      message: `${title} - ${remediationInstruction}. Please submit your correction within ${deadlineDays} days.`,
      type: 'DEFICIENCY',
      link: `/applicant/deficiencies`,
      metadata: { deficiencyCode, applicationId: application._id },
    });

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DEFICIENCY_RAISED',
      entityType: 'Deficiency',
      entityId: deficiency._id,
      newState: deficiency.toObject(),
      reason: `Officer raised deficiency: ${title}`,
    });

    res.status(201).json({
      success: true,
      message: 'Deficiency registered and applicant notified.',
      data: deficiency,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Applicant submits correction for deficiency
// @route   POST /api/deficiencies/:id/resolve
export const submitCorrection = async (req, res, next) => {
  try {
    const { correctedDocumentId, updatedField, newValue, applicantRemarks } = req.body;

    const deficiency = await Deficiency.findById(req.params.id);
    if (!deficiency) {
      return res.status(404).json({ success: false, message: 'Deficiency not found.' });
    }

    if (req.user.role === 'APPLICANT' && deficiency.applicantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    deficiency.correctionSubmission = {
      correctedDocumentId,
      updatedField,
      newValue,
      applicantRemarks,
      submittedAt: new Date(),
    };
    deficiency.status = 'RESOLVED';
    await deficiency.save();

    // Update Application stage to Correction Submitted
    const application = await Application.findById(deficiency.applicationId);
    if (application) {
      application.status = 'CORRECTION_SUBMITTED';
      application.currentStage = 'Document Verification';
      application.statusHistory.push({
        status: 'CORRECTION_SUBMITTED',
        stageName: 'Document Verification',
        updatedBy: req.user._id,
        officerRole: 'APPLICANT',
        remarks: `Correction submitted for deficiency [${deficiency.deficiencyCode}]: ${applicantRemarks || 'Correction uploaded.'}`,
      });

      // If updated field was annual family income, sync profile
      if (updatedField === 'annualFamilyIncome' && newValue && application.profileId) {
        await ApplicantProfile.findByIdAndUpdate(application.profileId, {
          annualFamilyIncome: Number(newValue),
        });
      }

      // Re-run AI analysis
      const scheme = await Scheme.findById(application.schemeId);
      const profile = await ApplicantProfile.findById(application.profileId);
      const documents = await Document.find({ applicationId: application._id, isCurrentVersion: true });
      const verifications = await DocumentVerification.find({ applicationId: application._id });

      const reCheck = await inspectApplicationForDeficiencies({
        application,
        scheme,
        applicantProfile: profile,
        documents,
        verifications,
      });

      application.aiVerificationSummary = {
        overallRiskLevel: reCheck.riskLevel,
        recommendedQueue: reCheck.recommendedQueue,
        confidenceScore: reCheck.confidenceScore,
        flagsCount: reCheck.flagsCount,
        lastEvaluatedAt: new Date(),
        aiSummaryNote: 'Application re-evaluated after correction submission.',
      };

      await application.save();
    }

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CORRECTION_SUBMITTED',
      entityType: 'Deficiency',
      entityId: deficiency._id,
      newState: deficiency.correctionSubmission,
      reason: `Applicant submitted correction for ${deficiency.deficiencyCode}`,
    });

    res.json({
      success: true,
      message: 'Correction submitted successfully for re-verification.',
      data: deficiency,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Officer reviews and closes deficiency resolution
// @route   POST /api/deficiencies/:id/review
export const reviewDeficiencyResolution = async (req, res, next) => {
  try {
    const { isAccepted, officerRemarks } = req.body;

    const deficiency = await Deficiency.findById(req.params.id);
    if (!deficiency) {
      return res.status(404).json({ success: false, message: 'Deficiency not found.' });
    }

    deficiency.status = isAccepted ? 'REVERIFIED_APPROVED' : 'OPEN';
    deficiency.resolutionReview = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      isAccepted,
      officerRemarks,
    };
    await deficiency.save();

    const application = await Application.findById(deficiency.applicationId);
    if (application) {
      if (isAccepted) {
        application.status = 'UNDER_VERIFICATION';
        application.currentStage = 'Eligibility & Scrutiny';
      } else {
        application.status = 'DEFICIENCY_RAISED';
        application.currentStage = 'Deficiency Resolution';
      }

      application.statusHistory.push({
        status: application.status,
        stageName: application.currentStage,
        updatedBy: req.user._id,
        officerRole: req.user.role,
        remarks: `Deficiency resolution ${isAccepted ? 'approved' : 'rejected'}: ${officerRemarks}`,
      });
      await application.save();
    }

    await sendNotification({
      userId: deficiency.applicantId,
      title: isAccepted ? 'Deficiency Resolution Accepted' : 'Deficiency Resubmission Required',
      message: `Your deficiency resolution for [${deficiency.deficiencyCode}] was ${isAccepted ? 'approved' : 'rejected'}. ${officerRemarks}`,
      type: isAccepted ? 'SUCCESS' : 'WARNING',
      link: `/applicant/application/${deficiency.applicationId}`,
    });

    res.json({
      success: true,
      message: `Deficiency review completed: ${isAccepted ? 'Approved' : 'Further action required'}`,
      data: deficiency,
    });
  } catch (error) {
    next(error);
  }
};
