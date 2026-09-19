import express from 'express';
import { getAnalyticsOverview } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get(
  '/overview',
  authorize('ADMIN', 'SUPER_ADMIN', 'VERIFICATION_OFFICER', 'SELECTION_COMMITTEE', 'FINANCE_OFFICER'),
  getAnalyticsOverview
);

export default router;
