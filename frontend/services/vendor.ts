const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Vendor {
  id: number;
  userId: number;
  companyName: string;
  gstNumber: string;
  category: string;
  contactNumber: string;
  address: string;
  status: 'PENDING' | 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface VendorsResponse {
  success: boolean;
  data?: {
    vendors: Vendor[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface VendorDetailResponse {
  success: boolean;
  data?: {
    vendor: Vendor;
  };
  error?: string;
}

export const getVendorsList = async (filters: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<VendorsResponse> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const res = await fetch(`${API_URL}/v1/vendors?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return res.json();
};

export const getVendorDetail = async (id: number): Promise<VendorDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/vendors/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return res.json();
};

export const onboardVendor = async (data: {
  userId: number;
  companyName: string;
  gstNumber: string;
  category: string;
  contactNumber: string;
  address: string;
}): Promise<VendorDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/vendors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  return res.json();
};

export const updateVendorStatus = async (id: number, status: 'PENDING' | 'ACTIVE' | 'BLOCKED'): Promise<VendorDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/vendors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
    credentials: 'include'
  });
  return res.json();
};
