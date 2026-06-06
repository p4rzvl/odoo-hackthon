'use client';

import { useState, useEffect } from 'react';
import { getInvoicesList, Invoice } from '../../../services/invoice';
import { useAuth } from '../../../context/AuthContext';
import StatusBadge from '../../../components/StatusBadge';
import { Receipt, Loader2, ArrowRight, Building2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await getInvoicesList({ status: status !== 'ALL' ? status : undefined, page, limit: 10 });
      if (res.success && res.data) {
        setInvoices(res.data.invoices);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        toast.error(res.error || 'Failed to retrieve invoices');
      }
    } catch {
      toast.error('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, [status, page]);

  return (
    <div className="space-y-6 font-sans text-[#212529]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Invoices</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            View and manage GST invoices generated from Purchase Orders.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex border-b border-[#e5e5e5]">
          {['ALL', 'PENDING_PAYMENT', 'PAID', 'OVERDUE'].map(tab => (
            <button
              key={tab}
              onClick={() => { setStatus(tab); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all -mb-[2px] ${
                status === tab
                  ? 'border-[#714B67] text-[#714B67]'
                  : 'border-transparent text-[#6b7280] hover:text-[#212529]'
              }`}
            >
              {tab === 'PENDING_PAYMENT' ? 'Pending' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
            <p className="text-xs text-[#6b7280] mt-2 font-semibold">Retrieving invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <Receipt className="w-12 h-12 text-[#8F8F8F] mx-auto stroke-[1.5]" />
            <div className="text-sm font-bold text-[#212529]">No Invoices Found</div>
            <p className="text-xs text-[#6b7280] max-w-sm mx-auto">
              Generate invoices from approved Purchase Orders to see them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">PO Ref</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Grand Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv.id} className={`border-b border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#fcfbfd]'}`}>
                    <td className="p-4">
                      <span className="font-bold text-[#714B67] font-mono">{inv.invoiceNumber}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{inv.purchaseOrder.poNumber}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{inv.purchaseOrder.vendor.companyName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(inv.invoiceDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-slate-800">
                      ₹{Number(inv.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4"><StatusBadge status={inv.status} /></td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/invoices/${inv.id}`}
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

            {totalPages > 1 && (
              <div className="p-4 border-t border-[#e5e5e5] flex items-center justify-between">
                <div className="text-[11px] text-[#6b7280]">Page <b>{page}</b> of <b>{totalPages}</b></div>
                <div className="flex space-x-2">
                  <button disabled={page === 1} onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] text-[11px] font-bold disabled:opacity-50 transition-all">Previous</button>
                  <button disabled={page === totalPages} onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] text-[11px] font-bold disabled:opacity-50 transition-all">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
