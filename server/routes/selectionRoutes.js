import express from 'express';
import {
  getSelectionCandidates,
  reviewCandidate,
  approveSelectionCandidate,
} from '../controllers/selectionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get(
  '/candidates',
  authorize('SELECTION_COMMITTEE', 'ADMIN', 'SUPER_ADMIN', 'FINANCE_OFFICER'),
  getSelectionCandidates
);
router.post(
  '/:id/review',
  authorize('SELECTION_COMMITTEE', 'ADMIN', 'SUPER_ADMIN'),
  reviewCandidate
);
router.post(
  '/:id/approve',
  authorize('SELECTION_COMMITTEE', 'ADMIN', 'SUPER_ADMIN'),
  approveSelectionCandidate
);

export default router;
