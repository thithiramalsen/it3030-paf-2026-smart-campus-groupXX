import apiClient from '../utils/apiClient';

export const adminApi = {
  getUsers() {
    return apiClient.get('/api/admin/users');
  },
  setUserRole(userId, role) {
    return apiClient.patch(`/api/admin/users/${userId}/role`, { role });
  },
  setUserStatus(userId, accountStatus) {
    return apiClient.patch(`/api/admin/users/${userId}/status`, { accountStatus });
  },
  removeUser(userId) {
    return apiClient.delete(`/api/admin/users/${userId}`);
  },
};
