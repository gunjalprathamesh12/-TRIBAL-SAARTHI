import mongoose from 'mongoose';

const disbursementSchema = new mongoose.Schema(
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
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      index: true,
    },
    sanctionOrderNo: {
      type: String,
      required: true,
      index: true,
    },
    batchId: {
      type: String,
      default: () => `DBT-BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      index: true,
    },
    installmentNumber: {
      type: Number,
      default: 1,
    },
    amount: {
      type: Number,
      required: true,
    },
    beneficiaryName: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
    accountNumberMasked: {
      type: String,
      required: true, // synthetic masked representation e.g. XXXX XXXX 4821
    },
    dbtMode: {
      type: String,
      enum: ['Aadhaar Payment Bridge (APBS)', 'PFMS-NEFT', 'PFMS-RTGS'],
      default: 'Aadhaar Payment Bridge (APBS)',
    },
    status: {
      type: String,
      enum: ['SANCTIONED', 'PROCESSING', 'DISBURSED', 'FAILED', 'ON_HOLD'],
      default: 'SANCTIONED',
      index: true,
    },
    utrNumber: {
      type: String,
      index: true,
    },
    pfmsReference: {
      type: String,
      default: () => `PFMS-MOTA-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    disbursedDate: {
      type: Date,
    },
    remarks: {
      type: String,
      default: 'Direct Benefit Transfer sanction generated successfully',
    },
  },
  {
    timestamps: true,
  }
);

const Disbursement = mongoose.model('Disbursement', disbursementSchema);

export default Disbursement;
