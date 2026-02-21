import api from "../axios";

export const messageService = {
  /**
   * Fetch message history for a channel.
   * @param {string} teamId
   * @param {string} channelId
   * @param {{ limit?: number, before?: string }} options
   */
  getMessages: (teamId, channelId, { limit = 50, before } = {}) => {
    const params = { limit };
    if (before) params.before = before;
    return api.get(`/teams/${teamId}/channels/${channelId}/messages`, {
      params,
    });
  },

  /**
   * Send a message via REST (fallback — real-time uses socket).
   */
  sendMessage: (teamId, channelId, text) =>
    api.post(`/teams/${teamId}/channels/${channelId}/messages`, { text }),
};
