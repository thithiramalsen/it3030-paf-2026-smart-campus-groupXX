import httpClient from './httpClient';

export const profileApi = {
  getMine() {
    return httpClient.get('/api/profile/me');
  },
  updateMine(payload) {
    return httpClient.put('/api/profile/me', payload);
  },
};
