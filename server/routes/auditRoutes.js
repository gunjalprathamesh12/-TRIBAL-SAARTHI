import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'VERIFICATION_OFFICER', 'SCRUTINY_OFFICER'),
  getAuditLogs
);

export default router;
