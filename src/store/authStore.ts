import { create } from 'zustand';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
}

// Helper to get display name
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAccessToken: (token: string) => void;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  clearError: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAccessToken: (token: string) => {
    set({ accessToken: token, isAuthenticated: true });
  },

  setUser: (user: User, token: string) => {
    set({ user, accessToken: token, isAuthenticated: true });
  },

  logout: () => {
    // Clear in-memory access token
    // Refresh token is now in HttpOnly cookie, cleared by backend
    set({ 
      user: null, 
      accessToken: null, 
      isAuthenticated: false,
      error: null 
    });
  },

  clearError: () => {
    set({ error: null });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
