import httpClient from './httpClient';

export const notificationApi = {
  listMine() {
    return httpClient.get('/api/notifications/me');
  },
  unreadCount() {
    return httpClient.get('/api/notifications/unread-count');
  },
  markRead(notificationId) {
    return httpClient.patch(`/api/notifications/${notificationId}/read`);
  },
  markAllRead() {
    return httpClient.patch('/api/notifications/me/read-all');
  },
  remove(notificationId) {
    return httpClient.delete(`/api/notifications/${notificationId}`);
  },
};
