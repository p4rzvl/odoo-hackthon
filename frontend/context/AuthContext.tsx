'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, loginUser, logoutUser, refreshSession, AuthResponse } from '../services/auth';
import { RegisterInput, LoginInput } from '../validations/auth.validation';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<AuthResponse>;
  register: (data: RegisterInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          setToken(accessToken);
        } else if (refreshToken) {
          // If access token is gone but refresh token exists, try to refresh
          const refreshRes = await refreshSession(refreshToken);
          if (refreshRes.success && refreshRes.accessToken) {
            localStorage.setItem('access_token', refreshRes.accessToken);
            setToken(refreshRes.accessToken);
            if (storedUser) setUser(JSON.parse(storedUser));
          } else {
            // Revoked or expired refresh token
            localStorage.removeItem('auth_user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
      } catch (err) {
        console.error('Failed to load local session:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Login handler
  const login = async (data: LoginInput): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await loginUser(data);
      if (res.success && res.user && res.accessToken && res.refreshToken) {
        setUser(res.user);
        setToken(res.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        localStorage.setItem('access_token', res.accessToken);
        localStorage.setItem('refresh_token', res.refreshToken);
        router.push('/dashboard');
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (data: RegisterInput): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await registerUser(data);
      if (res.success && res.user && res.accessToken && res.refreshToken) {
        setUser(res.user);
        setToken(res.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        localStorage.setItem('access_token', res.accessToken);
        localStorage.setItem('refresh_token', res.refreshToken);
        router.push('/dashboard');
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch (err) {
        console.error('Logout API failure:', err);
      }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
