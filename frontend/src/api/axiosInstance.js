import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || '';
const baseURL = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`)
  : '/api';

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
