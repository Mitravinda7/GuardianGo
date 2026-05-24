import User from '../models/User.js';
import CheckIn from '../models/CheckIn.js';

export const addEmergencyContact = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const user = await User.findById(req.user.id);
    user.emergencyContacts.push({ name, phone, email });
    await user.save();
    res.status(200).json({ success: true, emergencyContacts: user.emergencyContacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeEmergencyContact = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.emergencyContacts = user.emergencyContacts.filter(
      c => c._id.toString() !== req.params.contactId
    );
    await user.save();
    res.status(200).json({ success: true, emergencyContacts: user.emergencyContacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startCheckIn = async (req, res) => {
  try {
    const { destination, intervalMinutes, emergencyContacts } = req.body;
    const checkIn = await CheckIn.create({
      user: req.user.id,
      destination,
      intervalMinutes,
      emergencyContacts,
    });
    res.status(201).json({ success: true, checkIn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const doCheckIn = async (req, res) => {
  try {
    const checkIn = await CheckIn.findByIdAndUpdate(
      req.params.id,
      { lastCheckIn: new Date(), status: 'active' },
      { new: true }
    );
    res.status(200).json({ success: true, checkIn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const endCheckIn = async (req, res) => {
  try {
    const checkIn = await CheckIn.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    res.status(200).json({ success: true, checkIn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};