import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { authLimiter, waitlistLimiter } from '../middleware/rateLimit.js';
import { validateRegister, validateLogin, handleValidationErrors, sanitize } from '../middleware/validation.js';
import AuthController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', 
  sanitize,
  validateRegister,
  handleValidationErrors,
  authLimiter,
  AuthController.register
);

router.post('/login',
  sanitize,
  validateLogin,
  handleValidationErrors,
  authLimiter,
  AuthController.login
);

router.post('/refresh',
  AuthController.refreshToken
);

router.post('/logout',
  authenticate,
  AuthController.logout
);

router.post('/verify-email/:token',
  AuthController.verifyEmail
);

router.post('/forgot-password',
  AuthController.forgotPassword
);

router.post('/reset-password/:token',
  AuthController.resetPassword
);

router.get('/me',
  authenticate,
  AuthController.me
);

router.put('/profile',
  authenticate,
  sanitize,
  AuthController.updateProfile
);

router.post('/change-password',
  authenticate,
  AuthController.changePassword
);

export default router;