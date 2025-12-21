import API from '../../../api/axiosInstance';

export const teamService = {
  getMyTeams: async () => {
    const { data } = await API.get('/teams/my');
    return data.teams;
  },
  createTeam: async (name) => {
    const { data } = await API.get('/teams/create', { name });
    return data.team;
  }
};