import httpClient from './httpClient';

export const authApi = {
  getCurrentUser() {
    return httpClient.get('/api/auth/me');
  },
  logout() {
    return httpClient.post('/api/auth/logout');
  },
};
