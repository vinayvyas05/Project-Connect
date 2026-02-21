import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import teamRoutes from './routes/team.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import rateLimit from 'express-rate-limit';

const app = express();

// ── 1. CORS — MUST be first so preflight OPTIONS requests get CORS headers ────
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
// Explicitly handle ALL preflight OPTIONS requests before rate limiting
app.options(/.*/, cors(corsOptions));

// ── 2. Rate Limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// ── 3. Body Parser ────────────────────────────────────────────────────────────
app.use(express.json());

// ── 4. Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

// ── 5. Global Error Handler (must be last) ────────────────────────────────────
app.use(errorHandler);

export default app;
