import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.publicMetadata?.role === 'admin',
      loading: false
    });
  },

  clearUser: () => {
    set({ user: null, isAuthenticated: false, isAdmin: false, loading: false });
  },

  updateUser: (updates) => {
    set(state => {
      const newUser = state.user ? { ...state.user, ...updates } : null;
      return { user: newUser };
    });
  }
}));
