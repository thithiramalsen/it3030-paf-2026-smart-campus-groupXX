import apiClient from '../utils/apiClient';

export const notificationApi = {
  listMine() {
    return apiClient.get('/api/notifications/me');
  },
  unreadCount() {
    return apiClient.get('/api/notifications/unread-count');
  },
  markRead(notificationId) {
    return apiClient.patch(`/api/notifications/${notificationId}/read`);
  },
  markAllRead() {
    return apiClient.patch('/api/notifications/me/read-all');
  },
  remove(notificationId) {
    return apiClient.delete(`/api/notifications/${notificationId}`);
  },
};
