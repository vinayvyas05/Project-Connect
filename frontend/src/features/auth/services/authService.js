import API from '../../../api/axiosInstance';

export const authService = {
  register: async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    return data;
  },
  login: async (credentials) => {
    const { data } = await API.post('/auth/login', credentials);
    return data;
  }
};