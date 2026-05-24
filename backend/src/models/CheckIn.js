import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  intervalMinutes: { type: Number, default: 30 },
  lastCheckIn: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'missed'], default: 'active' },
  emergencyContacts: [{ name: String, phone: String, email: String }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('CheckIn', checkInSchema);