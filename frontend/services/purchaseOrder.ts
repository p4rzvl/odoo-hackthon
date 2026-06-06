const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  quotationId: number;
  vendorId: number;
  totalAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'FULFILLED';
  createdAt: string;
  updatedAt: string;
  quotation: {
    id: number;
    rfqId: number;
    gstPercent: number;
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    status: string;
    rfq: {
      id: number;
      title: string;
      category: string;
      deadline: string;
      status: string;
    };
    items?: Array<{
      id: number;
      rfqLineItemId: number;
      unitPrice: number;
      totalPrice: number;
      deliveryDays: number;
      rfqLineItem?: {
        id: number;
        itemName: string;
        quantity: number;
        unit: string;
      };
    }>;
    vendor?: {
      id: number;
      companyName: string;
      gstNumber: string;
      category: string;
      contactNumber: string;
      address: string;
    };
  };
  vendor: {
    id: number;
    companyName: string;
    gstNumber: string;
    category: string;
    contactNumber: string;
    address: string;
  };
  invoices: Array<{
    id: number;
    invoiceNumber: string;
    grandTotal: number;
    status: string;
    createdAt?: string;
  }>;
}

export interface PurchaseOrdersResponse {
  success: boolean;
  data?: {
    purchaseOrders: PurchaseOrder[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface PurchaseOrderDetailResponse {
  success: boolean;
  data?: {
    purchaseOrder: PurchaseOrder;
  };
  error?: string;
}

export const getPurchaseOrdersList = async (filters: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PurchaseOrdersResponse> => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const res = await fetch(`${API_URL}/v1/purchase-orders?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return res.json();
};

export const getPurchaseOrderDetail = async (id: number): Promise<PurchaseOrderDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/purchase-orders/${id}`, {
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

export const updatePoStatus = async (id: number, status: string): Promise<PurchaseOrderDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/purchase-orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    data: json.data,
    error: json.error
  };
};
