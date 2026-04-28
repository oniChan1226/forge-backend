import express from 'express';
import authRoutes from './routes/auth.js';
import challengeRoutes from './routes/challenges.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);

app.use(errorHandler);

export default app;
