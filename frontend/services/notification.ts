const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  relatedEntityId?: number;
  entityType?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getNotificationsList = async (params?: { type?: string; read?: boolean; page?: number; limit?: number }): Promise<ApiResponse<{ notifications: Notification[]; total: number }>> => {
  const search = new URLSearchParams();
  if (params?.type) search.append('type', params.type);
  if (params?.read !== undefined) search.append('read', String(params.read));
  if (params?.page) search.append('page', String(params.page));
  if (params?.limit) search.append('limit', String(params.limit));

  const res = await fetch(`${API_URL}/v1/notifications?${search.toString()}`, {
    credentials: 'include'
  });
  return res.json();
};

export const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
  const res = await fetch(`${API_URL}/v1/notifications/unread-count`, {
    credentials: 'include'
  });
  return res.json();
};

export const markAsRead = async (id: number): Promise<ApiResponse<Notification>> => {
  const res = await fetch(`${API_URL}/v1/notifications/${id}/read`, {
    method: 'PATCH',
    credentials: 'include'
  });
  return res.json();
};

export const markAllAsRead = async (): Promise<ApiResponse<null>> => {
  const res = await fetch(`${API_URL}/v1/notifications/read-all`, {
    method: 'POST',
    credentials: 'include'
  });
  return res.json();
};
