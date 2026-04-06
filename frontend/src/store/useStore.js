import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/client';

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      token: null,
      user: null,
      isAuthenticated: false,

      // Subscriptions state
      subscriptions: [],
      loading: false,
      error: null,

      // Auth actions
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user }),

      login: (token, user) => set({ token, user, isAuthenticated: true }),

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, subscriptions: [] });
      },

      // Subscription actions
      fetchSubscriptions: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (filters.category) params.append('category', filters.category);
          if (filters.status) params.append('status', filters.status);
          if (filters.search) params.append('search', filters.search);

          const res = await apiClient.get(`/subscriptions?${params}`);
          set({ subscriptions: res.data.subscriptions, loading: false });
        } catch (err) {
          set({ error: err.response?.data?.error || 'Failed to load subscriptions', loading: false });
        }
      },

      addSubscription: async (data) => {
        const res = await apiClient.post('/subscriptions', data);
        set((state) => ({
          subscriptions: [...state.subscriptions, res.data.subscription],
        }));
        return res.data.subscription;
      },

      updateSubscription: async (id, data) => {
        const res = await apiClient.put(`/subscriptions/${id}`, data);
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? res.data.subscription : s
          ),
        }));
        return res.data.subscription;
      },

      deleteSubscription: async (id) => {
        await apiClient.delete(`/subscriptions/${id}`);
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        }));
      },
    }),
    {
      name: 'smart-sub-store',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
