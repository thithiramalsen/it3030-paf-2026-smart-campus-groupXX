import axios from 'axios';
import { getAccessToken } from '../auth/tokenStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const httpClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default httpClient;
