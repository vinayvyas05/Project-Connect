import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import teamRoutes from './routes/team.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import rateLimit from 'express-rate-limit';

const app = express();

// 1. Rate Limiting (Good for preventing Brute Force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});
app.use('/api/', limiter); // Apply only to API routes

// 2. Single, Secure CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Crucial if we switch to Cookies later
}));

app.use(express.json());

// 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

// 4. Global Error Handler (Must be last)
app.use(errorHandler);

export default app;