import Alert from '../models/Alert.js';

export const getAlerts = async (req, res) => {
  try {
    const { city } = req.query;
    const filter = { active: true };
    if (city) filter['location.city'] = new RegExp(city, 'i');
    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAlert = async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { active: false });
    res.status(200).json({ success: true, message: 'Alert deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};