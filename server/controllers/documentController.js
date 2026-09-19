import path from 'path';
import Document from '../models/Document.js';
import DocumentVerification from '../models/DocumentVerification.js';
import ApplicantProfile from '../models/ApplicantProfile.js';
import Application from '../models/Application.js';
import { performOCR, calculateDocumentHash } from '../services/ai/ocrService.js';
import { classifyAndValidateDocument } from '../services/ai/documentClassifier.js';
import { detectAnomalies } from '../services/ai/anomalyService.js';
import { logAuditEvent } from '../services/auditService.js';

// @desc    Upload document, compute SHA-256 hash & execute OCR intelligence
// @route   POST /api/documents/upload
export const uploadDocument = async (req, res, next) => {
  try {
    const { applicationId, docType } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const profile = await ApplicantProfile.findById(application.profileId);
    const docHash = calculateDocumentHash(req.file.buffer || req.file.filename);

    // 1. Mark any previous document of this type as not current version
    await Document.updateMany(
      { applicationId, docType, isCurrentVersion: true },
      { isCurrentVersion: false }
    );

    const docCount = await Document.countDocuments({ applicationId, docType });
    const version = docCount + 1;

    // 2. Create Document record
    const document = await Document.create({
      applicationId,
      applicantId: req.user._id,
      docType,
      originalFileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSizeBytes: req.file.size,
      mimeType: req.file.mimetype,
      documentHash: docHash,
      status: 'OCR_PROCESSING',
      version,
      isCurrentVersion: true,
    });

    // 3. Run Deterministic AI OCR Engine
    const ocrResult = await performOCR({
      docType,
      fileName: req.file.originalname,
      fileBuffer: req.file.buffer,
      applicantContext: {
        fullName: profile?.fullName || req.user.name,
        dob: profile?.dob,
        tribeName: profile?.tribeName,
        stCertificateNo: profile?.stCertificateNo,
        annualFamilyIncome: profile?.annualFamilyIncome,
        incomeCertificateNo: profile?.incomeCertificateNo,
        institutionName: profile?.institutionName,
        courseName: profile?.courseName,
        previousExamMarksPercentage: profile?.previousExamMarksPercentage,
        overseasUniversity: profile?.overseasUniversity,
      },
    });

    // 4. Run Document Classification & Quality Check
    const classification = await classifyAndValidateDocument({
      docType,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      extractedData: ocrResult.extractedData,
    });

    // 5. Run Anomaly and Duplicate Signal Detector
    const anomalySignals = await detectAnomalies({
      applicationId,
      applicantId: req.user._id,
      document,
      extractedData: ocrResult.extractedData,
      applicantProfile: profile,
    });

    // Combine any classification warnings with anomaly flags
    const combinedFlags = [...anomalySignals];
    if (!classification.isReadable) {
      combinedFlags.push({
        code: 'LOW_QUALITY_SCAN',
        type: 'LOW_QUALITY_SCAN',
        severity: 'HIGH',
        title: 'Unreadable / Blurry Document Scan',
        message: 'The uploaded document image has poor contrast or low resolution.',
        evidence: {
          difference: 'Quality score 42%',
          confidence: 94.0,
        },
      });
    }
    if (classification.isExpired) {
      combinedFlags.push({
        code: 'EXPIRED_CERTIFICATE',
        type: 'EXPIRED_CERTIFICATE',
        severity: 'HIGH',
        title: 'Expired Statutory Certificate',
        message: 'The certificate date indicates it is beyond the valid period.',
        evidence: {
          difference: 'Statutory validity exceeded',
          confidence: 96.0,
        },
      });
    }

    // 6. Save Document Verification Record
    const verification = await DocumentVerification.create({
      documentId: document._id,
      applicationId,
      docType,
      extractedData: ocrResult.extractedData,
      fieldConfidences: ocrResult.fieldConfidences,
      overallConfidence: ocrResult.overallConfidence,
      classificationConfidence: classification.classificationConfidence,
      isReadable: classification.isReadable,
      isTampered: false,
      aiFlags: combinedFlags,
      humanVerificationStatus: 'PENDING',
    });

    // Update document status
    document.status = combinedFlags.length > 0 ? 'MANUAL_REVIEW' : 'VERIFIED';
    document.ocrStatus = 'COMPLETED';
    document.ocrConfidence = ocrResult.overallConfidence;
    await document.save();

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'Document',
      entityId: document._id,
      reason: `Uploaded ${docType} (Version ${version}) with SHA-256: ${docHash.slice(0, 16)}...`,
    });

    await logAuditEvent({
      userId: req.user._id,
      userName: 'AI OCR Pipeline',
      userRole: 'SYSTEM',
      action: 'OCR_COMPLETED',
      entityType: 'Document',
      entityId: document._id,
      reason: `OCR extraction completed with ${ocrResult.overallConfidence}% confidence and ${combinedFlags.length} flag(s).`,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and analyzed with AI OCR pipeline.',
      data: {
        document,
        verification,
        extractedData: ocrResult.extractedData,
        fieldConfidences: ocrResult.fieldConfidences,
        aiFlags: combinedFlags,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document with verification record
// @route   GET /api/documents/:id
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const verification = await DocumentVerification.findOne({ documentId: document._id });

    res.json({
      success: true,
      data: {
        document,
        verification,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Officer verifies or rejects document
// @route   POST /api/documents/:id/verify
export const verifyDocument = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    document.status = status;
    document.verifierRemarks = remarks;
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    await document.save();

    await DocumentVerification.findOneAndUpdate(
      { documentId: document._id },
      {
        humanVerificationStatus: status === 'VERIFIED' ? 'ACCEPTED' : 'REJECTED',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        officerNotes: remarks,
      }
    );

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: status === 'VERIFIED' ? 'OFFICER_APPROVED' : 'OFFICER_REJECTED',
      entityType: 'Document',
      entityId: document._id,
      newState: { status, remarks },
      reason: remarks || `Officer updated document verification status to ${status}`,
    });

    res.json({
      success: true,
      message: `Document status updated to ${status}`,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};
