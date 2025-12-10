import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

// Base URL for API from environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;

// Queue to hold requests while token is being refreshed
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: Error | null, token: string | null = null) => {
  failedRequestsQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  
  failedRequestsQueue = [];
};

// Request interceptor - attach access token to requests
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors and refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the access token
        // Cookie will be sent automatically due to withCredentials: true
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        const newAccessToken = response.data.tokens.accessToken;

        // Update access token in store (refresh token is in cookie)
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Process queued requests with new token
        processQueue(null, newAccessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError as Error, null);
        isRefreshing = false;
        
        useAuthStore.getState().logout();
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to create authenticated requests
export const createAuthenticatedRequest = async <T>(
  requestFn: () => Promise<T>
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Token expired, will be handled by interceptor
        throw new Error('Authentication required');
      } else if (error.response?.status === 403) {
        throw new Error('Access forbidden');
      } else if (error.response?.status && error.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw error;
  }
};

export default apiClient;
