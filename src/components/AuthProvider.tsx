import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/authApi';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAccessToken, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('AuthProvider: Checking for existing session...');
        // Try to refresh token using HttpOnly cookie
        // If cookie exists, backend will refresh the token automatically
        const response = await authApi.refreshToken(''); // Empty string since cookie is used
        console.log('AuthProvider: Token refreshed successfully, userId:', response.userId);
        
        // Update the access token in the store
        setAccessToken(response.tokens.accessToken);
        
        // Refresh token is managed by HttpOnly cookie on backend
        console.log('AuthProvider: Access token stored, fetching user profile...');

        // Fetch user profile with the new access token
        const user = await authApi.getProfile();
        console.log('AuthProvider: User profile fetched:', user.email);
        setUser(user, response.tokens.accessToken);
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
  }, [setUser, setAccessToken, logout]);

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

