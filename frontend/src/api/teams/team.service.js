import api from "../axios";

export const teamService = {
  createTeam: (name) => api.post("/teams/create", { name }),

  getMyTeams: () => api.get("/teams/my"),

  getTeamMembers: (teamId) => api.get(`/teams/${teamId}/members`),

  generateInviteLink: (teamId) => api.post(`/teams/${teamId}/invite`),

  joinTeam: (token) => api.post("/teams/join", { token }),

  renameTeam: (teamId, name) => api.patch(`/teams/${teamId}`, { name }),

  deleteTeam: (teamId) => api.delete(`/teams/${teamId}`),
};