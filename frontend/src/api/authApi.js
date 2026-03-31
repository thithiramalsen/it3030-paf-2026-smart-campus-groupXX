import apiClient from '../utils/apiClient';

export const authApi = {
  getCurrentUser() {
    return apiClient.get('/api/auth/me');
  },
  logout() {
    return apiClient.post('/api/auth/logout');
  },
};
