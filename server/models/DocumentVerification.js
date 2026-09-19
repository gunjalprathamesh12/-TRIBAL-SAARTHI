import mongoose from 'mongoose';

const aiFlagSchema = new mongoose.Schema({
  code: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'NAME_MISMATCH',
      'INCOME_MISMATCH',
      'EXPIRED_CERTIFICATE',
      'DUPLICATE_HASH',
      'DUPLICATE_CERT_NO',
      'LOW_QUALITY_SCAN',
      'SUSPICIOUS_ANOMALY',
      'INCOMPLETE_DOCUMENT',
      'DATE_MISMATCH',
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  evidence: {
    extractedValue: mongoose.Schema.Types.Mixed,
    expectedValue: mongoose.Schema.Types.Mixed,
    field: String,
    difference: String,
    confidence: Number,
  },
  isOverridden: { type: Boolean, default: false },
  overrideReason: { type: String },
  overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  overriddenAt: { type: Date },
});

const documentVerificationSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
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
    docType: {
      type: String,
      required: true,
    },
    extractedData: {
      candidateName: { type: String },
      dob: { type: String },
      certificateNumber: { type: String, index: true },
      issueDate: { type: String },
      issuingAuthority: { type: String },
      annualIncome: { type: Number },
      marksPercentage: { type: Number },
      institutionName: { type: String },
      courseName: { type: String },
      category: { type: String },
      tribe: { type: String },
      rawTextSummary: { type: String },
    },
    fieldConfidences: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    overallConfidence: {
      type: Number,
      default: 95,
    },
    classificationConfidence: {
      type: Number,
      default: 98,
    },
    isReadable: {
      type: Boolean,
      default: true,
    },
    isTampered: {
      type: Boolean,
      default: false,
    },
    aiFlags: [aiFlagSchema],
    humanVerificationStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'DEFICIENCY_RAISED', 'OVERRIDDEN'],
      default: 'PENDING',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    officerNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const DocumentVerification = mongoose.model('DocumentVerification', documentVerificationSchema);

export default DocumentVerification;
