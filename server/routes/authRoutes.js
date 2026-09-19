import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  switchDemoRole,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/demo-switch', switchDemoRole);

export default router;
