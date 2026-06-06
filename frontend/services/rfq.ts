const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface RfqLineItem {
  id?: number;
  rfqId?: number;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface RfqVendor {
  vendorId: number;
  vendor: {
    id: number;
    companyName: string;
    category: string;
  };
}

export interface RfqAttachment {
  id?: number;
  fileName: string;
  filePath: string;
  uploadedAt?: string;
}

export interface Rfq {
  id: number;
  title: string;
  category: string;
  description: string;
  deadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdBy: number;
  createdAt: string;
  creator: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  lineItems: RfqLineItem[];
  rfqVendors: RfqVendor[];
  attachments?: RfqAttachment[];
  quotations?: any[];
  _count?: {
    lineItems: number;
    quotations: number;
  };
}

export interface RfqsResponse {
  success: boolean;
  rfqs?: Rfq[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface RfqDetailResponse {
  success: boolean;
  data?: {
    rfq: Rfq;
  };
  error?: string;
}

export const getRfqsList = async (filters: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<RfqsResponse> => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const res = await fetch(`${API_URL}/v1/rfqs?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    rfqs: json.data?.rfqs,
    pagination: json.data?.pagination,
    error: json.error
  };
};

export const getRfqDetail = async (id: number): Promise<RfqDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/rfqs/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    data: json.data,
    error: json.error
  };
};

export const createRfq = async (data: {
  title: string;
  category: string;
  description: string;
  deadline: string;
  lineItems: { itemName: string; quantity: number; unit: string }[];
  assignedVendorIds: number[];
  attachments?: { fileName: string; filePath: string }[];
}): Promise<RfqDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/rfqs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    data: json.data,
    error: json.error
  };
};

export const publishRfq = async (id: number): Promise<RfqDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/rfqs/${id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    data: json.data,
    error: json.error
  };
};

export const updateRfq = async (id: number, data: {
  title?: string;
  category?: string;
  description?: string;
  deadline?: string;
  lineItems?: { itemName: string; quantity: number; unit: string }[];
  assignedVendorIds?: number[];
  attachments?: { fileName: string; filePath: string }[];
}): Promise<RfqDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/rfqs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    data: json.data,
    error: json.error
  };
};

export const uploadRfqFile = async (file: File): Promise<{ success: boolean; data?: { fileName: string; filePath: string }; error?: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/v1/rfqs/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    data: json.data,
    error: json.error
  };
};

