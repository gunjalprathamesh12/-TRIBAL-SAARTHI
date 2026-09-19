import Disbursement from '../models/Disbursement.js';
import Application from '../models/Application.js';
import { logAuditEvent } from '../services/auditService.js';
import { sendNotification } from '../services/notificationService.js';

// @desc    Get DBT / Disbursement dashboard data and batches
// @route   GET /api/disbursements
export const getDisbursements = async (req, res, next) => {
  try {
    const { status, schemeId, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (schemeId) query.schemeId = schemeId;
    if (search) {
      query.$or = [
        { sanctionOrderNo: { $regex: search, $options: 'i' } },
        { beneficiaryName: { $regex: search, $options: 'i' } },
        { utrNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const records = await Disbursement.find(query)
      .populate('applicationId', 'applicationNumber currentStage')
      .populate('schemeId', 'schemeCode schemeName shortTitle')
      .populate('applicantId', 'name email mobile')
      .sort({ createdAt: -1 });

    // Summary Statistics for DBT Dashboard
    const totalSanctionedAmount = await Disbursement.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const disbursedAmount = await Disbursement.aggregate([
      { $match: { status: 'DISBURSED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const pendingAmount = await Disbursement.aggregate([
      { $match: { status: { $in: ['SANCTIONED', 'PROCESSING'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const statusCounts = {
      sanctioned: await Disbursement.countDocuments({ status: 'SANCTIONED' }),
      processing: await Disbursement.countDocuments({ status: 'PROCESSING' }),
      disbursed: await Disbursement.countDocuments({ status: 'DISBURSED' }),
      failed: await Disbursement.countDocuments({ status: 'FAILED' }),
    };

    res.json({
      success: true,
      data: {
        summary: {
          totalSanctioned: totalSanctionedAmount[0]?.total || 0,
          totalDisbursed: disbursedAmount[0]?.total || 0,
          totalPending: pendingAmount[0]?.total || 0,
          counts: statusCounts,
        },
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Finance officer dispatches DBT disbursement batch
// @route   POST /api/disbursements/:id/update
export const updateDisbursementStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const disbursement = await Disbursement.findById(req.params.id)
      .populate('applicationId')
      .populate('schemeId');

    if (!disbursement) {
      return res.status(404).json({ success: false, message: 'Disbursement record not found.' });
    }

    disbursement.status = status;
    disbursement.processedBy = req.user._id;
    if (remarks) disbursement.remarks = remarks;

    // Generate realistic synthetic UTR number on disbursement
    if (status === 'DISBURSED' && !disbursement.utrNumber) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSeq = Math.floor(100000 + Math.random() * 900000);
      disbursement.utrNumber = `RBI${dateStr}${randomSeq}`;
      disbursement.disbursedDate = new Date();
    }

    await disbursement.save();

    // Update Application Status
    const application = await Application.findById(disbursement.applicationId._id);
    if (application) {
      if (status === 'DISBURSED') {
        application.status = 'DISBURSED';
        application.currentStage = 'Award Disbursed / Completed';
      } else if (status === 'PROCESSING') {
        application.status = 'DISBURSEMENT_PENDING';
        application.currentStage = 'Direct Benefit Transfer (DBT)';
      }

      application.statusHistory.push({
        status: application.status,
        stageName: application.currentStage,
        updatedBy: req.user._id,
        officerRole: req.user.role,
        remarks: `DBT Payment status updated to ${status}. ${disbursement.utrNumber ? `UTR: ${disbursement.utrNumber}` : ''}`,
      });
      await application.save();

      // Notify Applicant
      if (status === 'DISBURSED') {
        await sendNotification({
          userId: application.applicantId,
          title: 'Scholarship Amount Disbursed via DBT',
          message: `Scholarship amount of Rs. ${disbursement.amount.toLocaleString('en-IN')}/- has been credited via Aadhaar Payment Bridge to your registered bank account. Transaction Ref (UTR): ${disbursement.utrNumber}.`,
          type: 'DISBURSEMENT',
          link: `/applicant/application/${application._id}`,
        });
      }
    }

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PAYMENT_UPDATED',
      entityType: 'Disbursement',
      entityId: disbursement._id,
      newState: { status, utrNumber: disbursement.utrNumber },
      reason: remarks || `DBT payment status transitioned to ${status}`,
    });

    res.json({
      success: true,
      message: `Disbursement status successfully updated to ${status}`,
      data: disbursement,
    });
  } catch (error) {
    next(error);
  }
};
