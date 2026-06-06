'use client';

import { useState, useEffect } from 'react';
import { getPurchaseOrdersList, PurchaseOrder } from '../../../services/purchaseOrder';
import { useAuth } from '../../../context/AuthContext';
import StatusBadge from '../../../components/StatusBadge';
import { ShoppingBag, Loader2, ArrowRight, Building2, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PurchaseOrdersPage() {
  const { user } = useAuth();
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPos = async () => {
    setLoading(true);
    try {
      const res = await getPurchaseOrdersList({
        status: status !== 'ALL' ? status : undefined,
        page,
        limit: 10
      });
      if (res.success && res.data) {
        setPos(res.data.purchaseOrders);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        toast.error(res.error || 'Failed to retrieve Purchase Orders');
      }
    } catch (err) {
      toast.error('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPos();
  }, [status, page]);

  return (
    <div className="space-y-6 font-sans text-[#212529]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Purchase Orders</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {user?.role === 'VENDOR'
              ? 'Review issued purchase orders from your bids.'
              : 'Manage approved purchase orders and initiate invoicing.'}
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white p-4 rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex border-b border-[#e5e5e5]">
          {['ALL', 'DRAFT', 'APPROVED', 'FULFILLED'].map(tab => (
            <button
              key={tab}
              onClick={() => { setStatus(tab); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all -mb-[2px] ${
                status === tab
                  ? 'border-[#714B67] text-[#714B67]'
                  : 'border-transparent text-[#6b7280] hover:text-[#212529]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* PO List Table */}
      <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
            <p className="text-xs text-[#6b7280] mt-2 font-semibold">Retrieving purchase orders...</p>
          </div>
        ) : pos.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-[#8F8F8F] mx-auto stroke-[1.5]" />
            <div className="text-sm font-bold text-[#212529]">No Purchase Orders Found</div>
            <p className="text-xs text-[#6b7280] max-w-sm mx-auto">
              {user?.role === 'VENDOR'
                ? 'Purchase orders from approved quotations will appear here.'
                : 'No purchase orders have been generated yet. Approve quotations to create POs.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-4">PO Number</th>
                  <th className="p-4">RFQ</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">PO Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po, index) => (
                  <tr
                    key={po.id}
                    className={`border-b border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#fcfbfd]'
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-[#714B67] font-mono">{po.poNumber}</div>
                      <div className="text-[10px] text-[#6b7280] mt-0.5">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">{po.quotation.rfq.title}</div>
                      <div className="text-[10px] text-[#6b7280] mt-0.5">{po.quotation.rfq.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{po.vendor.companyName}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      ₹{Number(po.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4"><StatusBadge status={po.status} /></td>
                    <td className="p-4">
                      {(() => {
                        const paidInv = po.invoices.find(i => i.status === 'PAID');
                        const pendingInv = po.invoices.find(i => i.status === 'PENDING_PAYMENT');
                        if (paidInv) return <span className="text-emerald-600 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded">✓ Paid</span>;
                        if (pendingInv) return <span className="text-amber-600 font-semibold text-[10px] bg-amber-50 px-2 py-0.5 rounded">Pending</span>;
                        return <span className="text-slate-400 text-[10px]">—</span>;
                      })()}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        po.status === 'FULFILLED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : po.status === 'APPROVED'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {po.status === 'FULFILLED' ? '✓ Fulfilled' : po.status === 'APPROVED' ? 'In Progress' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/purchase-orders/${po.id}`}
                        className="px-2.5 py-1.5 bg-[#f8f9fa] border border-[#e5e5e5] hover:bg-[#e5e5e5]/35 rounded-[4px] text-[10px] font-bold transition-all inline-flex items-center space-x-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3 text-[#6b7280]" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#e5e5e5] flex items-center justify-between">
                <div className="text-[11px] text-[#6b7280]">
                  Page <b>{page}</b> of <b>{totalPages}</b>
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] text-[11px] font-bold disabled:opacity-50 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] text-[11px] font-bold disabled:opacity-50 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
