import { RegisterInput, LoginInput } from '../validations/auth.validation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface AuthResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export const registerUser = async (data: RegisterInput): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const refreshSession = async (refreshToken: string): Promise<{ success: boolean; accessToken?: string; error?: string }> => {
  const res = await fetch(`${API_URL}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  return res.json();
};

export const logoutUser = async (refreshToken: string): Promise<{ success: boolean; error?: string }> => {
  const res = await fetch(`${API_URL}/v1/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  return res.json();
};

export const getDashboardMetrics = async (token: string): Promise<any> => {
  const res = await fetch(`${API_URL}/v1/dashboard/metrics`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.json();
};
