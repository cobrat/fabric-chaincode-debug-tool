import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/lib/api';

interface AuthContextType {
  token: string | null;
  loading: boolean;
  login: (id: string, secret: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (id: string, secret: string) => {
    setLoading(true);
    try {
      const response = await api.post('/user/enroll', { id, secret });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      // 使用 /user/identities 接口来验证 token
      await api.get('/user/identities');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      setLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};