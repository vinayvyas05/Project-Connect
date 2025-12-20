import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createTeam } from '../controllers/team.controller.js';
import { getMyTeams } from '../controllers/team.controller.js';
import { generateInviteLink } from '../controllers/team.controller.js';
import { joinTeam } from '../controllers/team.controller.js';
import { isTeamAdmin, isTeamMember } from '../middleware/team.middleware.js';

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

export default router;
