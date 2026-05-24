import SOSEvent from '../models/SOSEvent.js';
import User from '../models/User.js';
import { sendEmergencyEmail } from '../services/emailService.js';
import { sendEmergencySMS } from '../services/smsService.js';

export const triggerSOS = async (req, res) => {
  try {
    const { location, message } = req.body;
    const user = await User.findById(req.user.id);

    const sosEvent = await SOSEvent.create({
      user: req.user.id,
      location,
      message: message || 'Emergency! I need help immediately.',
      contactsNotified: user.emergencyContacts,
    });

    // Notify all emergency contacts
    for (const contact of user.emergencyContacts) {
      if (contact.email) {
        await sendEmergencyEmail(contact.email, user.name, location, message);
      }
      if (contact.phone) {
        await sendEmergencySMS(contact.phone, user.name, location, message);
      }
    }

    res.status(201).json({ success: true, sosEvent, message: 'SOS triggered. Contacts notified.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMySOS = async (req, res) => {
  try {
    const events = await SOSEvent.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveSOS = async (req, res) => {
  try {
    const event = await SOSEvent.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};