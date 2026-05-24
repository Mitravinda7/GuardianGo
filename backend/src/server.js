import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { ENV } from './config/env.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';
import { initSocket } from './services/socketService.js';

import authRoutes from './routes/auth.routes.js';
import reportRoutes from './routes/report.routes.js';
import alertRoutes from './routes/alert.routes.js';
import sosRoutes from './routes/sos.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();
const httpServer = createServer(app);

// Allow ALL origins — fixes Vercel CORS
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

connectDB();

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'GuardianGo API is running 🛡️' });
});

// ── Overpass proxy — fixes browser CORS block ──
app.post('/api/proxy/overpass', express.text({ type: '*/*', limit: '1mb' }), async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: req.body,
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Overpass proxy failed', message: err.message });
  }
});

// ── Travel Insights proxy ──
app.post('/api/proxy/travel', express.text({ type: '*/*', limit: '1mb' }), async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: req.body,
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Travel proxy failed', message: err.message });
  }
});

initSocket(io);

httpServer.listen(ENV.PORT, () => {
  console.log(`🚀 GuardianGo server running on port ${ENV.PORT}`);
});