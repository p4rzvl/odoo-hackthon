import { RegisterInput, LoginInput } from '../validations/auth.validation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  country?: string;
  profilePhoto?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

export const registerUser = async (data: RegisterInput): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    user: json.data?.user,
    message: json.message || json.data?.message,
    error: json.error
  };
};

export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    user: json.data?.user,
    message: json.message || json.data?.message,
    error: json.error
  };
};

export const refreshSession = async (refreshToken?: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  const res = await fetch(`${API_URL}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    credentials: 'include'
  });
  return res.json();
};

export const logoutUser = async (refreshToken?: string): Promise<{ success: boolean; error?: string }> => {
  const res = await fetch(`${API_URL}/v1/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    credentials: 'include'
  });
  return res.json();
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/v1/auth/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    user: json.data?.user,
    message: json.message || json.data?.message,
    error: json.error
  };
};

export const getDashboardMetrics = async (token?: string): Promise<any> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/v1/dashboard/metrics`, {
    headers,
    credentials: 'include'
  });
  return res.json();
};

export const getVendorUsersList = async (): Promise<any> => {
  const res = await fetch(`${API_URL}/v1/auth/users?role=VENDOR`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return res.json();
};
