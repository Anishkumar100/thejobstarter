import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,

  setUser: (user) => {
    console.log('[AUTH] Setting user:', user?.username);
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.publicMetadata?.role === 'admin',
      loading: false
    });
  },

  clearUser: () => {
    console.log('[AUTH] Clearing user session');
    set({ user: null, isAuthenticated: false, isAdmin: false, loading: false });
  },

  updateUser: (updates) => {
    console.log('[AUTH] updateUser called with:', updates);
    set(state => {
      const newUser = state.user ? { ...state.user, ...updates } : null;
      console.log('[AUTH] Updated user:', newUser ? { displayName: newUser.displayName, avatar: newUser.avatar?.slice(0, 60) } : null);
      return { user: newUser };
    });
  }
}));
