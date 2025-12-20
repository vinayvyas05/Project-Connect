import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import teamRoutes from './routes/team.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

export default app;
