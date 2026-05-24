import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['suspicious_activity', 'unsafe_street', 'poor_lighting', 'accident', 'roadblock', 'isolated_zone', 'other'],
    required: true,
  },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  location: {
    city: String,
    state: String,
    address: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'resolved', 'under_review'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Report', reportSchema);