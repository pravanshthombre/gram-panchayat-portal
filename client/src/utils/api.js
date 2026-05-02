/**
 * api.js — Axios API Helper
 * Centralizes all HTTP requests to the backend
 */
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || '/api';
console.log('DEBUG: API Base URL is:', baseUrl);

const API = axios.create({ baseURL: baseUrl });

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
    : '';
  return `${baseUrl}${path}`;
};
