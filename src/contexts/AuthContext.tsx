import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthState, User } from '@/lib/types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: undefined
  });

  useEffect(() => {
    // Check for stored auth on mount
    const storedAuth = localStorage.getItem('siem_auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setAuthState({
          user: parsed.user,
          isAuthenticated: true,
          token: parsed.token
        });
      } catch (error) {
        localStorage.removeItem('siem_auth');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app this would be an API call
    if ((username === 'admin' && password === 'admin') || 
        (username === 'analyst' && password === 'analyst')) {
      
      const user: User = {
        id: username === 'admin' ? 'user_admin' : 'user_analyst',
        username,
        role: username === 'admin' ? 'admin' : 'analyst',
        email: `${username}@siem.local`,
        lastLogin: new Date()
      };

      const token = `mock_jwt_${Math.random().toString(36).substr(2, 9)}`;
      
      const newAuthState = {
        user,
        isAuthenticated: true,
        token
      };

      setAuthState(newAuthState);
      
      // Store in localStorage for persistence
      localStorage.setItem('siem_auth', JSON.stringify({
        user,
        token
      }));

      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      token: undefined
    });
    localStorage.removeItem('siem_auth');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
