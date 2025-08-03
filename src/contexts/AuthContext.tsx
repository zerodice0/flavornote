'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, CreateUserInput, LoginInput } from '@/types';

// AuthContext type definition
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (userData: CreateUserInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Create AuthContext with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

// AuthProvider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Token storage key
const TOKEN_KEY = 'flavornote_auth_token';

/**
 * AuthProvider component that manages authentication state
 * Provides login, register, logout functionality and automatic token persistence
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user profile using stored token
   */
  const fetchUserProfile = async (authToken: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.data?.user) {
        return data.data.user;
      } else {
        // Token is invalid, remove it
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  };

  /**
   * Initialize authentication state on mount
   * Check for stored token and validate it
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        const savedToken = localStorage.getItem(TOKEN_KEY);
        
        if (savedToken) {
          setToken(savedToken);
          
          // Validate token and fetch user data
          const userData = await fetchUserProfile(savedToken);
          
          if (userData) {
            setUser(userData);
          } else {
            // Invalid token, clear it
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear potentially corrupted data
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   */
  const login = async (credentials: LoginInput): Promise<void> => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const { user: userData, token: authToken } = data.data;
        
        // Update state
        setUser(userData);
        setToken(authToken);
        
        // Persist token to localStorage
        localStorage.setItem(TOKEN_KEY, authToken);
      } else {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      // Re-throw error for component handling
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register function
   */
  const register = async (userData: CreateUserInput): Promise<void> => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const { user: newUser, token: authToken } = data.data;
        
        // Update state
        setUser(newUser);
        setToken(authToken);
        
        // Persist token to localStorage
        localStorage.setItem(TOKEN_KEY, authToken);
      } else {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      // Re-throw error for component handling
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = (): void => {
    // Clear state
    setUser(null);
    setToken(null);
    
    // Remove token from localStorage
    localStorage.removeItem(TOKEN_KEY);
    
    // Optional: Call logout API endpoint
    fetch('/api/auth/logout', {
      method: 'POST',
    }).catch((error) => {
      console.warn('Logout API call failed:', error);
    });
  };

  /**
   * Refresh user data (useful after profile updates)
   */
  const refreshUser = async (): Promise<void> => {
    if (!token) return;

    try {
      const userData = await fetchUserProfile(token);
      if (userData) {
        setUser(userData);
      } else {
        // Token is invalid, logout
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      logout();
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use AuthContext
 * Provides easy access to authentication state and functions
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export AuthContext for advanced usage
export { AuthContext };