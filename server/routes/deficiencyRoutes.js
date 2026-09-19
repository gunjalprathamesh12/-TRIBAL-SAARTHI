import express from 'express';
import {
  getDeficiencies,
  raiseDeficiency,
  submitCorrection,
  reviewDeficiencyResolution,
} from '../controllers/deficiencyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDeficiencies);
router.post(
  '/',
  authorize('VERIFICATION_OFFICER', 'SCRUTINY_OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  raiseDeficiency
);
router.post('/:id/resolve', submitCorrection);
router.post(
  '/:id/review',
  authorize('VERIFICATION_OFFICER', 'SCRUTINY_OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  reviewDeficiencyResolution
);

export default router;
