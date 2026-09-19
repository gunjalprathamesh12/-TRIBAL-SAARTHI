import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
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
    docType: {
      type: String,
      required: true,
      enum: [
        'ST_CERTIFICATE',
        'INCOME_CERTIFICATE',
        'AADHAAR_CARD',
        'ACADEMIC_MARKSHEET',
        'DEGREE_CERTIFICATE',
        'ADMISSION_BONAFIDE',
        'INSTITUTION_VERIFICATION',
        'BANK_PASSBOOK_CANCELLED_CHEQUE',
        'DISABILITY_CERTIFICATE',
        'RESEARCH_PROPOSAL',
        'OVERSEAS_OFFER_LETTER',
        'PASSPORT_COPY',
        'FEE_RECEIPT',
        'OTHER',
      ],
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    documentHash: {
      type: String,
      required: true,
      index: true, // SHA-256 hash for duplicate/fraud detection
    },
    status: {
      type: String,
      enum: [
        'UPLOADED',
        'OCR_PROCESSING',
        'VERIFIED',
        'REJECTED',
        'DEFICIENT',
        'REUPLOAD_REQUIRED',
        'MANUAL_REVIEW',
      ],
      default: 'UPLOADED',
      index: true,
    },
    ocrStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    ocrConfidence: {
      type: Number,
      default: 0,
    },
    version: {
      type: Number,
      default: 1,
    },
    isCurrentVersion: {
      type: Boolean,
      default: true,
    },
    verifierRemarks: {
      type: String,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;
