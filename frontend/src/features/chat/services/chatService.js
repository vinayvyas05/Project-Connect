import API from '../../../api/axiosInstance';

export const chatService = {
  // Fetch message history with cursor-based pagination
  getMessages: async (teamId, channelId, before = null) => {
    const url = `/teams/${teamId}/channels/${channelId}/messages${before ? `?before=${before}` : ''}`;
    const { data } = await API.get(url);
    return data;
  }
};