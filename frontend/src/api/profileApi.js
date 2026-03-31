import apiClient from '../utils/apiClient';

export const profileApi = {
  getMine() {
    return apiClient.get('/api/profile/me');
  },
  updateMine(payload) {
    return apiClient.put('/api/profile/me', payload);
  },
};
