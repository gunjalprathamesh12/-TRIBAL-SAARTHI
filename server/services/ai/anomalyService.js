import Document from '../../models/Document.js';
import DocumentVerification from '../../models/DocumentVerification.js';
import ApplicantProfile from '../../models/ApplicantProfile.js';

/**
 * Standard Levenshtein Distance for fuzzy string comparison
 */
export const calculateLevenshteinSimilarity = (str1 = '', str2 = '') => {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();
  if (s1 === s2) return 1.0;
  if (!s1.length || !s2.length) return 0.0;

  const track = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(null));

  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return (maxLen - distance) / maxLen;
};

/**
 * Anomaly and Potential Duplicate Signal Detection
 * Returns transparent signals for human-in-the-loop inspection.
 */
export const detectAnomalies = async ({
  applicationId,
  applicantId,
  document,
  extractedData = {},
  applicantProfile = null,
}) => {
  const signals = [];

  // 1. Duplicate Document Hash Check (Detects identical file uploaded by multiple applicants)
  if (document && document.documentHash) {
    const existingDocWithSameHash = await Document.findOne({
      documentHash: document.documentHash,
      applicantId: { $ne: applicantId },
    }).populate('applicantId', 'name email');

    if (existingDocWithSameHash) {
      signals.push({
        code: 'DUPLICATE_HASH',
        type: 'DUPLICATE_HASH',
        severity: 'HIGH',
        title: 'Potential Duplicate Document Hash Detected',
        message:
          'This uploaded document has an identical cryptographic SHA-256 hash to a document submitted by another applicant. Manual officer cross-verification recommended.',
        evidence: {
          documentHash: document.documentHash,
          matchedDocumentId: existingDocWithSameHash._id,
          matchedApplicantEmail: existingDocWithSameHash.applicantId?.email || 'Confidential',
          confidence: 99.8,
        },
      });
    }
  }

  // 2. Duplicate Certificate Number Check across different applicants
  if (extractedData.certificateNumber) {
    const certNumber = extractedData.certificateNumber.trim();
    const existingVerifications = await DocumentVerification.find({
      'extractedData.certificateNumber': certNumber,
      applicationId: { $ne: applicationId },
    }).limit(2);

    if (existingVerifications.length > 0) {
      signals.push({
        code: 'DUPLICATE_CERT_NO',
        type: 'DUPLICATE_CERT_NO',
        severity: 'HIGH',
        title: 'Certificate Number Reused in Multiple Applications',
        message: `Extracted Certificate Number "${certNumber}" appears in another active application record. Potential anomaly signal flagged for human scrutiny.`,
        evidence: {
          certificateNumber: certNumber,
          matchedRecordsCount: existingVerifications.length,
          confidence: 95.0,
        },
      });
    }
  }

  // 3. Name Discrepancy / Fuzzy Name Matching
  if (applicantProfile && extractedData.candidateName) {
    const profileName = applicantProfile.fullName;
    const certName = extractedData.candidateName;
    const similarity = calculateLevenshteinSimilarity(profileName, certName);

    if (similarity < 0.75) {
      signals.push({
        code: 'NAME_MISMATCH',
        type: 'NAME_MISMATCH',
        severity: 'MEDIUM',
        title: 'Name Spelling Variance Identified',
        message: `Applicant profile name "${profileName}" differs from name "${certName}" extracted from certificate (similarity: ${(similarity * 100).toFixed(1)}%).`,
        evidence: {
          expectedValue: profileName,
          extractedValue: certName,
          field: 'candidateName',
          difference: `${(similarity * 100).toFixed(1)}% match`,
          confidence: 91.0,
        },
      });
    }
  }

  // 4. Income Discrepancy Signal
  if (
    document &&
    document.docType === 'INCOME_CERTIFICATE' &&
    extractedData.annualIncome !== undefined &&
    applicantProfile
  ) {
    const appliedIncome = Number(applicantProfile.annualFamilyIncome);
    const certIncome = Number(extractedData.annualIncome);

    if (certIncome > appliedIncome && certIncome - appliedIncome > 50000) {
      signals.push({
        code: 'INCOME_MISMATCH',
        type: 'INCOME_MISMATCH',
        severity: 'CRITICAL',
        title: 'Income Inconsistency Identified for Manual Review',
        message: `Application declared income is Rs. ${appliedIncome.toLocaleString('en-IN')}/-, but OCR intelligence extracted Rs. ${certIncome.toLocaleString('en-IN')}/- from the uploaded income certificate.`,
        evidence: {
          expectedValue: appliedIncome,
          extractedValue: certIncome,
          field: 'annualFamilyIncome',
          difference: `Rs. ${(certIncome - appliedIncome).toLocaleString('en-IN')} discrepancy`,
          confidence: 98.6,
        },
      });
    }
  }

  return signals;
};
