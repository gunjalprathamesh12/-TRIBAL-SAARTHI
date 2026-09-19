import express from 'express';
import {
  createGrievance,
  getGrievances,
  resolveGrievance,
} from '../controllers/grievanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createGrievance);
router.get('/', getGrievances);
router.post(
  '/:id/resolve',
  authorize('VERIFICATION_OFFICER', 'SCRUTINY_OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  resolveGrievance
);

export default router;
