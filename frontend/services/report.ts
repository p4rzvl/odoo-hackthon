const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface ReportOverview {
  totalSpend: number;
  totalPoCount: number;
  fulfilledCount: number;
  fulfillmentRate: number;
  totalInvoiceValue: number;
  totalInvoiceCount: number;
  paidInvoiceCount: number;
  paidRate: number;
  overdueInvoices: number;
  activeVendors: number;
  rfqCount: number;
  quotationCount: number;
  pendingApprovals: number;
  avgPoValue: number;
}

export interface SpendTrend {
  month: string;
  spend: number;
  count: number;
}

export interface VendorSpend {
  id: number;
  companyName: string;
  category: string;
  totalSpend: number;
  poCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getReportOverview = async (month?: string): Promise<ApiResponse<{ overview: ReportOverview }>> => {
  const params = month ? `?month=${month}` : '';
  const res = await fetch(`${API_URL}/v1/reports/overview${params}`, {
    credentials: 'include'
  });
  return res.json();
};

export const getSpendTrend = async (month?: string): Promise<ApiResponse<{ trend: SpendTrend[] }>> => {
  const params = month ? `?month=${month}` : '';
  const res = await fetch(`${API_URL}/v1/reports/spend-trend${params}`, {
    credentials: 'include'
  });
  return res.json();
};

export const getSpendByVendor = async (): Promise<ApiResponse<{ vendors: VendorSpend[] }>> => {
  const res = await fetch(`${API_URL}/v1/reports/spend-by-vendor`, {
    credentials: 'include'
  });
  return res.json();
};
