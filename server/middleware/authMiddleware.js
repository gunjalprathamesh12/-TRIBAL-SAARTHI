import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. No token provided.',
      errorCode: 'AUTH_TOKEN_MISSING',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'tribal_saarthi_sih_2026_jwt_secret_key_secure'
    );
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User session expired or user no longer exists.',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed. Please login again.',
      errorCode: 'INVALID_TOKEN',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    if (!roles.includes(req.user.role) && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to perform this operation.`,
        errorCode: 'FORBIDDEN_ROLE',
      });
    }

    next();
  };
};
