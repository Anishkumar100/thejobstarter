import { create } from 'zustand';
import { users as mockUsers } from '../data/users.js';
import { searchUsers as fetchUsers, getUserByUsername as fetchUserByUsername, updateProfile, followUser, unfollowUser } from '../api/userApi.js';
import { useAuthStore } from './useAuthStore.js';
import { useToastStore } from './useToastStore.js';

import { usePageLoadingStore } from './usePageLoadingStore.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useUserStore = create((set, get) => ({
  users: [],
  currentProfile: null,
  loading: false,
  error: null,

  fetchUsers: async (query = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Users');
    console.log('[USER] Searching users:', query);
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        let result = [...mockUsers];
        /* Add the logged-in Clerk user to community listing if not already in mock data */
        const authUser = useAuthStore.getState().user;
        if (authUser) {
          const exists = result.some(u => u.username === authUser.username);
          if (!exists) {
            result.unshift({
              _id: authUser.id,
              username: authUser.username,
              displayName: authUser.displayName || authUser.username,
              avatar: authUser.avatar || '',
              bio: '',
              skills: [],
              followers: [],
              following: [],
              joinDate: new Date().toISOString().split('T')[0]
            });
          }
        }
        if (query.search) result = result.filter(u => u.username.includes(query.search) || u.displayName?.includes(query.search));
        set({ users: result, loading: false });
      } else {
        const res = await fetchUsers(query);
        set({ users: res.data, loading: false });
      }
    } catch (error) {
      console.error('[USER] Error:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Users');
    }
  },

  fetchProfile: async (username) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Users');
    console.log('[USER] Fetching profile:', username);
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        let user = mockUsers.find(u => u.username === username);
        /* If not found in mock data, check if it's the logged-in user from the auth store */
        if (!user) {
          const authUser = useAuthStore.getState().user;
          if (authUser && authUser.username === username) {
            user = {
              _id: authUser.id,
              username: authUser.username,
              displayName: authUser.displayName || authUser.username,
              avatar: authUser.avatar || '',
              bio: '',
              college: '',
              year: '',
              externalLinks: [],
              skills: [],
              followers: [],
              following: [],
              joinDate: new Date().toISOString().split('T')[0]
            };
            console.log('[USER] Built profile from auth store:', username);
          }
        }
        set({ currentProfile: user || null, loading: false });
        console.log('[USER] Profile found:', !!user);
      } else {
        const res = await fetchUserByUsername(username);
        set({ currentProfile: res.data, loading: false });
      }
    } catch (error) {
      console.error('[USER] Error:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Users');
    }
  },

  updateProfile: async (username, data) => {
    console.log('[USER] Updating profile:', username, data);
    if (USE_MOCK) {
      /* Merge data into currentProfile in memory */
      const current = get().currentProfile;
      if (current) {
        const updated = { ...current, ...data };
        set({ currentProfile: updated });
        return updated;
      }
      return;
    }
    const res = await updateProfile(username, data);
    set({ currentProfile: res.data });
    return res.data;
  },

  follow: async (userId) => {
    console.log('[USER] Following:', userId);
    if (USE_MOCK) return;
    try {
      await followUser(userId);
      useToastStore.getState().success('Followed successfully!');
    } catch (err) {
      useToastStore.getState().error(err.message);
    }
  },

  unfollow: async (userId) => {
    console.log('[USER] Unfollowing:', userId);
    if (USE_MOCK) return;
    try {
      await unfollowUser(userId);
      useToastStore.getState().success('Unfollowed successfully!');
    } catch (err) {
      useToastStore.getState().error(err.message);
    }
  }
}));
