'use client';

import { useState, useEffect } from 'react';
import { getRfqsList, publishRfq, Rfq } from '../../../services/rfq';
import { useAuth } from '../../../context/AuthContext';
import StatusBadge from '../../../components/StatusBadge';
import { FolderOpen, Plus, Loader2, ArrowRight, Calendar, Users, Send } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RfqsPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isOfficer = user?.role === 'OFFICER';

  const fetchRfqs = async () => {
    setLoading(true);
    try {
      const res = await getRfqsList({
        status: status || undefined,
        page,
        limit: 10
      });
      if (res.success && res.rfqs) {
        setRfqs(res.rfqs);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        }
      } else {
        toast.error(res.error || 'Failed to retrieve RFQs');
      }
    } catch (err) {
      toast.error('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const handlePublish = async (rfqId: number) => {
    try {
      const res = await publishRfq(rfqId);
      if (res.success) {
        toast.success('RFQ published successfully! Invited vendors notified.');
        fetchRfqs();
      } else {
        toast.error(res.error || 'Failed to publish RFQ.');
      }
    } catch (err) {
      toast.error('Network failure on publishing.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#212529]">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Request for Quotations (RFQs)</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {isOfficer 
              ? 'Draft and publish RFQs, declare procurement items, and invite suppliers.' 
              : 'Review invitation bids assigned to your supplier account.'}
          </p>
        </div>
        {isOfficer && (
          <Link
            href="/rfqs/create"
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create RFQ</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex border-b border-[#e5e5e5]">
          {['ALL', 'DRAFT', 'PUBLISHED', 'CLOSED'].map(tab => {
            // Vendors shouldn't see DRAFT option since it's hidden from them on backend
            if (tab === 'DRAFT' && !isOfficer) return null;
            return (
              <button
                key={tab}
                onClick={() => {
                  setStatus(tab);
                  setPage(1);
                }}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all -mb-[2px] ${
                  status === tab
                    ? 'border-[#714B67] text-[#714B67]'
                    : 'border-transparent text-[#6b7280] hover:text-[#212529]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* RFQ Directory Table */}
      <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
            <p className="text-xs text-[#6b7280] mt-2 font-semibold">Retrieving secure bidding channels...</p>
          </div>
        ) : rfqs.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <FolderOpen className="w-12 h-12 text-[#8F8F8F] mx-auto stroke-[1.5]" />
            <div className="text-sm font-bold text-[#212529]">No RFQs Found</div>
            <p className="text-xs text-[#6b7280] max-w-sm mx-auto">
              {isOfficer
                ? 'Create a procurement request by clicking "Create RFQ".'
                : 'You have not been assigned to any bidding rounds yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-4">RFQ Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Deadline</th>
                  {isOfficer ? (
                    <th className="p-4">Supplier Invitations</th>
                  ) : (
                    <th className="p-4">My Bid Status</th>
                  )}
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq, index) => (
                  <tr
                    key={rfq.id}
                    className={`border-b border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#fcfbfd]'
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-[#212529]">{rfq.title}</div>
                      <div className="text-[10px] text-[#6b7280] mt-0.5 truncate max-w-xs">{rfq.description}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#f8f9fa] border border-[#e5e5e5] px-2 py-0.5 rounded text-[10px] font-semibold">
                        {rfq.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-slate-700">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        <span>{new Date(rfq.deadline).toLocaleDateString()}</span>
                      </div>
                    </td>
                    {isOfficer ? (
                      <td className="p-4">
                        <div className="flex items-center">
                          <Users className="w-3.5 h-3.5 text-slate-400 mr-1" />
                          <span className="font-bold text-[#714B67]">
                            {rfq.rfqVendors?.length || 0} Suppliers
                          </span>
                        </div>
                      </td>
                    ) : (
                      <td className="p-4">
                        {rfq.quotations && rfq.quotations.length > 0 ? (
                          <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-extrabold uppercase border inline-block text-center min-w-[70px] ${
                            rfq.quotations[0].status === 'DRAFT'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {rfq.quotations[0].status}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold italic">
                            No offer yet
                          </span>
                        )}
                      </td>
                    )}
                    <td className="p-4">
                      <StatusBadge status={rfq.status} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {isOfficer && rfq.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublish(rfq.id)}
                          className="px-2.5 py-1 bg-purple-50 text-[#714B67] hover:bg-[#714B67] hover:text-white border border-[#714B67]/20 rounded-[4px] text-[10px] font-bold transition-all inline-flex items-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Publish</span>
                        </button>
                      )}
                      <Link
                        href={`/rfqs/${rfq.id}`}
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
                    className="px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] text-[11px] font-bold disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] text-[11px] font-bold disabled:opacity-50 disabled:hover:bg-transparent transition-all"
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
