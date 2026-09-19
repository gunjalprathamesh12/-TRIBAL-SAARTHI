/**
 * Automated Deficiency Detector & Officer Decision Support
 * Analyzes documents and cross-checks with application data to highlight deficiencies
 */
export const inspectApplicationForDeficiencies = async ({
  application,
  scheme,
  applicantProfile,
  documents = [],
  verifications = [],
}) => {
  const deficienciesDetected = [];
  let riskLevel = 'LOW';
  let recommendedQueue = 'LOW_REVIEW_EFFORT';
  let flagsCount = 0;

  // 1. Missing Mandatory Documents Check
  const mandatoryDocs = (scheme.documentsRequired || []).filter((d) => d.isMandatory);
  const uploadedTypes = documents.map((d) => d.docType);

  for (const reqDoc of mandatoryDocs) {
    if (!uploadedTypes.includes(reqDoc.docType)) {
      deficienciesDetected.push({
        category: 'MISSING_DOCUMENT',
        severity: 'HIGH',
        title: `Missing Mandatory Document: ${reqDoc.title}`,
        description: `Scheme "${scheme.schemeName}" strictly mandates upload of ${reqDoc.title}. No valid document found.`,
        remediationInstruction: `Please upload a clear scanned copy of your ${reqDoc.title} in PDF format (under ${reqDoc.maxSizeMB || 5}MB).`,
        evidence: {
          field: reqDoc.docType,
          details: 'Document not found in application repository',
        },
      });
      flagsCount += 1;
    }
  }

  // 2. Document Quality and OCR Anomaly Checks
  for (const doc of documents) {
    const verification = verifications.find(
      (v) => v.documentId.toString() === doc._id.toString()
    );

    if (verification) {
      // Blurry / Unreadable check
      if (!verification.isReadable) {
        deficienciesDetected.push({
          category: 'BLURRY_UNREADABLE_DOC',
          severity: 'HIGH',
          documentId: doc._id,
          title: `Unreadable or Blurry Upload: ${doc.originalFileName}`,
          description:
            'The uploaded document scan resolution is too low for optical character recognition and official scrutiny.',
          remediationInstruction:
            'Re-upload a clear, high-resolution color scan (minimum 200 DPI) where all text and official seals are clearly legible.',
          evidence: {
            field: doc.docType,
            details: 'OCR confidence below acceptable quality threshold',
          },
        });
        flagsCount += 1;
      }

      // Check for specific AI flags attached to the verification
      if (verification.aiFlags && verification.aiFlags.length > 0) {
        for (const flag of verification.aiFlags) {
          if (!flag.isOverridden) {
            flagsCount += 1;
            if (flag.type === 'INCOME_MISMATCH') {
              deficienciesDetected.push({
                category: 'INCOME_MISMATCH',
                severity: 'CRITICAL',
                documentId: doc._id,
                title: 'Income Figure Inconsistency',
                description: flag.message,
                remediationInstruction:
                  'Upload a fresh valid Income Certificate issued by an authorized Revenue Authority reflecting current family income, or update declared income figure.',
                evidence: flag.evidence,
              });
            } else if (flag.type === 'NAME_MISMATCH') {
              deficienciesDetected.push({
                category: 'NAME_MISMATCH',
                severity: 'MEDIUM',
                documentId: doc._id,
                title: 'Name Spelling Variance in Certificate',
                description: flag.message,
                remediationInstruction:
                  'Upload a supporting Gazette notification, affidavit, or Aadhaar copy verifying candidate name variation.',
                evidence: flag.evidence,
              });
            } else if (flag.type === 'DUPLICATE_CERT_NO' || flag.type === 'DUPLICATE_HASH') {
              deficienciesDetected.push({
                category: 'DUPLICATE_UPLOAD',
                severity: 'CRITICAL',
                documentId: doc._id,
                title: flag.title,
                description: flag.message,
                remediationInstruction:
                  'Please provide original verification proof for this certificate to eliminate potential duplication conflict.',
                evidence: flag.evidence,
              });
            }
          }
        }
      }
    }
  }

  // 3. Compute Risk Level & Queue Categorization for Human Officer
  const hasCritical = deficienciesDetected.some((d) => d.severity === 'CRITICAL');
  const hasHigh = deficienciesDetected.some((d) => d.severity === 'HIGH');
  const hasMedium = deficienciesDetected.some((d) => d.severity === 'MEDIUM');

  if (hasCritical) {
    riskLevel = 'CRITICAL';
    recommendedQueue = 'MANUAL_REVIEW';
  } else if (hasHigh) {
    riskLevel = 'HIGH';
    recommendedQueue = 'ATTENTION_REQUIRED';
  } else if (hasMedium) {
    riskLevel = 'MEDIUM';
    recommendedQueue = 'NORMAL_REVIEW';
  } else {
    riskLevel = 'LOW';
    recommendedQueue = 'LOW_REVIEW_EFFORT';
  }

  return {
    deficienciesDetected,
    riskLevel,
    recommendedQueue,
    flagsCount,
    confidenceScore: Math.max(70, Math.round(98 - flagsCount * 5)),
    aiSummaryNote:
      deficienciesDetected.length > 0
        ? `AI-assisted review identified ${deficienciesDetected.length} item(s) for verification officer attention.`
        : 'All document checks and criteria passed automated validation. Ready for officer scrutiny.',
  };
};
