import mongoose from 'mongoose';

const deficiencySchema = new mongoose.Schema(
  {
    deficiencyCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'MISSING_DOCUMENT',
        'INCOME_MISMATCH',
        'NAME_MISMATCH',
        'BLURRY_UNREADABLE_DOC',
        'EXPIRED_CERTIFICATE',
        'INSTITUTION_MISMATCH',
        'DUPLICATE_UPLOAD',
        'INCORRECT_DETAILS',
        'OTHER',
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'HIGH',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    evidence: {
      expectedValue: mongoose.Schema.Types.Mixed,
      extractedValue: mongoose.Schema.Types.Mixed,
      field: String,
      details: String,
    },
    remediationInstruction: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED', 'REVERIFIED_APPROVED', 'REJECTED_FINAL'],
      default: 'OPEN',
      index: true,
    },
    deadlineDate: {
      type: Date,
      default: () => new Date(+new Date() + 15 * 24 * 60 * 60 * 1000), // 15 days default
    },
    correctionSubmission: {
      correctedDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
      updatedField: { type: String },
      oldValue: { type: mongoose.Schema.Types.Mixed },
      newValue: { type: mongoose.Schema.Types.Mixed },
      applicantRemarks: { type: String },
      submittedAt: { type: Date },
    },
    resolutionReview: {
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date },
      isAccepted: { type: Boolean },
      officerRemarks: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const Deficiency = mongoose.model('Deficiency', deficiencySchema);

export default Deficiency;
