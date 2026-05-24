import mongoose from 'mongoose';

const sosSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    city: String,
    address: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  message: { type: String, default: 'Emergency! I need help.' },
  contactsNotified: [{ name: String, phone: String, email: String }],
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('SOSEvent', sosSchema);