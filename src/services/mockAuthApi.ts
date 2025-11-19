import { jwtDecode } from 'jwt-decode';

// Mock authentication backend
// In a real app, these would be actual API endpoints

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RefreshResponse {
  accessToken: string;
  user: User; // Added user to refresh response
}

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

// Mock tokens
const generateToken = (prefix: string): string => {
  return `${prefix}_${Math.random().toString(36).substring(2)}${Date.now()}`;
};

// Store refresh tokens (in a real app, this would be server-side database)
// For this mock, we won't persist this list across reloads to keep it simple,
// BUT we will allow any token matching our format to "refresh" to simulate persistence.
// const validRefreshTokens = new Set<string>(); 

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthApi = {
  // Email/Password Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(800); // Simulate network delay

    // For demo purposes, accept any valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const accessToken = generateToken('access');
    const refreshToken = generateToken('refresh');
    
    // validRefreshTokens.add(refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: Math.random().toString(36).substring(7),
        email,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      },
    };
  },

  // Google Sign-In
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    await delay(800);

    try {
        // Decode the Google JWT to get real user info
        const decoded = jwtDecode<GoogleJwtPayload>(credential);
        
        const accessToken = generateToken('access');
        const refreshToken = generateToken('refresh');
        
        // validRefreshTokens.add(refreshToken);

        return {
          accessToken,
          refreshToken,
          user: {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
          },
        };
    } catch (error) {
        console.error("Error decoding Google token:", error);
        throw new Error("Invalid Google Credential");
    }
  },

  // Refresh Access Token
  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    await delay(500);

    // In a real app, we would check the DB. 
    // Here we just check format to simulate a valid token check
    if (!refreshToken || !refreshToken.startsWith('refresh_')) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const accessToken = generateToken('access');

    // Mock restoring user data based on the "session"
    // Since we don't have a real DB, we'll return a generic user or try to restore from local storage if we implemented that.
    // For this assignment, let's return a consistent "Restored User" or try to be smart.
    // A simple trick: We can't know WHO the user is just from a random string token in this mock 
    // without a DB. 
    // IMPROVEMENT: We will return a placeholder "Restored User". 
    // In a real app, the backend knows who owns the refresh token.
    
    return {
      accessToken,
      user: {
        id: 'restored_user_id',
        email: 'user@example.com',
        name: 'Restored User',
        // If you want to persist the Google User specific data, you'd need to store the User object in localStorage too
        // But strictly speaking, refresh token flow should return the user.
      }
    };
  },

  // Validate Token
  validateToken: async (accessToken: string): Promise<boolean> => {
    await delay(200);
    return accessToken.startsWith('access_');
  },

  // Logout
  logout: async (_refreshToken: string): Promise<void> => {
    await delay(300);
    // validRefreshTokens.delete(refreshToken);
  },
};
