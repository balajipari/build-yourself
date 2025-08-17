import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import type { User } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = () => {
    const token = localStorage.getItem('jwt_token');
    const userInfo = localStorage.getItem('user_info');
    
    console.log('🔍 checkAuth called:', { token: !!token, userInfo: !!userInfo });
    
    if (token && userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        console.log('✅ User data parsed:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ Authentication set to true');
      } catch (error) {
        console.error('❌ Error parsing user info:', error);
        logout();
      }
    } else {
      console.log('❌ No token or user info found');
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

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    checkAuth();

    // Listen for storage changes (when tokens are added/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwt_token' || e.key === 'user_info') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check when the window gains focus (user returns from another tab)
    const handleFocus = () => {
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
