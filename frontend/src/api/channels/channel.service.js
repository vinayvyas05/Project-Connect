import api from "../axios";

export const channelService = {
  createChannel: (teamId, name) =>
    api.post(`/teams/${teamId}/channels/create`, { name }),

  getTeamChannels: (teamId) => api.get(`/teams/${teamId}/channels`),

  renameChannel: (teamId, channelId, name) =>
    api.patch(`/teams/${teamId}/channels/${channelId}`, { name }),
};
