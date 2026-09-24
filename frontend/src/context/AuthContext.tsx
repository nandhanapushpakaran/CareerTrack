import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, clearTokens, getAccessToken, setTokens } from '../lib/api';
import { AuthResponse, User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (fullName: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const userData = await api.get<User>('/users/me');
      setUser(userData);
    } catch (err) {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const data = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
        remember_me: rememberMe,
      });
      setTokens(data.access_token, data.refresh_token);
      await fetchCurrentUser();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    setIsLoading(true);
    try {
      const data = await api.post<AuthResponse>('/auth/register', {
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      });
      setTokens(data.access_token, data.refresh_token);
      await fetchCurrentUser();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    try {
      api.post('/auth/logout', {}).catch(() => {});
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
