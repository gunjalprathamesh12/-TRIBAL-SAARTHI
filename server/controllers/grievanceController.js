import Grievance from '../models/Grievance.js';
import { logAuditEvent } from '../services/auditService.js';
import { sendNotification } from '../services/notificationService.js';

// @desc    Raise a new grievance ticket
// @route   POST /api/grievances
export const createGrievance = async (req, res, next) => {
  try {
    const { applicationId, category, subject, description, priority = 'NORMAL' } = req.body;

    const year = new Date().getFullYear();
    const ticketId = `GRV-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const grievance = await Grievance.create({
      ticketId,
      applicantId: req.user._id,
      applicationId,
      category,
      subject,
      description,
      priority,
      status: 'OPEN',
    });

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'APPLICATION_UPDATED',
      entityType: 'User',
      entityId: req.user._id,
      reason: `Applicant raised grievance ticket ${ticketId}`,
    });

    res.status(201).json({
      success: true,
      message: 'Grievance ticket registered. An officer will review your request.',
      data: grievance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get grievances list
// @route   GET /api/grievances
export const getGrievances = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const query = {};

    if (req.user.role === 'APPLICANT') {
      query.applicantId = req.user._id;
    }
    if (status) query.status = status;
    if (category) query.category = category;

    const tickets = await Grievance.find(query)
      .populate('applicantId', 'name email mobile')
      .populate('applicationId', 'applicationNumber')
      .populate('assignedOfficer', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Officer resolves a grievance ticket
// @route   POST /api/grievances/:id/resolve
export const resolveGrievance = async (req, res, next) => {
  try {
    const { resolutionRemarks, status = 'RESOLVED' } = req.body;

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    grievance.status = status;
    grievance.resolutionRemarks = resolutionRemarks;
    grievance.assignedOfficer = req.user._id;
    grievance.resolvedAt = new Date();
    await grievance.save();

    await sendNotification({
      userId: grievance.applicantId,
      title: `Grievance Ticket [${grievance.ticketId}] Update`,
      message: `Your grievance has been marked as ${status}. Response: "${resolutionRemarks}"`,
      type: 'INFO',
      link: '/applicant/help',
    });

    res.json({
      success: true,
      message: 'Ticket resolution saved and student notified.',
      data: grievance,
    });
  } catch (error) {
    next(error);
  }
};
