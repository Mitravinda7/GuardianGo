import express from 'express';
import { getAlerts, createAlert, deleteAlert } from '../controllers/alert.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAlerts);
router.post('/', protect, createAlert);
router.delete('/:id', protect, deleteAlert);

router.get('/aqi', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lng}/?token=demo`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: 'AQI fetch failed' });
  }
});

export default router;