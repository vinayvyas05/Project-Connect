import api from "../axios";

export const taskService = {
  getTeamTasks: (teamId) => api.get(`/teams/${teamId}/tasks`),

  createTask: (teamId, { title, description, assignedTo, dueDate }) =>
    api.post(`/teams/${teamId}/tasks`, {
      title,
      description,
      assignedTo,
      dueDate,
    }),

  updateTask: (teamId, taskId, updates) =>
    api.patch(`/teams/${teamId}/tasks/${taskId}`, updates),

  updateTaskStatus: (teamId, taskId, status) =>
    api.patch(`/teams/${teamId}/tasks/${taskId}/status`, { status }),

  deleteTask: (teamId, taskId) =>
    api.delete(`/teams/${teamId}/tasks/${taskId}`),
};
