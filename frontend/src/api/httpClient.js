import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const httpClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default httpClient;
