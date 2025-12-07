import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, type AuthResponse, type LoginCredentials, type RegisterData, type GoogleAuthData } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Login mutation
export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.login(credentials);
      return response;
    },
    onSuccess: async (data: AuthResponse) => {
      // Update auth store with access token
      setAccessToken(data.tokens.accessToken);
      
      
      // Fetch user profile immediately
      try {
        const user = await authApi.getProfile();
        setUser(user, data.tokens.accessToken);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      // Navigate to dashboard
      navigate('/inbox');
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
    },
  });
}

// Register mutation
export function useRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await authApi.register(data);
      return response;
    },
    onSuccess: async (data: AuthResponse) => {
      // Update auth store
      setAccessToken(data.tokens.accessToken);
      
      
      // Fetch user profile immediately
      try {
        const user = await authApi.getProfile();
        setUser(user, data.tokens.accessToken);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
      
      // Invalidate user query
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      // Navigate to dashboard
      navigate('/inbox');
    },
    onError: (error: Error) => {
      console.error('Registration failed:', error);
    },
  });
}

// Initiate Google OAuth flow (redirects to Google)
export function useInitiateGoogleOAuth() {
  return useMutation({
    mutationFn: async () => {
      await authApi.initiateGoogleOAuth();
      // This will redirect, so we never return
    },
    onError: (error: Error) => {
      console.error('Failed to initiate Google OAuth:', error);
    },
  });
}

// Google OAuth callback mutation (exchanges code for tokens)
export function useGoogleLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: async (data: GoogleAuthData) => {
      const response = await authApi.googleAuth(data);
      return response;
    },
    onSuccess: async (data: AuthResponse) => {
      // Update auth store with access token first
      setAccessToken(data.tokens.accessToken);
      
      
      // Fetch user profile immediately
      try {
        const user = await authApi.getProfile();
        setUser(user, data.tokens.accessToken);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      
      // Backend creates mailbox asynchronously - wait a bit then refetch
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      }, 2000);
      
      // Navigate to inbox
      navigate('/inbox');
    },
    onError: (error: Error) => {
      console.error('Google login failed:', error);
    },
  });
}

// Logout mutation
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout: logoutStore } = useAuthStore();

  return useMutation({
    mutationFn: async (revokeAll: boolean = false) => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken, revokeAll);
      }
    },
    onSuccess: () => {
      // Clear auth store
      logoutStore();
      
      // Clear all queries
      queryClient.clear();
      
      // Navigate to login
      navigate('/login');
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      logoutStore();
      navigate('/login');
    },
  });
}

// Fetch user data (for protected routes)
export function useUser() {
  const { isAuthenticated, setUser, accessToken } = useAuthStore();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const user = await authApi.getProfile();
      // Update store with fetched user data
      if (accessToken) {
        setUser(user, accessToken);
      }
      return user;
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

// Refresh token mutation
export function useRefreshToken() {
  const { setAccessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authApi.refreshToken(refreshToken);
      return response;
    },
    onSuccess: (data: AuthResponse) => {
      // Update auth store with new access token
      // Refresh token is automatically updated in HttpOnly cookie by backend
      setAccessToken(data.tokens.accessToken);
      
      // Invalidate user query
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error: Error) => {
      console.error('Token refresh failed:', error);
      // Clear auth state on refresh failure
      useAuthStore.getState().logout();
    },
  });
}
