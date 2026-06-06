'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getApprovalsList, approveApproval, rejectApproval, Approval } from '../../../services/approval';
import RoleGuard from '../../../components/RoleGuard';
import StatusBadge from '../../../components/StatusBadge';
import { toast } from 'sonner';
import {
  CheckSquare,
  Loader2,
  AlertCircle,
  Building2,
  FileText,
  Clock,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  MessageSquare
} from 'lucide-react';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [remarks, setRemarks] = useState<{ [key: number]: string }>({});
  const [showRemarksInput, setShowRemarksInput] = useState<{ [key: number]: 'approve' | 'reject' | null }>({});

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await getApprovalsList(statusFilter !== 'ALL' ? statusFilter : undefined);
      if (res.success && res.data?.approvals) {
        setApprovals(res.data.approvals);
      } else {
        toast.error(res.error || 'Failed to load approvals');
      }
    } catch (err) {
      toast.error('Network failure loading approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (approvalId: number) => {
    const remark = remarks[approvalId] || '';
    if (!remark.trim()) {
      toast.error('Please enter remarks before approving');
      return;
    }
    setActionLoading(approvalId);
    try {
      const res = await approveApproval(approvalId, remark.trim());
      if (res.success) {
        toast.success(res.data?.message || 'Approval granted successfully!');
        setRemarks(prev => ({ ...prev, [approvalId]: '' }));
        setShowRemarksInput(prev => ({ ...prev, [approvalId]: null }));
        fetchApprovals();
      } else {
        toast.error(res.error || 'Failed to approve');
      }
    } catch (err) {
      toast.error('Network failure on approval action.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (approvalId: number) => {
    const remark = remarks[approvalId] || '';
    if (!remark.trim()) {
      toast.error('Please enter remarks before rejecting');
      return;
    }
    setActionLoading(approvalId);
    try {
      const res = await rejectApproval(approvalId, remark.trim());
      if (res.success) {
        toast.success(res.data?.message || 'Approval rejected successfully.');
        setRemarks(prev => ({ ...prev, [approvalId]: '' }));
        setShowRemarksInput(prev => ({ ...prev, [approvalId]: null }));
        fetchApprovals();
      } else {
        toast.error(res.error || 'Failed to reject');
      }
    } catch (err) {
      toast.error('Network failure on rejection action.');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleRemarks = (id: number, action: 'approve' | 'reject') => {
    setShowRemarksInput(prev => ({
      ...prev,
      [id]: prev[id] === action ? null : action
    }));
    setRemarks(prev => ({ ...prev, [id]: '' }));
  };

  // Count pending
  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;

  // Derive manager's assigned levels from loaded approvals
  const userLevels = [...new Set(approvals.map(a => a.level))].sort();
  const getLevelLabel = (level: number) => {
    return level === 1 ? 'L1 - Manager' : 'L2 - Senior Manager';
  };

  return (
    <RoleGuard allowedRoles={['MANAGER']}>
      <div className="space-y-6 font-sans text-[#212529]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#212529] flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-[#714B67]" />
              <span>Approvals Queue</span>
            </h1>
            <p className="text-sm text-[#6b7280] mt-1">
              Review and sign off on quotation selections. 
              {pendingCount > 0 && (
                <span className="font-semibold text-amber-600"> {pendingCount} item{pendingCount !== 1 ? 's' : ''} awaiting your decision.</span>
              )}
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#6b7280]">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#714B67] transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="WAITING">Waiting</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Your Level Badge */}
        {approvals.length > 0 && userLevels.length > 0 && (
          <div className="flex items-center space-x-2 text-xs text-[#6b7280] bg-white border border-[#e5e5e5] rounded-[8px] px-4 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <UserCheck className="w-4 h-4 text-[#714B67]" />
            <span>You are assigned as:</span>
            {userLevels.map(lvl => (
              <span
                key={lvl}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  lvl === 1
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                {getLevelLabel(lvl)}
              </span>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
            <p className="text-xs text-[#6b7280] mt-2 font-semibold">Loading approvals...</p>
          </div>
        ) : approvals.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#e5e5e5] rounded-[8px] py-16 text-center space-y-3">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto stroke-[1.5]" />
            <h3 className="text-sm font-bold text-[#212529]">No Approvals Found</h3>
            <p className="text-xs text-[#6b7280] max-w-sm mx-auto">
              {statusFilter !== 'ALL' 
                ? `No approvals with status "${statusFilter}" are assigned to you.`
                : 'You have no pending approvals. New approval requests will appear here when quotations are selected by officers.'}
            </p>
          </div>
        ) : (
          /* Approvals List */
          <div className="space-y-4">
            {approvals.map(approval => (
              <div
                key={approval.id}
                className={`bg-white border rounded-[8px] shadow-sm overflow-hidden transition-all ${
                  approval.status === 'PENDING' 
                    ? 'border-amber-200 ring-1 ring-amber-100' 
                    : 'border-[#e5e5e5]'
                }`}
              >
                {/* Approval Header */}
                <div className="p-5 border-b border-[#e5e5e5] flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      approval.status === 'PENDING' 
                        ? 'bg-amber-50 text-amber-600' 
                        : approval.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-600'
                        : approval.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-50 text-slate-400'
                    }`}>
                      {approval.level === 1 ? 'L1' : 'L2'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-[#212529]">
                          {getLevelLabel(approval.level)} Approval
                        </h3>
                        <StatusBadge status={approval.status} />
                      </div>
                      <p className="text-xs text-[#6b7280] mt-0.5">
                        Assigned: {new Date(approval.assignedAt).toLocaleDateString('en-IN', { 
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="bg-[#f8f9fa] border border-[#e5e5e5] px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                      {approval.quotation.rfq.category}
                    </span>
                  </div>
                </div>

                {/* Approval Details */}
                <div className="p-5 space-y-4">
                  {/* RFQ & Quotation Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-3">
                      <div className="flex items-center space-x-2 text-xs text-[#6b7280] font-semibold uppercase tracking-wider mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>RFQ</span>
                      </div>
                      <p className="text-sm font-bold text-[#212529] truncate">
                        {approval.quotation.rfq.title}
                      </p>
                      <p className="text-[10px] text-[#6b7280] mt-0.5">
                        Deadline: {new Date(approval.quotation.rfq.deadline).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-3">
                      <div className="flex items-center space-x-2 text-xs text-[#6b7280] font-semibold uppercase tracking-wider mb-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Selected Vendor</span>
                      </div>
                      <p className="text-sm font-bold text-[#212529]">
                        {approval.quotation.vendor.companyName}
                      </p>
                      <p className="text-[10px] text-[#6b7280] mt-0.5">
                        GST: {approval.quotation.vendor.gstNumber} | {approval.quotation.vendor.category}
                      </p>
                    </div>

                    <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-3">
                      <div className="flex items-center space-x-2 text-xs text-[#6b7280] font-semibold uppercase tracking-wider mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Quotation Grand Total</span>
                      </div>
                      <p className="text-lg font-bold text-[#714B67]">
                        ₹{Number(approval.quotation.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-[#6b7280] mt-0.5">
                        GST: {approval.quotation.gstPercent}% | Sub: ₹{Number(approval.quotation.subtotal).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Line Items Summary */}
                  {approval.quotation.items && approval.quotation.items.length > 0 && (
                    <div className="border border-[#e5e5e5] rounded-[6px] overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[10px] uppercase tracking-wider">
                            <th className="p-2.5 pl-4">Item</th>
                            <th className="p-2.5 w-20">Qty</th>
                            <th className="p-2.5 w-24">Unit Price</th>
                            <th className="p-2.5 w-24">Total</th>
                            <th className="p-2.5 w-24">Delivery</th>
                          </tr>
                        </thead>
                        <tbody>
                          {approval.quotation.items.map((item) => (
                            <tr key={item.id} className="border-b border-[#e5e5e5] bg-white last:border-0">
                              <td className="p-2.5 pl-4 font-semibold">
                                {item.rfqLineItem?.itemName || `Line Item #${item.rfqLineItemId}`}
                              </td>
                              <td className="p-2.5">{item.rfqLineItem?.quantity || '-'} {item.rfqLineItem?.unit || ''}</td>
                              <td className="p-2.5 font-medium">₹{Number(item.unitPrice).toLocaleString()}</td>
                              <td className="p-2.5 font-medium">₹{Number(item.totalPrice).toLocaleString()}</td>
                              <td className="p-2.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {item.deliveryDays} days
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* L1 Remarks (visible to L2) */}
                  {approval.level === 2 && approval.siblingApproval?.remarks && (
                    <div className="bg-amber-50 border border-amber-200 rounded-[6px] p-3 flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                          L1 Remark ({approval.siblingApproval.approver.firstName} {approval.siblingApproval.approver.lastName})
                        </p>
                        <p className="text-xs text-amber-800 mt-0.5">{approval.siblingApproval.remarks}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Details (if already actioned) */}
                  {approval.remarks && (
                    <div className="bg-slate-50 border border-[#e5e5e5] rounded-[6px] p-3 flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-[#6b7280] font-semibold uppercase tracking-wider">{approval.level === 2 ? 'L2' : 'L1'} Remarks</p>
                        <p className="text-xs text-slate-700 mt-0.5">{approval.remarks}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons (only for PENDING approvals) */}
                  {approval.status === 'PENDING' && (
                    <div className="border-t border-[#e5e5e5] pt-4 space-y-3">
                      {/* Remarks Input */}
                      {showRemarksInput[approval.id] && (
                        <div className="space-y-2">
                          <textarea
                            placeholder={`Enter remarks for ${showRemarksInput[approval.id] === 'approve' ? 'approval' : 'rejection'}...`}
                            value={remarks[approval.id] || ''}
                            onChange={(e) => setRemarks(prev => ({ ...prev, [approval.id]: e.target.value }))}
                            rows={2}
                            className="w-full bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] px-3 py-2 text-xs outline-none focus:border-[#714B67] resize-none transition-all"
                          />
                          <div className="flex items-center space-x-2">
                            {showRemarksInput[approval.id] === 'approve' ? (
                              <button
                                onClick={() => handleApprove(approval.id)}
                                disabled={actionLoading === approval.id}
                                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-[6px] transition-all disabled:opacity-50"
                              >
                                {actionLoading === approval.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                )}
                                <span>Confirm Approve</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReject(approval.id)}
                                disabled={actionLoading === approval.id}
                                className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-[6px] transition-all disabled:opacity-50"
                              >
                                {actionLoading === approval.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                )}
                                <span>Confirm Reject</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setShowRemarksInput(prev => ({ ...prev, [approval.id]: null }));
                                setRemarks(prev => ({ ...prev, [approval.id]: '' }));
                              }}
                              className="px-3 py-2 border border-[#e5e5e5] hover:bg-[#f8f9fa] text-[#6b7280] text-xs font-semibold rounded-[6px] transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {!showRemarksInput[approval.id] && (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleRemarks(approval.id, 'approve')}
                            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => toggleRemarks(approval.id, 'reject')}
                            className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show actioned info for non-pending */}
                  {approval.status !== 'PENDING' && approval.actionedAt && (
                    <div className="border-t border-[#e5e5e5] pt-3 flex items-center space-x-2 text-xs text-[#6b7280]">
                      {approval.status === 'APPROVED' ? (
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span>
                        {approval.status === 'APPROVED' ? 'Approved' : 'Rejected'} on{' '}
                        {new Date(approval.actionedAt).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
