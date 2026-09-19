import express from 'express';
import {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  getSchemeRules,
  saveSchemeRule,
  deleteSchemeRule,
  recommendSchemes,
} from '../controllers/schemeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSchemes);
router.post('/recommend', recommendSchemes);
router.get('/:id', getSchemeById);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), createScheme);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), updateScheme);

router.get('/:id/rules', getSchemeRules);
router.post('/:id/rules', protect, authorize('ADMIN', 'SUPER_ADMIN'), saveSchemeRule);
router.delete('/rules/:ruleId', protect, authorize('ADMIN', 'SUPER_ADMIN'), deleteSchemeRule);

export default router;
