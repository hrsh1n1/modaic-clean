/**
 * modaic/frontend/src/context/authStore.js
 * Global auth state via Zustand
 */

import { create } from 'zustand';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const getStoredUser  = () => { try { return JSON.parse(localStorage.getItem('modaic_user')); } catch { return null; } };
const getStoredToken = () => localStorage.getItem('modaic_token') || null;

const useAuthStore = create((set, get) => ({
  user:   getStoredUser(),
  token:  getStoredToken(),
  loading: false,

  register: async (data) => {
    set({ loading: true });
    try {
      const res = await authAPI.register(data);
      const { user, accessToken } = res.data.data;
      localStorage.setItem('modaic_token', accessToken);
      localStorage.setItem('modaic_user', JSON.stringify(user));
      set({ user, token: accessToken, loading: false });
      toast.success('Welcome to Modaic! ✨');
      return true;
    } catch {
      set({ loading: false });
      return false;
    }
  },

  login: async (data) => {
    set({ loading: true });
    try {
      const res = await authAPI.login(data);
      const { user, accessToken } = res.data.data;
      localStorage.setItem('modaic_token', accessToken);
      localStorage.setItem('modaic_user', JSON.stringify(user));
      set({ user, token: accessToken, loading: false });
      toast.success('Welcome back! 🌸');
      return true;
    } catch {
      set({ loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('modaic_token');
    localStorage.removeItem('modaic_user');
    set({ user: null, token: null });
    toast.success('See you soon! 💕');
  },

  updateUser: (updates) => {
    const updated = { ...get().user, ...updates };
    localStorage.setItem('modaic_user', JSON.stringify(updated));
    set({ user: updated });
  },

  // Fetch fresh user data from server — fixes stale stats in sidebar + dashboard
  refreshUser: async () => {
    try {
      const res = await authAPI.me();
      const user = res.data.data;
      localStorage.setItem('modaic_user', JSON.stringify(user));
      set({ user });
    } catch {
      // silently fail — not critical
    }
  },

}));

export default useAuthStore;
