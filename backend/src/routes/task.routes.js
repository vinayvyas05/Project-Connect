import express from 'express';
import {
  createTask,
  getTeamTasks,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { isTeamMember } from '../middleware/team.middleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, isTeamMember, createTask);
router.get('/', authMiddleware, isTeamMember, getTeamTasks);
router.patch('/:taskId', authMiddleware, isTeamMember, updateTask);
router.patch('/:taskId/status', authMiddleware, isTeamMember, updateTask);
router.delete('/:taskId', authMiddleware, isTeamMember, deleteTask);

export default router;
