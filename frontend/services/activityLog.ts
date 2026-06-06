const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface ActivityLog {
  id: number;
  actorId: number | null;
  actionType: string;
  description: string;
  entityId: number | null;
  entityType: string | null;
  createdAt: string;
  actor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getActivityLogsList = async (params?: {
  actionTypes?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ logs: ActivityLog[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>> => {
  const search = new URLSearchParams();
  if (params?.actionTypes) search.append('actionTypes', params.actionTypes);
  if (params?.page) search.append('page', String(params.page));
  if (params?.limit) search.append('limit', String(params.limit));

  const res = await fetch(`${API_URL}/v1/activity-logs?${search.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return res.json();
};

export const getActivityLogDetail = async (id: number): Promise<ApiResponse<{ log: ActivityLog }>> => {
  const res = await fetch(`${API_URL}/v1/activity-logs/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return res.json();
};
