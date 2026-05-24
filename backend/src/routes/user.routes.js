import express from 'express';
import {
  addEmergencyContact, removeEmergencyContact,
  startCheckIn, doCheckIn, endCheckIn
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/emergency-contacts', protect, addEmergencyContact);
router.delete('/emergency-contacts/:contactId', protect, removeEmergencyContact);
router.post('/checkin', protect, startCheckIn);
router.put('/checkin/:id/ping', protect, doCheckIn);
router.put('/checkin/:id/end', protect, endCheckIn);

export default router;