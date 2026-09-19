import crypto from 'crypto';

/**
 * Generate SHA-256 hash for document content to detect duplicate or altered files
 */
export const calculateDocumentHash = (bufferOrString) => {
  return crypto.createHash('sha256').update(bufferOrString).digest('hex');
};

/**
 * Deterministic AI OCR Engine (MoTA Document Intelligence Pipeline)
 * Extracts structured fields, confidence scores, and raw layout metadata
 */
export const performOCR = async ({
  docType,
  fileName,
  fileBuffer = null,
  applicantContext = {},
}) => {
  // Simulate OCR latency (100-300ms)
  await new Promise((res) => setTimeout(res, 120));

  const docHash = fileBuffer
    ? calculateDocumentHash(fileBuffer)
    : calculateDocumentHash(fileName + (applicantContext.stCertificateNo || 'doc-salt'));

  const now = new Date();
  const currentYear = now.getFullYear();

  // Baseline extracted model depending on document type
  let extractedData = {};
  let fieldConfidences = {};
  let overallConfidence = 96.5;

  switch (docType) {
    case 'INCOME_CERTIFICATE':
      // Check if this is the intentional mismatch test file
      const isMismatchScenario = fileName.toLowerCase().includes('mismatch') || applicantContext.forceIncomeMismatch;
      const extractedIncome = isMismatchScenario ? 720000 : (applicantContext.annualFamilyIncome || 220000);

      extractedData = {
        candidateName: applicantContext.fullName || 'Rahul Kumar Santhal',
        certificateNumber: applicantContext.incomeCertificateNo || `INC/${currentYear}/JH/${Math.floor(10000 + Math.random() * 90000)}`,
        annualIncome: extractedIncome,
        issueDate: `${currentYear}-04-15`,
        issuingAuthority: 'Office of the Sub-Divisional Magistrate / Tehsildar, Revenue Dept',
        category: 'ST',
        rawTextSummary: `GOVERNMENT OF JHARKHAND - REVENUE DEPARTMENT\nINCOME CERTIFICATE\nThis is to certify that annual family income of ${applicantContext.fullName || 'Rahul Kumar Santhal'} is Rs. ${extractedIncome.toLocaleString('en-IN')}/- (Rupees Seven Lakh Twenty Thousand Only) from all sources. Valid for FY ${currentYear - 1}-${currentYear}.`,
      };
      fieldConfidences = {
        candidateName: 98.2,
        certificateNumber: 97.4,
        annualIncome: 99.1,
        issueDate: 95.0,
        issuingAuthority: 96.8,
      };
      overallConfidence = 97.3;
      break;

    case 'ST_CERTIFICATE':
      extractedData = {
        candidateName: applicantContext.fullName || 'Rahul Kumar Santhal',
        dob: applicantContext.dob ? new Date(applicantContext.dob).toISOString().split('T')[0] : '2002-06-14',
        certificateNumber: applicantContext.stCertificateNo || `ST/CASTE/2021/${Math.floor(100000 + Math.random() * 900000)}`,
        category: 'Scheduled Tribe (ST)',
        tribe: applicantContext.tribeName || 'Santhal',
        issueDate: '2021-08-20',
        issuingAuthority: 'Office of the District Magistrate / Sub-Divisional Officer',
        rawTextSummary: `CASTE & TRIBE CERTIFICATE - SCHEDULED TRIBE\nIt is certified that ${applicantContext.fullName || 'Rahul Kumar'} belongs to the ${applicantContext.tribeName || 'Santhal'} Community, recognized as Scheduled Tribe under Constitution (Scheduled Tribes) Order, 1950.`,
      };
      fieldConfidences = {
        candidateName: 99.0,
        certificateNumber: 98.5,
        category: 99.4,
        tribe: 97.8,
        issuingAuthority: 96.2,
      };
      overallConfidence = 98.1;
      break;

    case 'ACADEMIC_MARKSHEET':
      extractedData = {
        candidateName: applicantContext.fullName || 'Rahul Kumar',
        institutionName: applicantContext.institutionName || 'Ranchi University, Jharkhand',
        courseName: applicantContext.courseName || 'Bachelor of Science (Computer Science)',
        marksPercentage: applicantContext.previousExamMarksPercentage || 78.5,
        issueDate: `${currentYear - 1}-06-30`,
        issuingAuthority: 'Controller of Examinations, Board of Technical & Academic Education',
        rawTextSummary: `STATEMENT OF MARKS / GRADE CARD\nCandidate: ${applicantContext.fullName || 'Rahul Kumar'}\nExam: Final Semester / Qualifying Exam\nTotal Percentage: ${applicantContext.previousExamMarksPercentage || 78.5}%\nResult: First Class with Distinction`,
      };
      fieldConfidences = {
        candidateName: 97.5,
        institutionName: 95.4,
        marksPercentage: 99.0,
        courseName: 96.2,
      };
      overallConfidence = 97.0;
      break;

    case 'ADMISSION_BONAFIDE':
    case 'INSTITUTION_VERIFICATION':
      extractedData = {
        candidateName: applicantContext.fullName || 'Rahul Kumar',
        institutionName: applicantContext.institutionName || 'Indian Institute of Technology (IIT) Delhi',
        courseName: applicantContext.courseName || 'Ph.D in Computer Science & Engineering',
        certificateNumber: `BONAFIDE/${currentYear}/${Math.floor(1000 + Math.random() * 9000)}`,
        issueDate: `${currentYear}-07-10`,
        issuingAuthority: 'Dean of Academic Affairs / Registrar',
        rawTextSummary: `BONAFIDE & ADMISSION CERTIFICATE\nThis is to certify that ${applicantContext.fullName || 'Rahul Kumar'} is a bonafide full-time registered student of ${applicantContext.institutionName || 'IIT Delhi'} for the academic year ${currentYear}-${currentYear + 1}.`,
      };
      fieldConfidences = {
        candidateName: 98.0,
        institutionName: 98.6,
        courseName: 97.1,
      };
      overallConfidence = 97.9;
      break;

    case 'BANK_PASSBOOK_CANCELLED_CHEQUE':
      extractedData = {
        candidateName: applicantContext.accountHolderName || applicantContext.fullName || 'Rahul Kumar',
        accountNumberMasked: applicantContext.accountNumberMasked || 'XXXX XXXX 4821',
        ifscCode: applicantContext.ifscCode || 'SBIN0001234',
        bankName: applicantContext.bankName || 'State Bank of India',
        branchName: applicantContext.branchName || 'Main Tribal Development Branch',
        rawTextSummary: `STATE BANK OF INDIA - PASSBOOK LEAF\nAccount Holder: ${applicantContext.accountHolderName || 'Rahul Kumar'}\nAccount: XXXX XXXX 4821 | IFSC: ${applicantContext.ifscCode || 'SBIN0001234'}\nAadhaar DBT Status: Active Seeded`,
      };
      fieldConfidences = {
        candidateName: 98.4,
        ifscCode: 99.2,
        bankName: 97.8,
      };
      overallConfidence = 98.5;
      break;

    case 'RESEARCH_PROPOSAL':
      extractedData = {
        candidateName: applicantContext.fullName || 'Anjali Munda',
        courseName: 'Ph.D / M.Phil Research Synopsis',
        institutionName: applicantContext.institutionName || 'Jawaharlal Nehru University (JNU), New Delhi',
        rawTextSummary: `RESEARCH PROPOSAL SYNOPSIS (NFST)\nTitle: Sustainable Tribal Livelihoods and Ethnobotanical Knowledge Systems in Eastern Ghats\nGuide: Prof. S. K. Marandi, Department of Tribal Studies`,
      };
      fieldConfidences = {
        candidateName: 96.0,
        institutionName: 95.8,
      };
      overallConfidence = 95.9;
      break;

    case 'OVERSEAS_OFFER_LETTER':
      extractedData = {
        candidateName: applicantContext.fullName || 'Vikram Bodo',
        institutionName: applicantContext.overseasUniversity || 'University of Oxford, United Kingdom',
        courseName: 'M.Sc in Environmental Change and Management',
        issueDate: `${currentYear}-03-12`,
        issuingAuthority: 'Admissions Committee, Graduate Admissions Office',
        rawTextSummary: `OFFICIAL UNCONDITIONAL OFFER OF ADMISSION (NOS Scheme Reference)\nWe are delighted to offer ${applicantContext.fullName || 'Vikram Bodo'} an unconditional admission to the Master's programme. QS World Rank: Top 10.`,
      };
      fieldConfidences = {
        candidateName: 98.5,
        institutionName: 99.0,
        issueDate: 97.0,
      };
      overallConfidence = 98.2;
      break;

    default:
      extractedData = {
        candidateName: applicantContext.fullName || 'Applicant Candidate',
        rawTextSummary: `Verified Government Document - Type: ${docType}`,
      };
      overallConfidence = 94.0;
  }

  return {
    docType,
    fileName,
    documentHash: docHash,
    extractedData,
    fieldConfidences,
    overallConfidence,
    classificationConfidence: 98.5,
    isReadable: true,
    isTampered: false,
    ocrEngine: 'MoTA-DocIntelligence-Demo-v2.6',
    extractedAt: new Date(),
  };
};
