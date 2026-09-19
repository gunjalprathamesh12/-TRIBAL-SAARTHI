import express from 'express';
import { uploadDocument, getDocumentById, verifyDocument } from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:id', getDocumentById);
router.post(
  '/:id/verify',
  authorize('VERIFICATION_OFFICER', 'SCRUTINY_OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  verifyDocument
);

export default router;
