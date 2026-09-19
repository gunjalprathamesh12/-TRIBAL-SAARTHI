import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userName: {
      type: String,
      default: 'System',
    },
    userRole: {
      type: String,
      default: 'SYSTEM',
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'APPLICATION_CREATED',
        'APPLICATION_UPDATED',
        'APPLICATION_SUBMITTED',
        'DOCUMENT_UPLOADED',
        'OCR_COMPLETED',
        'RULE_EVALUATED',
        'DEFICIENCY_RAISED',
        'CORRECTION_SUBMITTED',
        'OFFICER_APPROVED',
        'OFFICER_REJECTED',
        'AI_FLAG_CREATED',
        'AI_FLAG_OVERRIDDEN',
        'SELECTION_UPDATED',
        'SANCTION_CREATED',
        'PAYMENT_UPDATED',
        'SCHEME_MODIFIED',
        'RULE_MODIFIED',
      ],
      index: true,
    },
    entityType: {
      type: String,
      enum: ['Application', 'Document', 'Deficiency', 'Selection', 'Disbursement', 'Scheme', 'SchemeRule', 'User'],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
    },
    newState: {
      type: mongoose.Schema.Types.Mixed,
    },
    reason: {
      type: String,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'MoTA-GovTech-Client/1.0',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable record
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
