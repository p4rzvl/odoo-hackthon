'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, loginUser, logoutUser, refreshSession, getCurrentUser, AuthResponse, User } from '../services/auth';
import { RegisterInput, LoginInput } from '../validations/auth.validation';

interface ExtendedUser extends User {
  name: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<AuthResponse>;
  register: (data: RegisterInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Helper to map User with full name
  const mapUser = (u: User): ExtendedUser => ({
    ...u,
    name: `${u.firstName} ${u.lastName}`.trim()
  });

  // Load session from cookies on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const meRes = await getCurrentUser();
        if (meRes.success && meRes.user) {
          setUser(mapUser(meRes.user));
          setToken('session-active');
        } else {
          // If initial me request fails, try refreshing the cookie session
          const refreshRes = await refreshSession();
          if (refreshRes.success) {
            const retryRes = await getCurrentUser();
            if (retryRes.success && retryRes.user) {
              setUser(mapUser(retryRes.user));
              setToken('session-active');
            } else {
              setUser(null);
              setToken(null);
            }
          } else {
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.error('Failed to load session:', err);
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
      if (res.success && res.user) {
        const extUser = mapUser(res.user);
        setUser(extUser);
        setToken('session-active');
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
      // We do NOT log in on registration since it defaults to isActive = false (pending Admin activation)
      return res;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout API failure:', err);
    }
    setUser(null);
    setToken(null);
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
