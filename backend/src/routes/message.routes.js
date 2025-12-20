import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isTeamMember } from '../middleware/team.middleware.js';
import { sendMessage } from '../controllers/message.controller.js';

const router = Router({ mergeParams: true });

// POST /api/teams/:teamId/channels/:channelId/messages
router.post('/', authMiddleware, isTeamMember, sendMessage);

export default router;
