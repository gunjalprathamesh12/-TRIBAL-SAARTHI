import Selection from '../models/Selection.js';
import Application from '../models/Application.js';
import Scheme from '../models/Scheme.js';
import Disbursement from '../models/Disbursement.js';
import { logAuditEvent } from '../services/auditService.js';
import { sendNotification } from '../services/notificationService.js';

// @desc    Get candidates for selection committee review
// @route   GET /api/selection/candidates
export const getSelectionCandidates = async (req, res, next) => {
  try {
    const { schemeId, status, quota } = req.query;
    const query = {};

    if (schemeId) query.schemeId = schemeId;
    if (status) query.selectionStatus = status;
    if (quota) query.quotaCategory = quota;

    const candidates = await Selection.find(query)
      .populate('applicationId')
      .populate('applicantId', 'name email mobile')
      .populate('schemeId', 'schemeCode schemeName shortTitle schemeType financialBenefits')
      .sort({ totalMeritScore: -1 });

    res.json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Committee members score and vote on candidate
// @route   POST /api/selection/:id/review
export const reviewCandidate = async (req, res, next) => {
  try {
    const {
      vote, // 'APPROVE', 'SHORTLIST', 'HOLD', 'REJECT'
      academicPerformanceScore,
      researchAdmissionScore,
      schemeSpecificScore,
      specialVulnerabilityScore,
      comments,
    } = req.body;

    const selection = await Selection.findById(req.params.id);
    if (!selection) {
      return res.status(404).json({ success: false, message: 'Selection candidate record not found.' });
    }

    if (academicPerformanceScore !== undefined) selection.academicPerformanceScore = academicPerformanceScore;
    if (researchAdmissionScore !== undefined) selection.researchAdmissionScore = researchAdmissionScore;
    if (schemeSpecificScore !== undefined) selection.schemeSpecificScore = schemeSpecificScore;
    if (specialVulnerabilityScore !== undefined) selection.specialVulnerabilityScore = specialVulnerabilityScore;

    selection.totalMeritScore =
      (selection.academicPerformanceScore || 0) +
      (selection.researchAdmissionScore || 0) +
      (selection.schemeSpecificScore || 0) +
      (selection.specialVulnerabilityScore || 0);

    // Append committee review vote
    selection.committeeReviews.push({
      memberId: req.user._id,
      memberName: req.user.name,
      vote,
      scoreAwarded: selection.totalMeritScore,
      comments,
      timestamp: new Date(),
    });

    if (vote === 'SHORTLIST') {
      selection.selectionStatus = 'SHORTLISTED';
    } else if (vote === 'HOLD') {
      selection.selectionStatus = 'HELD';
    } else if (vote === 'REJECT') {
      selection.selectionStatus = 'REJECTED';
    }
    selection.selectionRemarks = comments || selection.selectionRemarks;

    await selection.save();

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SELECTION_UPDATED',
      entityType: 'Selection',
      entityId: selection._id,
      newState: { status: selection.selectionStatus, score: selection.totalMeritScore },
      reason: `Committee member voted: ${vote} with score ${selection.totalMeritScore}/100`,
    });

    res.json({
      success: true,
      message: 'Candidate review vote and score recorded.',
      data: selection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Committee final approval & sanction creation
// @route   POST /api/selection/:id/approve
export const approveSelectionCandidate = async (req, res, next) => {
  try {
    const { sanctionAmount, remarks } = req.body;

    const selection = await Selection.findById(req.params.id)
      .populate('applicationId')
      .populate('schemeId')
      .populate('applicantId');

    if (!selection) {
      return res.status(404).json({ success: false, message: 'Selection candidate not found.' });
    }

    selection.selectionStatus = 'APPROVED';
    selection.approvedSanctionAmount = sanctionAmount || selection.schemeId?.financialBenefits?.totalEstimatedAnnualValue || 50000;
    selection.selectedDate = new Date();
    selection.selectionRemarks = remarks || 'Approved by National Selection Committee';
    await selection.save();

    // Update Application
    const application = await Application.findById(selection.applicationId._id);
    if (application) {
      const year = new Date().getFullYear();
      const sanctionNo = `MoTA/${year}/${selection.schemeId.schemeCode}/${Math.floor(1000 + Math.random() * 9000)}`;

      application.status = 'SANCTIONED';
      application.currentStage = 'Sanction Order Processing';
      application.sanctionOrderNo = sanctionNo;
      application.sanctionAmount = selection.approvedSanctionAmount;

      application.statusHistory.push({
        status: 'SANCTIONED',
        stageName: 'Sanction Order Processing',
        updatedBy: req.user._id,
        officerRole: req.user.role,
        remarks: `Selected by Selection Committee. Sanction Order: ${sanctionNo} for Rs. ${selection.approvedSanctionAmount.toLocaleString('en-IN')}/-`,
      });

      await application.save();

      // Automatically create preliminary DBT Disbursement record
      await Disbursement.create({
        applicationId: application._id,
        applicantId: application.applicantId,
        schemeId: selection.schemeId._id,
        sanctionOrderNo: sanctionNo,
        amount: selection.approvedSanctionAmount,
        beneficiaryName: selection.applicantId.name,
        bankName: 'State Bank of India',
        ifscCode: 'SBIN0001234',
        accountNumberMasked: 'XXXX XXXX 4821',
        status: 'SANCTIONED',
        remarks: 'Direct Benefit Transfer sanction order created.',
      });

      // Notify Applicant
      await sendNotification({
        userId: application.applicantId,
        title: 'Heartiest Congratulations! Scholarship Sanctioned',
        message: `Your application ${application.applicationNumber} for "${selection.schemeId.shortTitle}" has been APPROVED by the Selection Committee with Sanction No: ${sanctionNo}.`,
        type: 'SELECTION',
        link: `/applicant/application/${application._id}`,
      });
    }

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SANCTION_CREATED',
      entityType: 'Selection',
      entityId: selection._id,
      newState: { status: 'APPROVED', sanctionAmount: selection.approvedSanctionAmount },
      reason: remarks || 'Selection Committee finalized award approval',
    });

    res.json({
      success: true,
      message: 'Candidate selected and sanction order generated.',
      data: selection,
    });
  } catch (error) {
    next(error);
  }
};
