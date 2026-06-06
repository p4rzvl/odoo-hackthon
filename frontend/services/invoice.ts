const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  poId: number;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'OVERDUE';
  pdfPath?: string;
  paidAt?: string;
  paidRemarks?: string;
  createdAt: string;
  purchaseOrder: {
    id: number;
    poNumber: string;
    totalAmount: number;
    vendor: {
      id: number;
      companyName: string;
      gstNumber: string;
    };
  };
}

export interface InvoiceDetail {
  id: number;
  invoiceNumber: string;
  poId: number;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'OVERDUE';
  pdfPath?: string;
  paidAt?: string;
  paidRemarks?: string;
  createdAt: string;
  purchaseOrder: {
    id: number;
    poNumber: string;
    quotation: {
      id: number;
      rfq: { id: number; title: string; category: string };
      items: Array<{
        id: number;
        rfqLineItemId: number;
        unitPrice: number;
        totalPrice: number;
        deliveryDays: number;
        rfqLineItem?: { id: number; itemName: string; quantity: number; unit: string };
      }>;
      vendor: {
        id: number;
        companyName: string;
        gstNumber: string;
        address: string;
        contactNumber: string;
      };
    };
    vendor: {
      id: number;
      companyName: string;
      gstNumber: string;
      address: string;
      contactNumber: string;
    };
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getInvoicesList = async (params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<{ invoices: Invoice[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>> => {
  const search = new URLSearchParams();
  if (params?.status) search.append('status', params.status);
  if (params?.page) search.append('page', String(params.page));
  if (params?.limit) search.append('limit', String(params.limit));

  const res = await fetch(`${API_URL}/v1/invoices?${search.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return res.json();
};

export const getInvoiceDetail = async (id: number): Promise<ApiResponse<{ invoice: InvoiceDetail }>> => {
  const res = await fetch(`${API_URL}/v1/invoices/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return res.json();
};

export const createInvoice = async (data: { poId: number; invoiceDate: string; dueDate: string }): Promise<ApiResponse<{ invoice: Invoice }>> => {
  const res = await fetch(`${API_URL}/v1/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  return res.json();
};

export const markInvoiceAsPaid = async (id: number, paidRemarks?: string): Promise<ApiResponse<{ invoice: Invoice }>> => {
  const res = await fetch(`${API_URL}/v1/invoices/${id}/pay`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paidRemarks }),
    credentials: 'include'
  });
  return res.json();
};
