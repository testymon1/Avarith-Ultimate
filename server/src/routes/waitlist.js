import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { waitlistLimiter } from '../middleware/rateLimit.js';
import { validateWaitlist, handleValidationErrors, sanitize } from '../middleware/validation.js';
import WaitlistController from '../controllers/waitlistController.js';

const router = express.Router();

router.post('/join',
  sanitize,
  validateWaitlist,
  handleValidationErrors,
  waitlistLimiter,
  WaitlistController.join
);

router.get('/',
  authenticate,
  isAdmin,
  WaitlistController.getAll
);

router.get('/analytics',
  authenticate,
  isAdmin,
  WaitlistController.getAnalytics
);

router.put('/:id/status',
  authenticate,
  isAdmin,
  WaitlistController.updateStatus
);

router.delete('/:id',
  authenticate,
  isAdmin,
  WaitlistController.delete
);

export default router;