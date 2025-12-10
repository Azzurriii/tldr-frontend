import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAccessToken, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('AuthProvider: Checking for existing session...');
        
        // Use axios directly (not apiClient) to avoid interceptor loop
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        console.log('AuthProvider: Token refreshed successfully, userId:', response.data.userId);
        
        // Update the access token in the store
        setAccessToken(response.data.tokens.accessToken);
        
        console.log('AuthProvider: Access token stored, fetching user profile...');

        // Fetch user profile with the new access token
        const userResponse = await axios.get(`${BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${response.data.tokens.accessToken}`,
          },
        });
        
        console.log('AuthProvider: User profile fetched:', userResponse.data.email);
        setUser(userResponse.data, response.data.tokens.accessToken);
        console.log('AuthProvider: Session restored successfully');

      } catch (error) {
        console.log('AuthProvider: No valid session found or session expired');
        // No valid session, continue as logged out
        logout();
      } finally {
        setIsChecking(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Restoring session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

