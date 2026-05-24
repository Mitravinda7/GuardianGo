import express from 'express';
import { body } from 'express-validator';
import {
  createReport, getAllReports, getReportById,
  voteReport, deleteReport, getNearbySafetyScore
} from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.get('/', getAllReports);
router.get('/safety-score', getNearbySafetyScore);
router.get('/:id', getReportById);

router.post('/', protect, [
  body('type').notEmpty().withMessage('Report type is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location.coordinates.lat').isNumeric().withMessage('Valid latitude required'),
  body('location.coordinates.lng').isNumeric().withMessage('Valid longitude required'),
], validate, createReport);

router.put('/:id/vote', protect, voteReport);
router.delete('/:id', protect, deleteReport);

export default router;