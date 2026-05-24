import express from 'express';
import { triggerSOS, getMySOS, resolveSOS } from '../controllers/sos.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { sosLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/trigger', protect, sosLimiter, triggerSOS);
router.get('/my', protect, getMySOS);
router.put('/:id/resolve', protect, resolveSOS);

export default router;