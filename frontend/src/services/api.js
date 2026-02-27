/**
 * modaic/frontend/src/services/api.js
 * Axios instance with auth interceptors
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor — attach JWT ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('modaic_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — handle errors ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const status  = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('modaic_token');
      localStorage.removeItem('modaic_user');
      window.location.href = '/login';
    } else if (status !== 404) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// ── API helpers ───────────────────────────────────────────────
export const authAPI = {
  register: (data)   => api.post('/auth/register', data),
  login:    (data)   => api.post('/auth/login', data),
  me:       ()       => api.get('/auth/me'),
  updateProfile: (d) => api.put('/auth/profile', d),
};

export const wardrobeAPI = {
  getItems:  (params) => api.get('/wardrobe', { params }),
  addItem:   (data)   => api.post('/wardrobe', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateItem: (id, d) => api.put(`/wardrobe/${id}`, d),
  deleteItem: (id)    => api.delete(`/wardrobe/${id}`),
  recordWear: (id)    => api.post(`/wardrobe/${id}/wear`),
};

export const outfitAPI = {
  getOutfits: (params) => api.get('/outfits', { params }),
  saveOutfit: (data)   => api.post('/outfits', data),
  toggleFav:  (id)     => api.patch(`/outfits/${id}/favorite`),
  deleteOutfit:(id)    => api.delete(`/outfits/${id}`),
};

export const stylistAPI = {
  chat:            (data) => api.post('/stylist/chat', data),
  generateOutfits: (data) => api.post('/stylist/generate-outfits', data),
  getSessions:     ()     => api.get('/stylist/sessions'),
  getSession:      (id)   => api.get(`/stylist/sessions/${id}`),
};

export const insightsAPI = {
  getInsights: () => api.get('/insights'),
};

export default api;
