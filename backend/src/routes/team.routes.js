import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  createTeam,
  getMyTeams,
  generateInviteLink,
  joinTeam,
  getTeamMembers,
} from '../controllers/team.controller.js';
import { isTeamAdmin, isTeamMember } from '../middleware/team.middleware.js';
import channelRoutes from './channel.routes.js';
import taskRoutes from './task.routes.js';

const router = Router();

// POST /api/teams/create
router.post('/create', authMiddleware, createTeam);

// GET /api/teams/my
router.get('/my', authMiddleware, getMyTeams);

router.post(
  '/:teamId/invite',
  authMiddleware,
  isTeamMember,
  isTeamAdmin,
  generateInviteLink
);

router.post('/join', authMiddleware, joinTeam);

// GET /api/teams/:teamId/members
router.get('/:teamId/members', authMiddleware, isTeamMember, getTeamMembers);

router.use('/:teamId/channels', channelRoutes);

// inside router
router.use('/:teamId/tasks', taskRoutes);

export default router;
