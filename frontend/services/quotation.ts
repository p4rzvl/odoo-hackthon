const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface QuotationItem {
  id?: number;
  quotationId?: number;
  rfqLineItemId: number;
  unitPrice: number;
  totalPrice?: number;
  deliveryDays: number;
  rfqLineItem?: {
    id: number;
    itemName: string;
    quantity: number;
    unit: string;
  };
}

export interface Quotation {
  id: number;
  rfqId: number;
  vendorId: number;
  gstPercent: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: 'DRAFT' | 'SUBMITTED' | 'SELECTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  items?: QuotationItem[];
  vendor?: {
    id: number;
    companyName: string;
    category: string;
    contactNumber: string;
  };
  rfq?: {
    id: number;
    title: string;
    deadline: string;
  };
}

export interface QuotationDetailResponse {
  success: boolean;
  data?: {
    quotation: Quotation;
  };
  error?: string;
}

export interface QuotationsListResponse {
  success: boolean;
  data?: {
    quotations: Quotation[];
  };
  error?: string;
}

export const submitQuotation = async (data: {
  rfqId: number;
  gstPercent: number;
  status: 'DRAFT' | 'SUBMITTED';
  items: { rfqLineItemId: number; unitPrice: number; deliveryDays: number }[];
}): Promise<QuotationDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/quotations`, {
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

export const updateQuotationDraft = async (id: number, data: {
  gstPercent?: number;
  status?: 'DRAFT' | 'SUBMITTED';
  items?: { id?: number; rfqLineItemId: number; unitPrice: number; deliveryDays: number }[];
}): Promise<QuotationDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/quotations/${id}`, {
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

export const getQuotationsList = async (filters: {
  rfqId?: number;
  vendorId?: number;
  status?: string;
}): Promise<QuotationsListResponse> => {
  const params = new URLSearchParams();
  if (filters.rfqId) params.append('rfqId', filters.rfqId.toString());
  if (filters.vendorId) params.append('vendorId', filters.vendorId.toString());
  if (filters.status) params.append('status', filters.status);

  const res = await fetch(`${API_URL}/v1/quotations?${params.toString()}`, {
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

export const getQuotationDetail = async (id: number): Promise<QuotationDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/quotations/${id}`, {
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

export const selectVendorQuotation = async (rfqId: number, quotationId: number): Promise<QuotationDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/rfqs/${rfqId}/select-vendor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quotationId }),
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    data: json.data,
    error: json.error
  };
};
