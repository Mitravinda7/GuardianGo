import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['accident', 'hazard', 'suspicious', 'weather', 'general'], default: 'general' },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  location: {
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

export default mongoose.model('Alert', alertSchema);