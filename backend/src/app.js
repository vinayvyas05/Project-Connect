import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import teamRoutes from './routes/team.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const app = express();
app.use(limiter);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

app.use(errorHandler);

export default app;
