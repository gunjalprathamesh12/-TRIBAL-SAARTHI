import AuditLog from '../models/AuditLog.js';

// @desc    Get immutable audit log trail with filters
// @route   GET /api/audit
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, userRole, search, limit = 50, page = 1 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (userRole) query.userRole = userRole;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
