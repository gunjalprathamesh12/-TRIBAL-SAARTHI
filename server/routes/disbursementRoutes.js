import express from 'express';
import {
  getDisbursements,
  updateDisbursementStatus,
} from '../controllers/disbursementController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get(
  '/',
  authorize('FINANCE_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'VERIFICATION_OFFICER'),
  getDisbursements
);
router.post(
  '/:id/update',
  authorize('FINANCE_OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  updateDisbursementStatus
);

export default router;
