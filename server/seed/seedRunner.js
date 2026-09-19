import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApplicantProfile from '../models/ApplicantProfile.js';
import Scheme from '../models/Scheme.js';
import SchemeRule from '../models/SchemeRule.js';
import Application from '../models/Application.js';
import Document from '../models/Document.js';
import DocumentVerification from '../models/DocumentVerification.js';
import EligibilityResult from '../models/EligibilityResult.js';
import Deficiency from '../models/Deficiency.js';
import Selection from '../models/Selection.js';
import Disbursement from '../models/Disbursement.js';
import Notification from '../models/Notification.js';
import Grievance from '../models/Grievance.js';
import AuditLog from '../models/AuditLog.js';
import { calculateDocumentHash } from '../services/ai/ocrService.js';

dotenv.config();

const indianTribes = [
  'Santhal', 'Bhil', 'Gond', 'Munda', 'Oraon', 'Khasi', 'Garo', 'Bodo',
  'Mizo', 'Ho', 'Kol', 'Korku', 'Chenchu', 'Irula', 'Toda', 'Bhutia',
];

const indianStates = [
  { state: 'Jharkhand', districts: ['Ranchi', 'Dumka', 'East Singhbhum', 'Gumla', 'Khunti'] },
  { state: 'Odisha', districts: ['Mayurbhanj', 'Sundargarh', 'Koraput', 'Rayagada', 'Keonjhar'] },
  { state: 'Madhya Pradesh', districts: ['Jhabua', 'Alirajpur', 'Dhar', 'Mandla', 'Dindori'] },
  { state: 'Chhattisgarh', districts: ['Bastar', 'Dantewada', 'Kanker', 'Surguja', 'Jashpur'] },
  { state: 'Maharashtra', districts: ['Nandurbar', 'Gadchiroli', 'Palghar', 'Nashik', 'Amravati'] },
  { state: 'Rajasthan', districts: ['Banswara', 'Dungarpur', 'Pratapgarh', 'Udaipur'] },
  { state: 'Assam', districts: ['Kokrajhar', 'Karbi Anglong', 'Dima Hasao', 'Baksa'] },
  { state: 'Meghalaya', districts: ['East Khasi Hills', 'West Garo Hills', 'Ri-Bhoi'] },
];

const firstNames = [
  'Rahul', 'Anjali', 'Vikram', 'Pooja', 'Sunil', 'Kavita', 'Sanjay', 'Rina',
  'Deepak', 'Manju', 'Birsa', 'Sita', 'Arjun', 'Laxmi', 'Karan', 'Priyanka',
  'Amit', 'Geeta', 'Rohan', 'Neeta', 'Hemant', 'Sunita', 'Rajesh', 'Usha',
  'Devendra', 'Kamala', 'Ganesh', 'Mamata', 'Manoj', 'Asha', 'Shyam', 'Tara',
  'Pradeep', 'Sarita', 'Ajay', 'Meena', 'Mahesh', 'Bhavna', 'Suresh', 'Anita',
  'Dinesh', 'Radha', 'Kishore', 'Nirmala', 'Naresh', 'Rekha', 'Prakash', 'Shanti',
  'Vijay', 'Kalyani',
];

const institutions = [
  { name: 'National Institute of Technology (NIT) Jamshedpur', type: 'Premier Institute (IIT/NIT/IIM/AIIMS)', aishe: 'U-0245' },
  { name: 'Indian Institute of Technology (IIT) Delhi', type: 'Premier Institute (IIT/NIT/IIM/AIIMS)', aishe: 'U-0123' },
  { name: 'Jawaharlal Nehru University (JNU), New Delhi', type: 'Central University', aishe: 'U-0098' },
  { name: 'Ranchi University, Jharkhand', type: 'State University', aishe: 'U-0312' },
  { name: 'Tribal University of Andhra Pradesh', type: 'Central University', aishe: 'U-0891' },
  { name: 'North-Eastern Hill University (NEHU), Shillong', type: 'Central University', aishe: 'U-0421' },
  { name: 'Government Autonomous College, Rourkela', type: 'Govt College', aishe: 'C-1892' },
  { name: 'Indira Gandhi National Tribal University (IGNTU), Amarkantak', type: 'Central University', aishe: 'U-0672' },
  { name: 'Eklavya Model Residential School, Jhabua', type: 'Govt School', aishe: 'S-9912' },
  { name: 'St. Xavier’s College, Ranchi', type: 'Govt College', aishe: 'C-2341' },
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tribal_saarthi');
    console.log('[Seed] Connected.');

    console.log('[Seed] Clearing existing demo collections...');
    await Promise.all([
      User.deleteMany({}),
      ApplicantProfile.deleteMany({}),
      Scheme.deleteMany({}),
      SchemeRule.deleteMany({}),
      Application.deleteMany({}),
      Document.deleteMany({}),
      DocumentVerification.deleteMany({}),
      EligibilityResult.deleteMany({}),
      Deficiency.deleteMany({}),
      Selection.deleteMany({}),
      Disbursement.deleteMany({}),
      Notification.deleteMany({}),
      Grievance.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Seed] Cleared collections.');

    // 1. CREATE OFFICIAL SCHEMES
    console.log('[Seed] Inserting 5 Official MoTA Schemes...');
    const schemesData = [
      {
        schemeCode: 'PRE_MATRIC_ST',
        schemeName: 'Pre-Matric Scholarship for Scheduled Tribe Students (Class IX & X)',
        shortTitle: 'Pre-Matric ST Scholarship',
        description: 'Centrally sponsored scheme to support ST students studying in classes IX and X to minimize dropouts and transition smoothly to secondary education.',
        objective: 'To support parents of ST children for education of their wards studying in classes IX and X so that the incidence of drop-out is minimized.',
        schemeType: 'SCHOLARSHIP',
        educationLevels: ['Class 9', 'Class 10'],
        applicableCategory: 'ST',
        incomeLimit: 250000,
        maxAgeLimit: 18,
        minAcademicPercentage: 45,
        nationalityCriteria: 'Indian',
        financialBenefits: {
          tuitionFeeCovered: true,
          maintenanceAllowancePerMonth: 350,
          contingencyPerYear: 1000,
          bookGrant: 750,
          totalEstimatedAnnualValue: 6000,
          benefitSummary: 'Day Scholars: Rs. 3500/year; Hostellers: Rs. 7000/year + Book grant',
        },
        documentsRequired: [
          { docType: 'ST_CERTIFICATE', title: 'ST Caste Certificate', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf', 'jpg'] },
          { docType: 'INCOME_CERTIFICATE', title: 'Annual Family Income Certificate', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
          { docType: 'AADHAAR_CARD', title: 'Aadhaar / Student Identity Verification', isMandatory: true, maxSizeMB: 2, allowedFormats: ['pdf', 'jpg'] },
          { docType: 'ACADEMIC_MARKSHEET', title: 'Previous Class Passing Marksheet', isMandatory: true, maxSizeMB: 4, allowedFormats: ['pdf'] },
          { docType: 'BANK_PASSBOOK_CANCELLED_CHEQUE', title: 'Bank Passbook Leaf (Aadhaar Seeded)', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf', 'jpg'] },
        ],
        applicationStartDate: new Date('2025-07-01'),
        applicationEndDate: new Date('2026-10-31'),
        academicYear: '2025-2026',
        activeStatus: true,
        slotsAvailable: 50000,
      },
      {
        schemeCode: 'POST_MATRIC_ST',
        schemeName: 'Post-Matric Scholarship for Scheduled Tribe Students (PMS-ST)',
        shortTitle: 'Post-Matric ST Scholarship',
        description: 'Comprehensive financial assistance to ST students studying at post-secondary stages from Class XI to Post-Graduate levels.',
        objective: 'To provide financial assistance to Scheduled Tribe students studying at post-matriculation or post-secondary stages to enable them to complete their education.',
        schemeType: 'SCHOLARSHIP',
        educationLevels: ['Class 11', 'Class 12', 'Diploma', 'Undergraduate', 'Postgraduate'],
        applicableCategory: 'ST',
        incomeLimit: 250000,
        maxAgeLimit: 30,
        minAcademicPercentage: 50,
        nationalityCriteria: 'Indian',
        financialBenefits: {
          tuitionFeeCovered: true,
          maintenanceAllowancePerMonth: 1200,
          contingencyPerYear: 3000,
          bookGrant: 2000,
          totalEstimatedAnnualValue: 35000,
          benefitSummary: 'Full compulsory non-refundable fees + Monthly maintenance allowance (Group 1-4)',
        },
        documentsRequired: [
          { docType: 'ST_CERTIFICATE', title: 'ST Caste Certificate', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf', 'jpg'] },
          { docType: 'INCOME_CERTIFICATE', title: 'Income Certificate from Revenue Authority', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
          { docType: 'ACADEMIC_MARKSHEET', title: 'Qualifying Examination Marksheet', isMandatory: true, maxSizeMB: 5, allowedFormats: ['pdf'] },
          { docType: 'ADMISSION_BONAFIDE', title: 'Current Year Bonafide / Admission Receipt', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
          { docType: 'BANK_PASSBOOK_CANCELLED_CHEQUE', title: 'Bank Passbook Leaf (Aadhaar Linked)', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
        ],
        applicationStartDate: new Date('2025-07-15'),
        applicationEndDate: new Date('2026-11-30'),
        academicYear: '2025-2026',
        activeStatus: true,
        slotsAvailable: 150000,
      },
      {
        schemeCode: 'TOP_CLASS_ST',
        schemeName: 'National Scholarship for Higher Education of ST Students (Top Class Education)',
        shortTitle: 'Top Class Education for ST',
        description: 'Full financial support for meritorious ST students securing admission in 250+ notified premier institutions including IITs, NITs, IIMs, AIIMS, and NLUs.',
        objective: 'To encourage meritorious ST students to pursue quality higher education in premier institutes across India.',
        schemeType: 'SCHOLARSHIP',
        educationLevels: ['Undergraduate', 'Postgraduate'],
        applicableCategory: 'ST',
        incomeLimit: 600000,
        maxAgeLimit: 30,
        minAcademicPercentage: 60,
        nationalityCriteria: 'Indian',
        financialBenefits: {
          tuitionFeeCovered: true,
          maintenanceAllowancePerMonth: 3000,
          contingencyPerYear: 5000,
          bookGrant: 5000,
          totalEstimatedAnnualValue: 220000,
          benefitSummary: 'Full Tuition Fee waiver + Living expenses Rs. 3,000/mo + Books & Stationery Rs. 5,000/yr + Computer grant Rs. 45,000 (one time)',
        },
        documentsRequired: [
          { docType: 'ST_CERTIFICATE', title: 'Valid ST Caste Certificate', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
          { docType: 'INCOME_CERTIFICATE', title: 'Income Certificate (Family Income <= 6.0 Lakh)', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
          { docType: 'ADMISSION_BONAFIDE', title: 'Premier Institute Admission Letter & Fee Structure', isMandatory: true, maxSizeMB: 5, allowedFormats: ['pdf'] },
          { docType: 'ACADEMIC_MARKSHEET', title: 'Class XII / Graduation Passing Marksheet', isMandatory: true, maxSizeMB: 4, allowedFormats: ['pdf'] },
          { docType: 'BANK_PASSBOOK_CANCELLED_CHEQUE', title: 'Bank Passbook Copy', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
        ],
        applicationStartDate: new Date('2025-08-01'),
        applicationEndDate: new Date('2026-10-31'),
        academicYear: '2025-2026',
        activeStatus: true,
        slotsAvailable: 1000,
      },
      {
        schemeCode: 'NFST_FELLOWSHIP',
        schemeName: 'National Fellowship for Higher Education of ST Students (NFST)',
        shortTitle: 'National Fellowship for ST (NFST)',
        description: 'Prestigious fellowship for ST students pursuing regular, full-time M.Phil and Ph.D degrees in Sciences, Humanities, Engineering, and Social Sciences.',
        objective: 'To provide financial assistance to ST candidates to pursue higher studies leading to M.Phil and Ph.D degrees in Indian Universities/Institutions.',
        schemeType: 'FELLOWSHIP',
        educationLevels: ['M.Phil', 'Ph.D', 'Post-Doctoral'],
        applicableCategory: 'ST',
        incomeLimit: 800000,
        maxAgeLimit: 36,
        minAcademicPercentage: 55,
        nationalityCriteria: 'Indian',
        financialBenefits: {
          tuitionFeeCovered: true,
          maintenanceAllowancePerMonth: 37000, // JRF: 37,000/mo, SRF: 42,000/mo
          contingencyPerYear: 12000,
          bookGrant: 10000,
          totalEstimatedAnnualValue: 468000,
          benefitSummary: 'JRF: Rs. 37,000/month; SRF: Rs. 42,000/month + Contingency Humanities Rs. 12,000/yr (Science Rs. 25,000/yr) + HRA',
        },
        documentsRequired: [
          { docType: 'ST_CERTIFICATE', title: 'ST Caste Certificate', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
          { docType: 'ACADEMIC_MARKSHEET', title: 'Master’s Degree Marksheet & Degree Certificate', isMandatory: true, maxSizeMB: 5, allowedFormats: ['pdf'] },
          { docType: 'ADMISSION_BONAFIDE', title: 'Ph.D / M.Phil Registration Order & Bonafide', isMandatory: true, maxSizeMB: 5, allowedFormats: ['pdf'] },
          { docType: 'RESEARCH_PROPOSAL', title: 'Research Synopsis / Proposal approved by Guide', isMandatory: true, maxSizeMB: 10, allowedFormats: ['pdf'] },
          { docType: 'BANK_PASSBOOK_CANCELLED_CHEQUE', title: 'Aadhaar Seeded Bank Details', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
        ],
        applicationStartDate: new Date('2025-06-01'),
        applicationEndDate: new Date('2026-11-15'),
        academicYear: '2025-2026',
        activeStatus: true,
        slotsAvailable: 750,
      },
      {
        schemeCode: 'NOS_OVERSEAS',
        schemeName: 'National Overseas Scholarship for Scheduled Tribe Candidates (NOS)',
        shortTitle: 'National Overseas Scholarship (NOS)',
        description: 'Supports high-achieving ST students to pursue Post-Graduation, Ph.D and Post-Doctoral studies in prestigious accredited institutions abroad (QS Top 500).',
        objective: 'To facilitate low and middle income ST students to obtain higher education abroad in accredited universities.',
        schemeType: 'OVERSEAS_SCHOLARSHIP',
        educationLevels: ['Postgraduate', 'Ph.D', 'Post-Doctoral'],
        applicableCategory: 'ST',
        incomeLimit: 600000,
        maxAgeLimit: 35,
        minAcademicPercentage: 60,
        nationalityCriteria: 'Indian',
        financialBenefits: {
          tuitionFeeCovered: true,
          maintenanceAllowancePerMonth: 120000,
          contingencyPerYear: 90000,
          bookGrant: 60000,
          totalEstimatedAnnualValue: 1850000,
          benefitSummary: 'Full Overseas Tuition + Annual Maintenance Allowance USD 15,400 (GBP 9,900) + Air Passage + Visa Fees + Health Insurance',
        },
        documentsRequired: [
          { docType: 'ST_CERTIFICATE', title: 'ST Certificate from Competent Authority', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
          { docType: 'INCOME_CERTIFICATE', title: 'Income Certificate (Total Family Income <= 6.0 Lakh)', isMandatory: true, maxSizeMB: 3, allowedFormats: ['pdf'] },
          { docType: 'OVERSEAS_OFFER_LETTER', title: 'Unconditional Foreign University Admission Offer (QS <= 500)', isMandatory: true, maxSizeMB: 5, allowedFormats: ['pdf'] },
          { docType: 'ACADEMIC_MARKSHEET', title: 'Degree Marksheets & Certificates (Min 60%)', isMandatory: true, maxSizeMB: 6, allowedFormats: ['pdf'] },
          { docType: 'PASSPORT_COPY', title: 'Valid Indian Passport Copy', isMandatory: true, maxSizeMB: 4, allowedFormats: ['pdf'] },
        ],
        applicationStartDate: new Date('2025-05-01'),
        applicationEndDate: new Date('2026-10-31'),
        academicYear: '2025-2026',
        activeStatus: true,
        slotsAvailable: 20,
      },
    ];

    const insertedSchemes = await Scheme.insertMany(schemesData);
    console.log(`[Seed] Created ${insertedSchemes.length} schemes.`);

    // 2. CREATE CONFIGURABLE RULES FOR EACH SCHEME
    console.log('[Seed] Inserting Configurable Scheme Rules...');
    const rulesToInsert = [];

    for (const scheme of insertedSchemes) {
      // Mandatory Category Rule
      rulesToInsert.push({
        schemeId: scheme._id,
        ruleCode: `${scheme.schemeCode}_CAT_01`,
        ruleName: 'Mandatory Scheduled Tribe (ST) Category Verification',
        description: 'Applicant must belong to recognized Scheduled Tribe community',
        field: 'category',
        operator: '==',
        expectedValue: 'ST',
        actionOnFail: 'NOT_ELIGIBLE',
        failureMessage: 'Applicant does not belong to the Scheduled Tribe (ST) category.',
        successMessage: 'ST Category verified successfully.',
        isMandatory: true,
        meritWeight: 10,
        priorityOrder: 1,
      });

      // Income Threshold Rule
      rulesToInsert.push({
        schemeId: scheme._id,
        ruleCode: `${scheme.schemeCode}_INC_02`,
        ruleName: `Annual Family Income Threshold (<= Rs. ${scheme.incomeLimit.toLocaleString('en-IN')})`,
        description: 'Total family income from all sources must not exceed prescribed scheme ceiling',
        field: 'annualFamilyIncome',
        operator: '<=',
        expectedValue: scheme.incomeLimit,
        actionOnFail: 'NOT_ELIGIBLE',
        failureMessage: `Annual family income exceeds scheme ceiling of Rs. ${scheme.incomeLimit.toLocaleString('en-IN')}/-.`,
        successMessage: `Income verified within statutory ceiling (<= Rs. ${scheme.incomeLimit.toLocaleString('en-IN')}/-).`,
        isMandatory: true,
        meritWeight: 15,
        priorityOrder: 2,
      });

      // Education Level Inclusion Rule
      rulesToInsert.push({
        schemeId: scheme._id,
        ruleCode: `${scheme.schemeCode}_EDU_03`,
        ruleName: 'Eligible Education Level Criterion',
        description: 'Course level must be recognized under this scheme',
        field: 'currentEducationLevel',
        operator: 'IN',
        expectedValue: scheme.educationLevels,
        actionOnFail: 'NOT_ELIGIBLE',
        failureMessage: `Education level is not supported under ${scheme.shortTitle}.`,
        successMessage: 'Current education level is fully recognized.',
        isMandatory: true,
        meritWeight: 15,
        priorityOrder: 3,
      });

      // Academic Minimum Score
      rulesToInsert.push({
        schemeId: scheme._id,
        ruleCode: `${scheme.schemeCode}_MARKS_04`,
        ruleName: `Minimum Academic Marks Requirement (>= ${scheme.minAcademicPercentage}%)`,
        description: 'Previous qualifying examination score must satisfy minimum performance benchmark',
        field: 'previousExamMarksPercentage',
        operator: '>=',
        expectedValue: scheme.minAcademicPercentage,
        actionOnFail: 'NEEDS_HUMAN_REVIEW',
        failureMessage: `Marks percentage is below recommended benchmark of ${scheme.minAcademicPercentage}%. Requires special committee review.`,
        successMessage: `Academic performance benchmarks satisfied (>= ${scheme.minAcademicPercentage}%).`,
        isMandatory: false,
        meritWeight: 20,
        priorityOrder: 4,
      });

      // Mandatory Documents Rule
      rulesToInsert.push({
        schemeId: scheme._id,
        ruleCode: `${scheme.schemeCode}_DOCS_05`,
        ruleName: 'Mandatory Document Repository Verification',
        description: 'All mandatory certificates specified by MoTA must be uploaded and verified',
        field: 'hasMandatoryDocuments',
        operator: '==',
        expectedValue: true,
        actionOnFail: 'NEEDS_HUMAN_REVIEW',
        failureMessage: 'One or more mandatory documents are missing from application package.',
        successMessage: 'All mandatory statutory documents uploaded.',
        isMandatory: true,
        meritWeight: 10,
        priorityOrder: 5,
      });

      // Specific scheme rules
      if (scheme.schemeCode === 'NOS_OVERSEAS') {
        rulesToInsert.push({
          schemeId: scheme._id,
          ruleCode: 'NOS_QS_RANK_06',
          ruleName: 'QS World University Ranking Benchmark (<= 500)',
          description: 'Foreign university must be ranked within top 500 in latest QS World Rankings',
          field: 'qsWorldRank',
          operator: '<=',
          expectedValue: 500,
          actionOnFail: 'NOT_ELIGIBLE',
          failureMessage: 'Foreign university is not ranked within the top 500 QS World University Rankings.',
          successMessage: 'Foreign university satisfies top 500 QS ranking requirement.',
          isMandatory: true,
          meritWeight: 25,
          priorityOrder: 6,
        });
      }
    }

    await SchemeRule.insertMany(rulesToInsert);
    console.log(`[Seed] Created ${rulesToInsert.length} configurable scheme rules.`);

    // 3. CREATE DEMO USERS (ADMIN, OFFICERS, APPLICANTS)
    console.log('[Seed] Creating demo users and credentials...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Demo@123', salt);

    const primaryDemoUsers = [
      {
        name: 'Rahul Kumar (Applicant Demo)',
        email: 'applicant@demo.com',
        mobile: '9876543210',
        password: defaultPasswordHash,
        role: 'APPLICANT',
        department: 'Tribal Student Portal',
        designation: 'Scholarship Applicant',
        isDemoAccount: true,
      },
      {
        name: 'Dr. Rameshwar Oraon (Verification Officer)',
        email: 'verifier@demo.com',
        mobile: '9876543211',
        password: defaultPasswordHash,
        role: 'VERIFICATION_OFFICER',
        department: 'Document Scrutiny Directorate, MoTA',
        designation: 'Senior Verification Officer',
        isDemoAccount: true,
      },
      {
        name: 'Smt. Anusuiya Uikey (Scrutiny Officer)',
        email: 'scrutiny@demo.com',
        mobile: '9876543212',
        password: defaultPasswordHash,
        role: 'SCRUTINY_OFFICER',
        department: 'Scholarship Scrutiny Cell, MoTA',
        designation: 'Assistant Director (Scrutiny)',
        isDemoAccount: true,
      },
      {
        name: 'Prof. Arjun Munda (Selection Committee)',
        email: 'committee@demo.com',
        mobile: '9876543213',
        password: defaultPasswordHash,
        role: 'SELECTION_COMMITTEE',
        department: 'National Tribal Selection Board',
        designation: 'Selection Committee Chairperson',
        isDemoAccount: true,
      },
      {
        name: 'Shri Sanjeev Kumar (Finance & DBT Officer)',
        email: 'finance@demo.com',
        mobile: '9876543214',
        password: defaultPasswordHash,
        role: 'FINANCE_OFFICER',
        department: 'Integrated Finance Division (PFMS / DBT)',
        designation: 'Deputy Controller of Accounts',
        isDemoAccount: true,
      },
      {
        name: 'Admin User (System Administrator)',
        email: 'admin@demo.com',
        mobile: '9876543215',
        password: defaultPasswordHash,
        role: 'ADMIN',
        department: 'Information Technology Division, MoTA',
        designation: 'Senior System Administrator',
        isDemoAccount: true,
      },
      {
        name: 'Super Admin',
        email: 'superadmin@demo.com',
        mobile: '9876543216',
        password: defaultPasswordHash,
        role: 'SUPER_ADMIN',
        department: 'Ministry of Tribal Affairs',
        designation: 'Joint Secretary (Education)',
        isDemoAccount: true,
      },
    ];

    const insertedPrimaryUsers = await User.insertMany(primaryDemoUsers);
    const demoApplicantUser = insertedPrimaryUsers.find((u) => u.email === 'applicant@demo.com');
    const demoVerifierUser = insertedPrimaryUsers.find((u) => u.email === 'verifier@demo.com');

    // Create 10 Additional Verification Officers
    const additionalOfficers = [];
    for (let i = 1; i <= 10; i++) {
      additionalOfficers.push({
        name: `Officer ${i} (MoTA State Cell)`,
        email: `officer${i}@demo.com`,
        mobile: `98765000${String(i).padStart(2, '0')}`,
        password: defaultPasswordHash,
        role: i % 2 === 0 ? 'VERIFICATION_OFFICER' : 'SCRUTINY_OFFICER',
        department: 'State Tribal Welfare Directorate',
        designation: 'District Welfare Officer',
        isDemoAccount: true,
      });
    }
    const insertedOfficers = await User.insertMany(additionalOfficers);

    // Create 50 Synthetic Applicants
    console.log('[Seed] Generating 50 synthetic ST applicants...');
    const applicantsToInsert = [];
    for (let i = 0; i < 50; i++) {
      const fn = firstNames[i % firstNames.length];
      const tribe = indianTribes[i % indianTribes.length];
      const stateObj = indianStates[i % indianStates.length];
      const district = stateObj.districts[i % stateObj.districts.length];

      applicantsToInsert.push({
        name: `${fn} ${tribe}`,
        email: `student${i + 1}@demo.com`,
        mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: defaultPasswordHash,
        role: 'APPLICANT',
        department: 'Tribal Student Portal',
        designation: 'Scholarship Applicant',
        isDemoAccount: true,
      });
    }

    const insertedApplicants = await User.insertMany(applicantsToInsert);
    console.log(`[Seed] Created ${insertedApplicants.length} applicant user accounts.`);

    // 4. CREATE APPLICANT PROFILES
    console.log('[Seed] Creating applicant demographic & academic profiles...');
    const profilesToInsert = [];
    const allApplicants = [demoApplicantUser, ...insertedApplicants];

    for (let i = 0; i < allApplicants.length; i++) {
      const user = allApplicants[i];
      const tribe = indianTribes[i % indianTribes.length];
      const stateObj = indianStates[i % indianStates.length];
      const district = stateObj.districts[i % stateObj.districts.length];
      const inst = institutions[i % institutions.length];
      const isPvtg = i % 7 === 0;
      const hasDisability = i % 15 === 0;

      // Rotate levels: School, UG, PG, PhD
      let eduLevel = 'Undergraduate';
      let course = 'Bachelor of Science';
      let marks = 65 + (i % 30);
      let income = 90000 + (i % 6) * 45000;
      let netJrf = 'NOT_APPLICABLE';
      let overseasUni = '';
      let qsRank = 0;

      if (i % 5 === 0) {
        eduLevel = 'Class 10';
        course = 'Secondary School (Class X)';
        income = 110000;
      } else if (i % 5 === 1) {
        eduLevel = 'Undergraduate';
        course = 'B.Tech in Computer Science';
      } else if (i % 5 === 2) {
        eduLevel = 'Postgraduate';
        course = 'M.Sc in Environmental Science';
      } else if (i % 5 === 3) {
        eduLevel = 'Ph.D';
        course = 'Ph.D in Tribal Ethnography & Livelihood';
        netJrf = 'UGC-NET';
      } else if (i % 5 === 4) {
        eduLevel = 'Postgraduate';
        course = 'M.Sc in Applied Mathematics';
        overseasUni = 'University of Manchester, UK';
        qsRank = 32;
        income = 380000;
      }

      profilesToInsert.push({
        userId: user._id,
        fullName: user.name,
        dob: new Date(2000 + (i % 6), (i % 12), 10 + (i % 18)),
        gender: i % 2 === 0 ? 'Female' : 'Male',
        fatherName: `Late/Shri Father of ${user.name.split(' ')[0]}`,
        motherName: `Smt. Devi ${tribe}`,
        category: 'ST',
        tribeName: tribe,
        isPVTG: isPvtg,
        stCertificateNo: `ST/${stateObj.state.slice(0, 2).toUpperCase()}/2023/${Math.floor(100000 + Math.random() * 900000)}`,
        stCertificateIssueDate: new Date('2022-04-12'),
        state: stateObj.state,
        district,
        pincode: '834001',
        addressLine: `Vill/Post ${district}, District ${stateObj.state}`,
        currentEducationLevel: eduLevel,
        courseName: course,
        previousExamMarksPercentage: marks,
        cgpa: Number((marks / 9.5).toFixed(2)),
        institutionName: inst.name,
        institutionType: inst.type,
        aisheCode: inst.aishe,
        institutionState: stateObj.state,
        institutionDistrict: district,
        annualFamilyIncome: income,
        incomeCertificateNo: `INC/2024/${Math.floor(10000 + Math.random() * 90000)}`,
        incomeCertIssueDate: new Date('2024-05-10'),
        accountHolderName: user.name,
        accountNumberMasked: `XXXX XXXX ${String(4000 + i).slice(-4)}`,
        ifscCode: 'SBIN0001234',
        bankName: 'State Bank of India',
        branchName: `${district} Main Branch`,
        disabilityStatus: hasDisability,
        disabilityType: hasDisability ? 'Locomotor Disability' : 'None',
        disabilityPercent: hasDisability ? 45 : 0,
        netJrfStatus: netJrf,
        overseasUniversity: overseasUni,
        qsWorldRank: qsRank,
      });
    }

    const insertedProfiles = await ApplicantProfile.insertMany(profilesToInsert);
    console.log(`[Seed] Created ${insertedProfiles.length} applicant profiles.`);

    // Map profiles by userId for quick lookup
    const profileMap = {};
    for (const p of insertedProfiles) {
      profileMap[p.userId.toString()] = p;
    }

    // 5. CREATE 75 APPLICATIONS SPANNING ALL STAGES & SPECIAL DEMO SCENARIOS
    console.log('[Seed] Generating 75 realistic applications across all workflow stages...');
    const applicationsToInsert = [];
    const stages = [
      { status: 'SUBMITTED', stage: 'Document Verification' },
      { status: 'UNDER_VERIFICATION', stage: 'Document Verification' },
      { status: 'DEFICIENCY_RAISED', stage: 'Deficiency Resolution' },
      { status: 'CORRECTION_SUBMITTED', stage: 'Document Verification' },
      { status: 'SCRUTINY_PENDING', stage: 'Eligibility & Scrutiny' },
      { status: 'SELECTION_REVIEW', stage: 'Selection Committee Review' },
      { status: 'SHORTLISTED', stage: 'Selection Committee Review' },
      { status: 'SANCTIONED', stage: 'Sanction Order Processing' },
      { status: 'DISBURSEMENT_PENDING', stage: 'Direct Benefit Transfer (DBT)' },
      { status: 'DISBURSED', stage: 'Award Disbursed / Completed' },
      { status: 'REJECTED', stage: 'Application Rejected' },
    ];

    for (let i = 0; i < 75; i++) {
      const applicantUser = allApplicants[i % allApplicants.length];
      const profile = profileMap[applicantUser._id.toString()];
      const scheme = insertedSchemes[i % insertedSchemes.length];
      const stageConfig = stages[i % stages.length];

      // Assign realistic AI summary
      let riskLevel = 'LOW';
      let recommendedQueue = 'LOW_REVIEW_EFFORT';
      let flagsCount = 0;

      if (stageConfig.status === 'DEFICIENCY_RAISED') {
        riskLevel = 'CRITICAL';
        recommendedQueue = 'MANUAL_REVIEW';
        flagsCount = 2;
      } else if (stageConfig.status === 'UNDER_VERIFICATION' && i % 3 === 0) {
        riskLevel = 'HIGH';
        recommendedQueue = 'ATTENTION_REQUIRED';
        flagsCount = 1;
      } else if (i % 4 === 0) {
        riskLevel = 'MEDIUM';
        recommendedQueue = 'NORMAL_REVIEW';
      }

      const year = 2025;
      const appNumber = `TS-${year}-${scheme.schemeCode}-${String(1000 + i).padStart(4, '0')}`;
      const sanctionAmount = scheme.financialBenefits?.totalEstimatedAnnualValue || 50000;

      applicationsToInsert.push({
        applicationNumber: appNumber,
        applicantId: applicantUser._id,
        profileId: profile._id,
        schemeId: scheme._id,
        academicYear: '2025-2026',
        status: stageConfig.status,
        currentStage: stageConfig.stage,
        wizardStepCompleted: 10,
        submissionDate: new Date(Date.now() - (75 - i) * 24 * 60 * 60 * 1000),
        aiVerificationSummary: {
          overallRiskLevel: riskLevel,
          recommendedQueue,
          confidenceScore: 97.5 - flagsCount * 4,
          flagsCount,
          lastEvaluatedAt: new Date(),
          aiSummaryNote:
            flagsCount > 0
              ? `AI-assisted review identified ${flagsCount} discrepancy flag(s) requiring human verification.`
              : 'All statutory rules and document checks satisfied.',
        },
        eligibilitySummary: {
          isEligible: stageConfig.status !== 'REJECTED',
          decision: stageConfig.status === 'REJECTED' ? 'NOT_ELIGIBLE' : 'ELIGIBLE',
          meritScore: 70 + (i % 25),
          passedRulesCount: 4,
          failedRulesCount: stageConfig.status === 'REJECTED' ? 1 : 0,
          summary: stageConfig.status === 'REJECTED' ? 'Not Eligible: Exceeds income limit' : 'Eligible for Selection',
        },
        assignedOfficer: insertedOfficers[i % insertedOfficers.length]._id,
        sanctionOrderNo:
          stageConfig.status === 'SANCTIONED' || stageConfig.status === 'DISBURSED' || stageConfig.status === 'DISBURSEMENT_PENDING'
            ? `MoTA/2026/${scheme.schemeCode}/${String(8000 + i)}`
            : null,
        sanctionAmount:
          stageConfig.status === 'SANCTIONED' || stageConfig.status === 'DISBURSED' || stageConfig.status === 'DISBURSEMENT_PENDING'
            ? sanctionAmount
            : 0,
        statusHistory: [
          {
            status: 'SUBMITTED',
            stageName: 'Application Submitted',
            updatedBy: applicantUser._id,
            officerRole: 'APPLICANT',
            remarks: 'Application submitted successfully with verified digital documents.',
            timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          {
            status: stageConfig.status,
            stageName: stageConfig.stage,
            updatedBy: demoVerifierUser._id,
            officerRole: 'VERIFICATION_OFFICER',
            remarks: `Workflow progressed to ${stageConfig.stage}.`,
            timestamp: new Date(),
          },
        ],
      });
    }

    const insertedApplications = await Application.insertMany(applicationsToInsert);
    console.log(`[Seed] Created ${insertedApplications.length} applications.`);

    // 6. CREATE DOCUMENTS & OCR EXTRACTIONS (150+ documents)
    console.log('[Seed] Generating 150+ synthetic documents with OCR extractions & SHA-256 hashes...');
    const documentsToInsert = [];
    const verificationsToInsert = [];

    for (let i = 0; i < insertedApplications.length; i++) {
      const app = insertedApplications[i];
      const profile = profileMap[app.applicantId.toString()];
      const isMismatchCase = i === 2 || app.status === 'DEFICIENCY_RAISED'; // Intentional Income Mismatch Scenario

      // Document 1: ST Certificate
      const stHash = calculateDocumentHash(`ST_DOC_${app._id}_${i}`);
      const stDoc = new Document({
        applicationId: app._id,
        applicantId: app.applicantId,
        docType: 'ST_CERTIFICATE',
        originalFileName: `${profile.fullName.replace(/\s+/g, '_')}_ST_Certificate.pdf`,
        storedFileName: `st_cert_${app._id}.pdf`,
        fileUrl: `/uploads/st_cert_${app._id}.pdf`,
        fileSizeBytes: 1420500,
        mimeType: 'application/pdf',
        documentHash: stHash,
        status: 'VERIFIED',
        ocrStatus: 'COMPLETED',
        ocrConfidence: 98.4,
      });
      documentsToInsert.push(stDoc);

      verificationsToInsert.push({
        documentId: stDoc._id,
        applicationId: app._id,
        docType: 'ST_CERTIFICATE',
        extractedData: {
          candidateName: profile.fullName,
          dob: profile.dob.toISOString().split('T')[0],
          certificateNumber: profile.stCertificateNo,
          category: 'ST',
          tribe: profile.tribeName,
          issuingAuthority: 'Sub-Divisional Officer (SDO)',
          issueDate: '2022-04-12',
          rawTextSummary: `GOVERNMENT OF ${profile.state.toUpperCase()} - CASTE CERTIFICATE: ${profile.fullName} belongs to ${profile.tribeName} ST community.`,
        },
        fieldConfidences: { candidateName: 99.2, certificateNumber: 98.5, category: 99.0 },
        overallConfidence: 98.4,
        isReadable: true,
        humanVerificationStatus: 'ACCEPTED',
      });

      // Document 2: Income Certificate
      const incHash = calculateDocumentHash(`INC_DOC_${app._id}_${i}`);
      const docIncome = isMismatchCase ? 720000 : profile.annualFamilyIncome;

      const incDoc = new Document({
        applicationId: app._id,
        applicantId: app.applicantId,
        docType: 'INCOME_CERTIFICATE',
        originalFileName: `${profile.fullName.replace(/\s+/g, '_')}_Income_Certificate.pdf`,
        storedFileName: `inc_cert_${app._id}.pdf`,
        fileUrl: `/uploads/inc_cert_${app._id}.pdf`,
        fileSizeBytes: 1120000,
        mimeType: 'application/pdf',
        documentHash: incHash,
        status: isMismatchCase ? 'MANUAL_REVIEW' : 'VERIFIED',
        ocrStatus: 'COMPLETED',
        ocrConfidence: 97.2,
      });
      documentsToInsert.push(incDoc);

      const incFlags = [];
      if (isMismatchCase) {
        incFlags.push({
          code: 'INCOME_MISMATCH',
          type: 'INCOME_MISMATCH',
          severity: 'CRITICAL',
          title: 'Income Inconsistency Identified for Manual Review',
          message: `Application declared income is Rs. ${profile.annualFamilyIncome.toLocaleString('en-IN')}/-, but OCR intelligence extracted Rs. ${docIncome.toLocaleString('en-IN')}/- from the uploaded income certificate.`,
          evidence: {
            expectedValue: profile.annualFamilyIncome,
            extractedValue: docIncome,
            field: 'annualFamilyIncome',
            difference: `Rs. ${(docIncome - profile.annualFamilyIncome).toLocaleString('en-IN')} discrepancy`,
            confidence: 98.6,
          },
        });
      }

      verificationsToInsert.push({
        documentId: incDoc._id,
        applicationId: app._id,
        docType: 'INCOME_CERTIFICATE',
        extractedData: {
          candidateName: profile.fullName,
          certificateNumber: profile.incomeCertificateNo,
          annualIncome: docIncome,
          issuingAuthority: 'Office of the Tahsildar / Revenue Department',
          issueDate: '2024-05-10',
          rawTextSummary: `ANNUAL INCOME CERTIFICATE: Certified annual income of ${profile.fullName} is Rs. ${docIncome.toLocaleString('en-IN')}/-.`,
        },
        fieldConfidences: { candidateName: 98.4, annualIncome: 99.0, certificateNumber: 97.5 },
        overallConfidence: 97.2,
        isReadable: true,
        aiFlags: incFlags,
        humanVerificationStatus: isMismatchCase ? 'PENDING' : 'ACCEPTED',
      });
    }

    await Document.insertMany(documentsToInsert);
    await DocumentVerification.insertMany(verificationsToInsert);
    console.log(`[Seed] Created ${documentsToInsert.length} documents and verifications.`);

    // 7. CREATE 30 DEFICIENCIES
    console.log('[Seed] Generating 30 deficiency records across applications...');
    const deficienciesToInsert = [];
    for (let i = 0; i < 30; i++) {
      const app = insertedApplications[i];
      const isResolved = i % 2 === 0;

      deficienciesToInsert.push({
        deficiencyCode: `DEF-2026-${String(1001 + i).padStart(4, '0')}`,
        applicationId: app._id,
        applicantId: app.applicantId,
        raisedBy: demoVerifierUser._id,
        category: i % 3 === 0 ? 'INCOME_MISMATCH' : i % 3 === 1 ? 'BLURRY_UNREADABLE_DOC' : 'MISSING_DOCUMENT',
        severity: i % 3 === 0 ? 'CRITICAL' : 'HIGH',
        title:
          i % 3 === 0
            ? 'Income Certificate Discrepancy'
            : i % 3 === 1
            ? 'Unreadable / Blurry Marksheet Scan'
            : 'Admission Bonafide Certificate Required',
        description:
          i % 3 === 0
            ? 'Declared family income differs substantially from the figure identified on the Tahsildar certificate.'
            : 'Document image resolution is below threshold; seal and marks table illegible.',
        remediationInstruction:
          i % 3 === 0
            ? 'Upload fresh valid Tahsildar Income Certificate reflecting true FY 2024-25 figures.'
            : 'Upload a clear 200+ DPI color scanned PDF.',
        evidence: {
          field: i % 3 === 0 ? 'annualFamilyIncome' : 'academicMarksheet',
          details: 'Flagged by MoTA AI Document Intelligence Engine',
        },
        status: isResolved ? 'RESOLVED' : 'OPEN',
        deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        correctionSubmission: isResolved
          ? {
              updatedField: 'annualFamilyIncome',
              oldValue: '450000',
              newValue: '220000',
              applicantRemarks: 'Uploaded newly issued valid revenue income certificate. Please re-verify.',
              submittedAt: new Date(),
            }
          : undefined,
      });
    }

    await Deficiency.insertMany(deficienciesToInsert);
    console.log(`[Seed] Created ${deficienciesToInsert.length} deficiencies.`);

    // 8. CREATE SELECTIONS & DISBURSEMENTS (30 Records)
    console.log('[Seed] Generating Selection Committee & DBT Disbursement records...');
    const selectionsToInsert = [];
    const disbursementsToInsert = [];

    const selectedApplications = insertedApplications.filter((a) =>
      ['SHORTLISTED', 'SANCTIONED', 'DISBURSEMENT_PENDING', 'DISBURSED'].includes(a.status)
    );

    for (let i = 0; i < Math.min(30, selectedApplications.length); i++) {
      const app = selectedApplications[i];
      const profile = profileMap[app.applicantId.toString()];
      const scheme = insertedSchemes.find((s) => s._id.toString() === app.schemeId.toString());
      const isDisbursed = app.status === 'DISBURSED';
      const isProcessing = app.status === 'DISBURSEMENT_PENDING';
      const amount = scheme.financialBenefits?.totalEstimatedAnnualValue || 50000;

      selectionsToInsert.push({
        applicationId: app._id,
        schemeId: app.schemeId,
        applicantId: app.applicantId,
        academicPerformanceScore: 34 + (i % 6),
        researchAdmissionScore: 16 + (i % 4),
        schemeSpecificScore: 17 + (i % 3),
        specialVulnerabilityScore: profile.isPVTG ? 18 : 12,
        totalMeritScore: 78 + (i % 20),
        stateRank: i + 1,
        nationalRank: i * 3 + 1,
        quotaCategory: profile.isPVTG ? 'PVTG_ST' : 'GENERAL_ST',
        selectionStatus: 'APPROVED',
        approvedSanctionAmount: amount,
        selectionRemarks: 'Recommended by National Tribal Selection Committee on merit basis.',
        selectedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      });

      const utr = isDisbursed ? `RBI20260318${String(100000 + i)}` : null;

      disbursementsToInsert.push({
        applicationId: app._id,
        applicantId: app.applicantId,
        schemeId: app.schemeId,
        sanctionOrderNo: app.sanctionOrderNo || `MoTA/2026/${scheme.schemeCode}/${String(8000 + i)}`,
        batchId: `DBT-BATCH-2026-${String(101 + (i % 5))}`,
        installmentNumber: 1,
        amount,
        beneficiaryName: profile.fullName,
        bankName: profile.bankName,
        ifscCode: profile.ifscCode,
        accountNumberMasked: profile.accountNumberMasked,
        dbtMode: 'Aadhaar Payment Bridge (APBS)',
        status: isDisbursed ? 'DISBURSED' : isProcessing ? 'PROCESSING' : 'SANCTIONED',
        utrNumber: utr,
        pfmsReference: `PFMS-MOTA-${String(300000 + i)}`,
        disbursedDate: isDisbursed ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null,
        remarks: isDisbursed
          ? 'Direct Benefit Transfer successfully credited to beneficiary Aadhaar linked account.'
          : 'Sanction generated and queued for PFMS payment batch release.',
      });
    }

    await Selection.insertMany(selectionsToInsert);
    await Disbursement.insertMany(disbursementsToInsert);
    console.log(`[Seed] Created ${selectionsToInsert.length} selection records and ${disbursementsToInsert.length} disbursements.`);

    // 9. CREATE NOTIFICATIONS, GRIEVANCES & IMMUTABLE AUDIT LOGS (20+ each)
    console.log('[Seed] Generating Notifications, Grievances, and Audit logs...');
    const notificationsToInsert = [];
    const grievancesToInsert = [];
    const auditLogsToInsert = [];

    for (let i = 0; i < 25; i++) {
      const app = insertedApplications[i];
      const applicantUser = allApplicants[i % allApplicants.length];

      notificationsToInsert.push({
        userId: applicantUser._id,
        title: i % 2 === 0 ? 'Application Status Update' : 'Document Verification Completed',
        message: `Your scholarship application ${app.applicationNumber} has been reviewed by the verification cell.`,
        type: i % 3 === 0 ? 'SUCCESS' : i % 3 === 1 ? 'DEFICIENCY' : 'INFO',
        link: `/applicant/application/${app._id}`,
      });

      grievancesToInsert.push({
        ticketId: `GRV-2026-${String(1001 + i)}`,
        applicantId: applicantUser._id,
        applicationId: app._id,
        category: i % 4 === 0 ? 'DOCUMENT_ISSUE' : i % 4 === 1 ? 'ELIGIBILITY_QUERY' : 'DISBURSEMENT_ISSUE',
        subject: `Query regarding application status for ${app.applicationNumber}`,
        description: 'Kindly update on the expected verification timeline and bank account Aadhaar seeding verification.',
        status: i % 2 === 0 ? 'RESOLVED' : 'OPEN',
        priority: 'NORMAL',
        resolutionRemarks: i % 2 === 0 ? 'Officer verified the bank seeding status via PFMS. All parameters normal.' : undefined,
        resolvedAt: i % 2 === 0 ? new Date() : undefined,
      });

      auditLogsToInsert.push({
        userId: demoVerifierUser._id,
        userName: demoVerifierUser.name,
        userRole: demoVerifierUser.role,
        action: i % 3 === 0 ? 'OFFICER_APPROVED' : i % 3 === 1 ? 'DEFICIENCY_RAISED' : 'RULE_EVALUATED',
        entityType: 'Application',
        entityId: app._id,
        reason: 'Statutory verification step processed under MoTA guidelines.',
      });
    }

    await Notification.insertMany(notificationsToInsert);
    await Grievance.insertMany(grievancesToInsert);
    await AuditLog.insertMany(auditLogsToInsert);

    console.log('================================================================');
    console.log('Demo database seeded successfully.');
    console.log('================================================================');
    console.log('DEMO ACCOUNTS FOR EVALUATORS & JUDGES:');
    console.log('Applicant:           applicant@demo.com  / Demo@123');
    console.log('Verification Officer: verifier@demo.com   / Demo@123');
    console.log('Scrutiny Officer:    scrutiny@demo.com   / Demo@123');
    console.log('Selection Committee: committee@demo.com  / Demo@123');
    console.log('Finance / DBT:       finance@demo.com    / Demo@123');
    console.log('Administrator:       admin@demo.com      / Demo@123');
    console.log('================================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
