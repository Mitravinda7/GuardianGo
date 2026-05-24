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

process.on('uncaughtException', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${ENV.PORT} busy, trying ${parseInt(ENV.PORT) + 1}...`);
    httpServer.listen(parseInt(ENV.PORT) + 1);
  }
});
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST']
  },
});

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'GuardianGo API is running 🛡️' });
});

// Socket
initSocket(io);

// Start server
httpServer.listen(ENV.PORT, () => {
  console.log(`🚀 GuardianGo server running on port ${ENV.PORT}`);
});