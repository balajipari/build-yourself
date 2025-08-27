import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import type { User } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = async () => {
    const token = localStorage.getItem('jwt_token');
    
    console.log('🔍 checkAuth called:', { token: !!token });
    
    if (token) {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          console.log('✅ User data fetched:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ Authentication set to true');
        } else {
          console.log('❌ No user data returned');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error fetching user info:', error);
        logout();
      }
    } else {
      console.log('❌ No token found');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = (userData: User) => {
    console.log('🔐 login called with:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    console.log('🔐 Authentication state updated');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local state regardless of backend success
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    checkAuth();

    // Listen for storage changes (when tokens are added/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwt_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check when the window gains focus (user returns from another tab)
    const handleFocus = () => {
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);

    // Set up periodic refresh of user data
    const refreshInterval = setInterval(() => {
      if (isAuthenticated) {
        checkAuth();
      }
    }, 60000); // Refresh every minute

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated]);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
