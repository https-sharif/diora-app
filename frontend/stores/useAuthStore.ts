import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '@/types/User';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginSchema, signupSchema } from '@/validation/authSchema';
import { API_URL } from '@/constants/api';
import axios from 'axios';
import { useNotification } from '@/hooks/useNotification';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error: string | null }>;
  signup: (
    email: string,
    password: string,
    username: string,
    fullName: string
  ) => Promise<{ success: boolean; error: string | null }>;
  logout: () => void;
  followUser: (targetUserId: string) => void;
  likePost: (postId: string) => void;
  setIsAuthenticated: (val: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (val: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      setIsAuthenticated: (val) => set({ isAuthenticated: val }),
      setUser: (user) => set({ user }),
      setLoading: (val) => set({ loading: val }),
      setToken: (token: string) => set({ token }),

      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const validated = loginSchema.safeParse({ username, password });

          if (!validated.success) {
            const msg = validated.error?.issues[0]?.message || 'Invalid input';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
          }

          const response = await axios.post(
            `${API_URL}/api/auth/login`,
            { username, password },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const data = response.data;

          if (data.status) {
            await AsyncStorage.setItem('token', data.token);
            set({
              token: data.token,
              user: data.user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            return { success: true, error: null };
          } else {
            set({ error: data.message, loading: false });
            return { success: false, error: data.message };
          }
        } catch (err: any) {
          const errorMsg = err.message || 'Login failed';
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }
      },

      signup: async (email, password, username, fullName) => {
        set({ loading: true, error: null });
        try {
          const validated = signupSchema.safeParse({
            email,
            password,
            username,
            fullName,
          });
          if (!validated.success) {
            const msg = validated.error?.issues[0]?.message || 'Invalid input';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
          }

          const response = await axios.post(
            `${API_URL}/api/auth/signup`,
            { email, password, username, fullName },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const data = response.data;

          if (data.status) {
            await AsyncStorage.setItem('token', data.token);

            const newUser: User = {
              _id: data.user._id,
              username: data.user.username,
              fullName: data.user.fullName,
              email: data.user.email,
              following: data.user.following,
              likedPosts: data.user.likedPosts,
              followers: data.user.followers,
              posts: data.user.posts,
              avatar: data.user.avatar,
              bio: data.user.bio,
              isVerified: data.user.isVerified,
              createdAt: data.user.createdAt,
              type: data.user.type,
              settings: {
                theme: data.user.settings.theme,
                notifications: {
                  likes: data.user.settings.notifications.likes,
                  comments: data.user.settings.notifications.comments,
                  follow: data.user.settings.notifications.follow,
                  mention: data.user.settings.notifications.mention,
                  order: data.user.settings.notifications.order,
                  promotion: data.user.settings.notifications.promotion,
                  system: data.user.settings.notifications.system,
                  warning: data.user.settings.notifications.warning,
                  reportUpdate: data.user.settings.notifications.reportUpdate,
                  messages: data.user.settings.notifications.messages,
                  emailFrequency: data.user.settings.notifications.emailFrequency,
                },
              },
              avatarId: data.user.avatarId,
            };

            set({
              token: data.token,
              user: newUser,
              isAuthenticated: true,
              loading: false,
              error: null,
            });

            return { success: true, error: null };
          } else {
            set({ error: data.message, loading: false });
            return { success: false, error: data.message };
          }
        } catch (err: any) {
          const errorMsg = err.message || 'Signup failed';
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }
      },

      logout: async () => {
        await AsyncStorage.clear();
        set({ user: null, token: null, isAuthenticated: false });
        router.replace('/auth');
      },

      followUser: async (targetUserId) => {
        const { user, token } = get();
        if (!user) return;

        try {
          const res = await axios.put(
            `${API_URL}/api/user/follow/${targetUserId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const updatedFollowing = res.data.following;

          set({
            user: {
              ...user,
              following: updatedFollowing,
            },
          });
        } catch (err: any) {
          console.error(
            '❌ Follow/unfollow failed:',
            err.response?.data || err.message
          );
        }
      },

      likePost: async (postId) => {
        const { user, token } = get();
        console.log('Like post called', postId);
        if (!user || !token) return;

        try {
          const res = await axios.put(
            `${API_URL}/api/post/like/${postId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const updatedLikedPosts = res.data.user.likedPosts;

          set({
            user: {
              ...user,
              likedPosts: updatedLikedPosts,
            },
          });
        } catch (err: any) {
          console.error('❌ Like/unlike failed:', err.response?.data || err.message);
        }
      },

      reset: () =>
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
