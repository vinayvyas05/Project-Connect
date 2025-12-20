import express from 'express';
import {
  createTask,
  getTeamTasks,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';

import { protect } from '../middleware/auth.middleware.js';
import { isTeamMember } from '../middleware/team.middleware.js';

const router = express.Router({ mergeParams: true });

/**
 * CREATE TASK
 * POST /api/teams/:teamId/tasks
 */
router.post('/', protect, isTeamMember, createTask);

/**
 * GET ALL TASKS OF A TEAM
 * GET /api/teams/:teamId/tasks
 */
router.get('/', protect, isTeamMember, getTeamTasks);

/**
 * UPDATE TASK
 * PATCH /api/teams/:teamId/tasks/:taskId
 */
router.patch('/:taskId', protect, isTeamMember, updateTask);

/**
 * DELETE TASK
 * DELETE /api/teams/:teamId/tasks/:taskId
 */
router.delete('/:taskId', protect, isTeamMember, deleteTask);

export default router;
