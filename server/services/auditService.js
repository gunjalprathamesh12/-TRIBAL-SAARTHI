import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({
  userId,
  userName = 'System Officer',
  userRole = 'SYSTEM',
  action,
  entityType,
  entityId,
  previousState = null,
  newState = null,
  reason = '',
  ipAddress = '127.0.0.1',
  userAgent = 'MoTA-Tribal-Saarthi-Server',
}) => {
  try {
    const log = await AuditLog.create({
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      previousState,
      newState,
      reason,
      ipAddress,
      userAgent,
    });
    return log;
  } catch (error) {
    console.error('[Audit Log Error]', error.message);
    // Audit log failures should not block the primary operation
    return null;
  }
};
