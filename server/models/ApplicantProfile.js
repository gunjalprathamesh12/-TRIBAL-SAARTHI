import mongoose from 'mongoose';

const applicantProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Personal Details
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Transgender', 'Other'], required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'], default: 'Single' },
    aadhaarMasked: { type: String, default: 'XXXX-XXXX-8921' },
    disabilityStatus: { type: Boolean, default: false },
    disabilityType: { type: String, default: 'None' },
    disabilityPercent: { type: Number, default: 0 },

    // Category & Tribal Demographics
    category: { type: String, default: 'ST', required: true },
    tribeName: { type: String, required: true }, // e.g. Bhil, Gond, Santhal, Munda, Khasi, Bodo
    subTribe: { type: String },
    isPVTG: { type: Boolean, default: false }, // Particularly Vulnerable Tribal Group
    stCertificateNo: { type: String, required: true, index: true },
    stCertificateIssueDate: { type: Date },
    stIssuingAuthority: { type: String, default: 'Sub-Divisional Officer (SDO) / Tehsildar' },

    // Address
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    pincode: { type: String, required: true },
    addressLine: { type: String, required: true },

    // Academic Details
    currentEducationLevel: {
      type: String,
      enum: ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Diploma', 'Undergraduate', 'Postgraduate', 'M.Phil', 'Ph.D', 'Post-Doctoral'],
      required: true,
      index: true,
    },
    courseName: { type: String, required: true },
    specialization: { type: String },
    currentYear: { type: Number, default: 1 },
    rollNumber: { type: String },
    previousExamMarksPercentage: { type: Number, required: true },
    cgpa: { type: Number },
    admissionDate: { type: Date },

    // Institution Details
    institutionName: { type: String, required: true, index: true },
    institutionType: {
      type: String,
      enum: ['Central University', 'State University', 'Premier Institute (IIT/NIT/IIM/AIIMS)', 'Govt College', 'Private University', 'Govt School', 'Recognized School'],
      required: true,
    },
    aisheCode: { type: String, default: 'U-0123' },
    institutionState: { type: String, required: true },
    institutionDistrict: { type: String, required: true },
    isHosteller: { type: Boolean, default: false },

    // Family & Income Details
    annualFamilyIncome: { type: Number, required: true, index: true },
    incomeCertificateNo: { type: String, required: true, index: true },
    incomeCertIssueDate: { type: Date },
    incomeCertIssuingAuthority: { type: String, default: 'Revenue Department / Tehsildar' },
    fatherOccupation: { type: String, default: 'Agriculture' },
    motherOccupation: { type: String, default: 'Homemaker' },

    // Bank & DBT Details
    accountHolderName: { type: String, required: true },
    accountNumberMasked: { type: String, default: 'XXXX XXXX 4821' },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    branchName: { type: String, required: true },
    isAadhaarLinked: { type: Boolean, default: true },
    dbtStatus: { type: String, enum: ['ACTIVE_SEEDED', 'PENDING_SEEDING', 'NOT_LINKED'], default: 'ACTIVE_SEEDED' },

    // Specialized profiles: Research (NFST)
    researchTopic: { type: String },
    guideName: { type: String },
    phdRegistrationNo: { type: String },
    netJrfStatus: { type: String, enum: ['UGC-NET', 'CSIR-NET', 'GATE', 'NOT_APPLICABLE'], default: 'NOT_APPLICABLE' },

    // Specialized profiles: Overseas (NOS)
    overseasUniversity: { type: String },
    overseasCountry: { type: String },
    qsWorldRank: { type: Number },
    foreignCourseDurationMonths: { type: Number },
    unconditionalOfferLetterRef: { type: String },
  },
  {
    timestamps: true,
  }
);

const ApplicantProfile = mongoose.model('ApplicantProfile', applicantProfileSchema);

export default ApplicantProfile;
