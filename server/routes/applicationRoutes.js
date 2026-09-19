import express from 'express';
import {
  createApplication,
  updateApplicationDraft,
  submitApplication,
  getApplications,
  getApplicationById,
  updateApplicationStage,
  overrideAIFlag,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createApplication);
router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.put('/:id/draft', updateApplicationDraft);
router.post('/:id/submit', submitApplication);
router.put(
  '/:id/stage',
  authorize('VERIFICATION_OFFICER', 'SCRUTINY_OFFICER', 'SELECTION_COMMITTEE', 'ADMIN', 'SUPER_ADMIN'),
  updateApplicationStage
);
router.post(
  '/:id/override-flag',
  authorize('VERIFICATION_OFFICER', 'SCRUTINY_OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  overrideAIFlag
);

export default router;
