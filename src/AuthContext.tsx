import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setBaseURL } from '@/lib/api';

interface AuthContextType {
  token: string | null;
  loading: boolean;
  login: (id: string, secret: string, baseURL: string) => Promise<void>;
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

  const login = async (id: string, secret: string, baseURL: string) => {
    setLoading(true);
    try {
      setBaseURL(baseURL);
      const response = await api.post('/user/enroll', { id, secret });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('baseURL', baseURL);
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
    localStorage.removeItem('baseURL');
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const savedBaseURL = localStorage.getItem('baseURL');
      if (savedBaseURL) {
        setBaseURL(savedBaseURL);
      }
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