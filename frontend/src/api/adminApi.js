import httpClient from './httpClient';

export const adminApi = {
  getUsers() {
    return httpClient.get('/api/admin/users');
  },
  setUserRole(userId, role) {
    return httpClient.patch(`/api/admin/users/${userId}/role`, { role });
  },
  setUserStatus(userId, accountStatus) {
    return httpClient.patch(`/api/admin/users/${userId}/status`, { accountStatus });
  },
  removeUser(userId) {
    return httpClient.delete(`/api/admin/users/${userId}`);
  },
};
