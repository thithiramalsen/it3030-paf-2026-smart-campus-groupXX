const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const ACCESS_KEY = 'sc_access_token';
const REFRESH_KEY = 'sc_refresh_token';

const tokenStore = {
  get() {
    return {
      accessToken: localStorage.getItem(ACCESS_KEY) || '',
      refreshToken: localStorage.getItem(REFRESH_KEY) || '',
    };
  },
  set({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

async function refreshTokens() {
  const { refreshToken } = tokenStore.get();
  if (!refreshToken) return null;
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  tokenStore.set({ accessToken: json.accessToken, refreshToken: json.refreshToken });
  return json.accessToken;
}

async function request(path, options = {}, { retryOn401 = true } = {}) {
  const { accessToken } = tokenStore.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401 && retryOn401) {
    const newAccess = await refreshTokens();
    if (newAccess) {
      return request(path, options, { retryOn401: false });
    }
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const api = {
  tokenStore,
  loginUrl(redirectUri) {
    const url = new URL(`${API_BASE}/oauth2/authorization/google`);
    if (redirectUri) {
      url.searchParams.set('redirect_uri', redirectUri);
    }
    return url.toString();
  },
  async fetchNotifications(page = 0, size = 10) {
    return request(`/api/notifications?page=${page}&size=${size}`);
  },
  async unreadCount() {
    return request('/api/notifications/unread-count');
  },
  async markRead(id) {
    return request(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },
  async deleteNotification(id) {
    return request(`/api/notifications/${id}`, { method: 'DELETE' });
  },
  async setTokens(accessToken, refreshToken) {
    tokenStore.set({ accessToken, refreshToken });
  },
  clearTokens() {
    tokenStore.clear();
  },
};
