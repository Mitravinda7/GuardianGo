import Report from '../models/Report.js';

export const createReport = async (req, res) => {
  try {
    const { type, description, severity, location } = req.body;
    const report = await Report.create({
      user: req.user.id,
      type, description, severity, location,
    });
    await report.populate('user', 'name');
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const { city, type, severity, status } = req.query;
    const filter = {};
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    else filter.status = 'active';

    const reports = await Report.find(filter)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('user', 'name');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const voteReport = async (req, res) => {
  try {
    const { vote } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const userId = req.user.id;
    if (vote === 'up') {
      report.downvotes.pull(userId);
      if (!report.upvotes.includes(userId)) report.upvotes.push(userId);
    } else {
      report.upvotes.pull(userId);
      if (!report.downvotes.includes(userId)) report.downvotes.push(userId);
    }
    await report.save();
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await report.deleteOne();
    res.status(200).json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNearbySafetyScore = async (req, res) => {
  try {
    const { lat, lng, radius = 2 } = req.query;
    const reports = await Report.find({ status: 'active' });
    const nearby = reports.filter(r => {
      const dLat = r.location.coordinates.lat - parseFloat(lat);
      const dLng = r.location.coordinates.lng - parseFloat(lng);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      return dist <= parseFloat(radius);
    });
    let score = 10;
    nearby.forEach(r => {
      if (r.severity === 'high') score -= 2;
      else if (r.severity === 'medium') score -= 1;
      else score -= 0.5;
    });
    score = Math.max(1, Math.round(score));
    res.status(200).json({ success: true, score, reportCount: nearby.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};