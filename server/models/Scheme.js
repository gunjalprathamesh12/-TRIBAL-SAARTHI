import mongoose from 'mongoose';

const documentRequirementSchema = new mongoose.Schema({
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
    ],
  },
  title: { type: String, required: true },
  description: { type: String },
  isMandatory: { type: Boolean, default: true },
  maxSizeMB: { type: Number, default: 5 },
  allowedFormats: [{ type: String, default: 'pdf' }],
});

const schemeSchema = new mongoose.Schema(
  {
    schemeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    schemeName: {
      type: String,
      required: true,
      trim: true,
    },
    shortTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    objective: {
      type: String,
    },
    ministry: {
      type: String,
      default: 'Ministry of Tribal Affairs, Government of India',
    },
    schemeType: {
      type: String,
      enum: ['SCHOLARSHIP', 'FELLOWSHIP', 'OVERSEAS_SCHOLARSHIP'],
      default: 'SCHOLARSHIP',
    },
    educationLevels: [
      {
        type: String,
        enum: ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Diploma', 'Undergraduate', 'Postgraduate', 'M.Phil', 'Ph.D', 'Post-Doctoral'],
      },
    ],
    applicableCategory: {
      type: String,
      default: 'ST',
    },
    incomeLimit: {
      type: Number,
      default: 250000,
    },
    maxAgeLimit: {
      type: Number,
      default: 35,
    },
    minAcademicPercentage: {
      type: Number,
      default: 50,
    },
    nationalityCriteria: {
      type: String,
      default: 'Indian',
    },
    financialBenefits: {
      tuitionFeeCovered: { type: Boolean, default: true },
      maintenanceAllowancePerMonth: { type: Number, default: 0 },
      contingencyPerYear: { type: Number, default: 0 },
      bookGrant: { type: Number, default: 0 },
      totalEstimatedAnnualValue: { type: Number, default: 50000 },
      benefitSummary: { type: String },
    },
    documentsRequired: [documentRequirementSchema],
    applicationStartDate: {
      type: Date,
      required: true,
    },
    applicationEndDate: {
      type: Date,
      required: true,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    activeStatus: {
      type: Boolean,
      default: true,
      index: true,
    },
    slotsAvailable: {
      type: Number,
      default: 1000,
    },
    version: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Scheme = mongoose.model('Scheme', schemeSchema);

export default Scheme;
