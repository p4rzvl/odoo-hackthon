const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface DashboardMetrics {
  pendingAccounts: number;
  activeUsers: number;
  totalActivityLogs: number;
  activeRfqs: number;
  registeredVendors: number;
  pendingApprovals: number;
  totalPoSpend: number;
  pendingSignOff: number;
  approvedToday: number;
  monthlySpendAuthorized: number;
  invitedRfqs: number;
  submittedBids: number;
  unpaidInvoices: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getDashboardMetrics = async (): Promise<ApiResponse<{ metrics: DashboardMetrics }>> => {
  const res = await fetch(`${API_URL}/v1/dashboard/metrics`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return res.json();
};
