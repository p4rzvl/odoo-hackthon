const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Approval {
  id: number;
  quotationId: number;
  approverId: number;
  level: number;
  status: 'WAITING' | 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  assignedAt: string;
  actionedAt?: string;
  quotation: {
    id: number;
    rfqId: number;
    vendorId: number;
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
      createdBy: number;
    };
    vendor: {
      id: number;
      companyName: string;
      gstNumber: string;
      category: string;
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
  };
  approver: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  siblingApproval?: {
    id: number;
    level: number;
    status: string;
    remarks?: string;
    actionedAt?: string;
    approver: {
      id: number;
      firstName: string;
      lastName: string;
    };
  } | null;
}

export interface ApprovalsListResponse {
  success: boolean;
  data?: {
    approvals: Approval[];
  };
  error?: string;
}

export interface ApprovalDetailResponse {
  success: boolean;
  data?: {
    approval: Approval;
  };
  error?: string;
}

export interface ApprovalActionResponse {
  success: boolean;
  data?: {
    success: boolean;
    message: string;
  };
  error?: string;
}

export const getApprovalsList = async (status?: string): Promise<ApprovalsListResponse> => {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);

  const res = await fetch(`${API_URL}/v1/approvals?${params.toString()}`, {
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

export const getApprovalDetail = async (id: number): Promise<ApprovalDetailResponse> => {
  const res = await fetch(`${API_URL}/v1/approvals/${id}`, {
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

export const approveApproval = async (id: number, remarks: string): Promise<ApprovalActionResponse> => {
  const res = await fetch(`${API_URL}/v1/approvals/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ remarks }),
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    data: json.data,
    error: json.error
  };
};

export const rejectApproval = async (id: number, remarks: string): Promise<ApprovalActionResponse> => {
  const res = await fetch(`${API_URL}/v1/approvals/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ remarks }),
    credentials: 'include'
  });
  const json = await res.json();
  return {
    success: json.success,
    data: json.data,
    error: json.error
  };
};
