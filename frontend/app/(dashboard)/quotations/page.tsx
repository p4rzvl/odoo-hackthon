'use client';

import { useState, useEffect } from 'react';
import { getQuotationsList, Quotation } from '../../../services/quotation';
import { useAuth } from '../../../context/AuthContext';
import StatusBadge from '../../../components/StatusBadge';
import { FileText, Loader2, ArrowRight, Calendar, Building, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function QuotationsPage() {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');

  const isVendor = user?.role === 'VENDOR';
  const isOfficer = user?.role === 'OFFICER' || user?.role === 'ADMIN';

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await getQuotationsList({
        status: status !== 'ALL' ? status : undefined
      });
      if (res.success && res.data) {
        setQuotations(res.data.quotations);
      } else {
        toast.error(res.error || 'Failed to retrieve quotations');
      }
    } catch {
      toast.error('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const statusTabs = isVendor
    ? ['ALL', 'DRAFT', 'SUBMITTED', 'SELECTED', 'REJECTED']
    : ['ALL', 'SUBMITTED', 'SELECTED', 'REJECTED'];

  return (
    <div className="space-y-6 font-sans text-[#212529]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Supplier Quotations</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {isVendor
              ? 'Track your submitted bids and review their status across all RFQs.'
              : 'Review vendor price bids, compare quotations, and select winning suppliers.'}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex border-b border-[#e5e5e5]">
          {statusTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
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

      <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
            <p className="text-xs text-[#6b7280] mt-2 font-semibold">Loading quotations...</p>
          </div>
        ) : quotations.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <FileText className="w-12 h-12 text-[#8F8F8F] mx-auto stroke-[1.5]" />
            <div className="text-sm font-bold text-[#212529]">No Quotations Found</div>
            <p className="text-xs text-[#6b7280] max-w-sm mx-auto">
              {isVendor
                ? 'You have not submitted any bids yet. Visit the RFQs page to review open invitations.'
                : 'No vendor quotations match the current filter. Await supplier submissions.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-4">RFQ / Vendor</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4">Status</th>
                  {isOfficer && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {quotations.map((q, index) => (
                  <tr
                    key={q.id}
                    className={`border-b border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#fcfbfd]'
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-[#212529]">{q.rfq?.title || `RFQ #${q.rfqId}`}</div>
                      <div className="flex items-center text-[10px] text-[#6b7280] mt-0.5">
                        <Building className="w-3 h-3 mr-1 text-slate-400" />
                        <span>{q.vendor?.companyName || `Vendor #${q.vendorId}`}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center font-bold text-[#212529]">
                        <DollarSign className="w-3.5 h-3.5 text-[#714B67] mr-0.5" />
                        <span>₹{Number(q.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="text-[9px] text-[#6b7280] mt-0.5">
                        {q.items?.length || 0} items | GST {q.gstPercent}%
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-xs text-[#6b7280]">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        <span>{new Date(q.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={q.status} />
                    </td>
                    {isOfficer && (
                      <td className="p-4 text-right">
                        <Link
                          href={`/quotations/submit/${q.rfqId}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] text-[10px] font-bold transition-all"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
