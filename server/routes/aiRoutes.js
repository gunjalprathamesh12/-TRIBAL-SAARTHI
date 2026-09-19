import express from 'express';
import { performOCR } from '../services/ai/ocrService.js';
import { classifyAndValidateDocument } from '../services/ai/documentClassifier.js';
import { evaluateEligibility } from '../services/ai/eligibilityService.js';
import { detectAnomalies } from '../services/ai/anomalyService.js';
import Scheme from '../models/Scheme.js';

const router = express.Router();

// @desc    Run standalone AI OCR on sample document
// @route   POST /api/ai/ocr
router.post('/ocr', async (req, res, next) => {
  try {
    const { docType, fileName, applicantContext } = req.body;
    const result = await performOCR({
      docType: docType || 'INCOME_CERTIFICATE',
      fileName: fileName || 'income_certificate_sample.pdf',
      applicantContext: applicantContext || {},
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// @desc    Check document quality & classification
// @route   POST /api/ai/document-check
router.post('/document-check', async (req, res, next) => {
  try {
    const { docType, fileName, mimeType, fileSizeBytes, extractedData } = req.body;
    const result = await classifyAndValidateDocument({
      docType,
      fileName,
      mimeType: mimeType || 'application/pdf',
      fileSizeBytes: fileSizeBytes || 1024 * 1024,
      extractedData: extractedData || {},
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// @desc    Evaluate scheme rules dynamically against applicant profile
// @route   POST /api/ai/eligibility
router.post('/eligibility', async (req, res, next) => {
  try {
    const { schemeId, applicantProfile } = req.body;
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }
    const result = await evaluateEligibility({
      applicantProfile,
      scheme,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// @desc    Run anomaly / fraud signals detector
// @route   POST /api/ai/anomaly
router.post('/anomaly', async (req, res, next) => {
  try {
    const { applicationId, applicantId, document, extractedData, applicantProfile } = req.body;
    const result = await detectAnomalies({
      applicationId,
      applicantId,
      document,
      extractedData,
      applicantProfile,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
