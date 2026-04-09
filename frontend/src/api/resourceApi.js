/*import { api } from '../api';

// GET all resources
export const getAllResources = async () => {
    return api.request('/api/resources');
};

// GET single resource by id
export const getResourceById = async (id) => {
    return api.request(`/api/resources/${id}`);
};

// GET search with filters
export const searchResources = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type)     params.append('type',     filters.type);
    if (filters.status)   params.append('status',   filters.status);
    if (filters.location) params.append('location', filters.location);
    if (filters.capacity) params.append('capacity', filters.capacity);
    if (filters.search)   params.append('search',   filters.search);

    const query = params.toString();
    return api.request(`/api/resources/search${query ? '?' + query : ''}`);
};

// POST create new resource
export const createResource = async (data) => {
    return api.request('/api/resources', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// PUT update resource
export const updateResource = async (id, data) => {
    return api.request(`/api/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// DELETE resource
export const deleteResource = async (id) => {
    return api.request(`/api/resources/${id}`, {
        method: 'DELETE',
    });
};
*/
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const ACCESS_KEY = 'sc_access_token';
const REFRESH_KEY = 'sc_refresh_token';

function getTokens() {
    return {
        accessToken: localStorage.getItem(ACCESS_KEY) || '',
        refreshToken: localStorage.getItem(REFRESH_KEY) || '',
    };
}

function setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

async function refreshTokens() {
    const { refreshToken } = getTokens();
    if (!refreshToken) return null;
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    setTokens(json.accessToken, json.refreshToken);
    return json.accessToken;
}

async function request(path, options = {}, retryOn401 = true) {
    const { accessToken } = getTokens();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401 && retryOn401) {
        const newAccess = await refreshTokens();
        if (newAccess) return request(path, options, false);
    }

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return res.text();
}

export const getAllResources = async () => {
    return request('/api/resources');
};

export const getResourceById = async (id) => {
    return request(`/api/resources/${id}`);
};

export const searchResources = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type)     params.append('type',     filters.type);
    if (filters.status)   params.append('status',   filters.status);
    if (filters.location) params.append('location', filters.location);
    if (filters.capacity) params.append('capacity', filters.capacity);
    if (filters.search)   params.append('search',   filters.search);
    const query = params.toString();
    return request(`/api/resources/search${query ? '?' + query : ''}`);
};

export const createResource = async (data) => {
    return request('/api/resources', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateResource = async (id, data) => {
    return request(`/api/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const deleteResource = async (id) => {
    return request(`/api/resources/${id}`, {
        method: 'DELETE',
    });
};