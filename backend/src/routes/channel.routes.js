import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isTeamMember, isTeamAdmin } from '../middleware/team.middleware.js';
import {
  createChannel,
  getTeamChannels,
  renameChannel,
} from '../controllers/channel.controller.js';
import messageRoutes from './message.routes.js';

const router = Router({ mergeParams: true });

// POST /api/teams/:teamId/channels/create
router.post('/create', authMiddleware, isTeamMember, createChannel);

// GET /api/teams/:teamId/channels
router.get('/', authMiddleware, isTeamMember, getTeamChannels);

// PATCH /api/teams/:teamId/channels/:channelId  (admin only)
router.patch(
  '/:channelId',
  authMiddleware,
  isTeamMember,
  isTeamAdmin,
  renameChannel
);

// messages
router.use('/:channelId/messages', messageRoutes);

export default router;
