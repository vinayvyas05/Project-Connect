import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isTeamMember } from '../middleware/team.middleware.js';
import { createChannel } from '../controllers/channel.controller.js';
import { getTeamChannels } from '../controllers/channel.controller.js';
import messageRoutes from './message.routes.js';

const router = Router({ mergeParams: true });

// POST /api/teams/:teamId/channels/create
router.post('/create', authMiddleware, isTeamMember, createChannel);

// GET /api/teams/:teamId/channels
router.get('/', authMiddleware, isTeamMember, getTeamChannels);

//messages
router.use('/:channelId/messages', messageRoutes);

export default router;
