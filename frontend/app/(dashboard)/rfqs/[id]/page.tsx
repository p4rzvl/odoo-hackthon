'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getRfqDetail, publishRfq, Rfq } from '../../../../services/rfq';
import { getQuotationsList, Quotation } from '../../../../services/quotation';
import { useAuth } from '../../../../context/AuthContext';
import StatusBadge from '../../../../components/StatusBadge';
import { 
  FolderOpen, 
  Calendar, 
  Users, 
  FileText, 
  Loader2, 
  ChevronLeft, 
  Send, 
  Scale, 
  PlusCircle, 
  Info,
  CheckCircle2,
  Paperclip
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RfqDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const rfqId = parseInt(params.id as string, 10);

  const [rfq, setRfq] = useState<Rfq | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [vendorQuote, setVendorQuote] = useState<Quotation | null>(null);

  const isOfficer = user?.role === 'OFFICER';
  const isVendor = user?.role === 'VENDOR';

  const fetchRfqDetail = async () => {
    setLoading(true);
    try {
      const res = await getRfqDetail(rfqId);
      if (res.success && res.data?.rfq) {
        setRfq(res.data.rfq);
        
        // Load active vendor's quote status
        if (user?.role === 'VENDOR') {
          const quoteRes = await getQuotationsList({ rfqId });
          if (quoteRes.success && quoteRes.data?.quotations && quoteRes.data.quotations.length > 0) {
            setVendorQuote(quoteRes.data.quotations[0]);
          }
        }
      } else {
        toast.error(res.error || 'Failed to retrieve RFQ details');
        router.push('/rfqs');
      }
    } catch (err) {
      toast.error('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(rfqId)) {
      fetchRfqDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfqId]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await publishRfq(rfqId);
      if (res.success) {
        toast.success('RFQ published successfully! Invited vendors notified.');
        fetchRfqDetail();
      } else {
        toast.error(res.error || 'Failed to publish RFQ.');
      }
    } catch (err) {
      toast.error('Network failure on publishing.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
        <p className="text-xs text-[#6b7280] mt-2 font-semibold">Loading RFQ specifications...</p>
      </div>
    );
  }

  if (!rfq) return null;

  const isDeadlinePassed = new Date(rfq.deadline) < new Date();

  return (
    <div className="space-y-6 font-sans text-[#212529]">
      {/* Back button & Action Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/rfqs')}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] text-xs font-semibold transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to RFQs</span>
        </button>

        {/* Dynamic Actions per Role and Status */}
        <div className="flex space-x-2">
          {isOfficer && rfq.status === 'DRAFT' && (
            <>
              <Link
                href={`/rfqs/${rfq.id}/edit`}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#f8f9fa] border border-[#e5e5e5] hover:bg-[#e5e5e5]/35 text-[#212529] text-xs font-semibold rounded-[6px] transition-all"
              >
                <span>Edit RFQ</span>
              </Link>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-xs font-semibold rounded-[6px] transition-all disabled:opacity-50"
              >
                {publishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish RFQ</span>
                  </>
                )}
              </button>
            </>
          )}

          {isOfficer && rfq.status === 'PUBLISHED' && (
            <Link
              href={`/rfqs/${rfq.id}/compare`}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Quotations</span>
            </Link>
          )}

          {isVendor && rfq.status === 'PUBLISHED' && !isDeadlinePassed && (
            <Link
              href={`/quotations/submit/${rfq.id}`}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                {vendorQuote 
                  ? vendorQuote.status === 'DRAFT' 
                    ? 'Resume Bidding Draft' 
                    : 'View Submitted Bidding'
                  : 'Submit Quotation Bid'}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-[12px] border border-[#e5e5e5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 space-y-6">
        
        {/* Vendor Quotation Status Banner */}
        {isVendor && vendorQuote && (
          <div className={`p-4 rounded-[8px] border flex items-center justify-between ${
            vendorQuote.status === 'DRAFT'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-green-50/70 border-green-200 text-green-900'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                vendorQuote.status === 'DRAFT' ? 'bg-amber-100' : 'bg-green-100'
              }`}>
                {vendorQuote.status === 'DRAFT' ? '✍️' : '✅'}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  Bidding Offer: {vendorQuote.status}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {vendorQuote.status === 'DRAFT'
                    ? 'You have saved a draft quotation. Your changes are private and not yet submitted to the Officer.'
                    : `Your offer has been submitted. Value: INR ${Number(vendorQuote.grandTotal).toLocaleString()} (delivery: ${
                        vendorQuote.items ? Math.max(...vendorQuote.items.map(i => i.deliveryDays)) : 0
                      } days)`}
                </div>
              </div>
            </div>
            {vendorQuote.status === 'DRAFT' && (
              <Link
                href={`/quotations/submit/${rfq.id}`}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0"
              >
                Resume Draft
              </Link>
            )}
          </div>
        )}

        {/* RFQ Meta Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="bg-[#714B67]/10 text-[#714B67] px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                {rfq.category}
              </span>
              <StatusBadge status={rfq.status} />
            </div>
            <h1 className="text-xl font-bold text-[#212529] mt-1">{rfq.title}</h1>
            <p className="text-xs text-[#6b7280]">
              Created by <span className="font-semibold">{rfq.creator.firstName} {rfq.creator.lastName}</span>
            </p>
          </div>

          {/* Time & invited vendors summary cards */}
          <div className="flex items-center space-x-4 shrink-0">
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] px-4 py-2 rounded-[6px] text-center min-w-[120px]">
              <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <div className="text-[10px] text-[#6b7280] font-semibold uppercase tracking-wider">Deadline</div>
              <div className={`text-xs font-bold mt-0.5 ${isDeadlinePassed ? 'text-red-600' : 'text-[#212529]'}`}>
                {new Date(rfq.deadline).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] px-4 py-2 rounded-[6px] text-center min-w-[120px]">
              <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <div className="text-[10px] text-[#6b7280] font-semibold uppercase tracking-wider">Invited</div>
              <div className="text-xs font-bold text-[#714B67] mt-0.5">
                {rfq.rfqVendors?.length || 0} Suppliers
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
            <Info className="w-4 h-4 mr-1 text-slate-400" />
            <span>Description / Bidding Guidelines</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-[#f8f9fa] p-4 rounded-[6px] border border-[#e5e5e5] whitespace-pre-wrap">
            {rfq.description}
          </p>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
            <ListIcon className="w-4 h-4 mr-1 text-slate-400" />
            <span>Declared Materials Required</span>
          </h3>
          <div className="border border-[#e5e5e5] rounded-[6px] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[10px] uppercase tracking-wider">
                  <th className="p-3 pl-4">Item Name / Description</th>
                  <th className="p-3 w-32">Required Qty</th>
                  <th className="p-3 w-32">Unit</th>
                </tr>
              </thead>
              <tbody>
                {rfq.lineItems.map((item, index) => (
                  <tr 
                    key={item.id || index}
                    className="border-b border-[#e5e5e5] bg-white last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3 pl-4 font-semibold text-[#212529]">{item.itemName}</td>
                    <td className="p-3 font-bold text-slate-700">{item.quantity}</td>
                    <td className="p-3">
                      <span className="bg-[#f8f9fa] border border-[#e5e5e5] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {item.unit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invited Suppliers Roster (Only for Officers/Managers) */}
        {!isVendor && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
              <Users className="w-4 h-4 mr-1 text-slate-400" />
              <span>Invited Supplier Roster</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rfq.rfqVendors.map(rv => (
                <div key={rv.vendorId} className="flex items-center space-x-3 p-3 border border-[#e5e5e5] rounded-[6px] bg-[#f8f9fa]">
                  <div className="w-8 h-8 rounded-full bg-[#714B67]/10 flex items-center justify-center font-bold text-[#714B67] text-xs">
                    {rv.vendor.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#212529]">{rv.vendor.companyName}</div>
                    <div className="text-[10px] text-[#6b7280]">{rv.vendor.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments Roster */}
        {rfq.attachments && rfq.attachments.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
              <Paperclip className="w-4 h-4 mr-1 text-slate-400" />
              <span>RFQ Attachments ({rfq.attachments.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rfq.attachments.map(att => {
                const apiHost = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace('/api', '');
                const fileUrl = `${apiHost}${att.filePath}`;
                return (
                  <a
                    key={att.id}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 border border-[#e5e5e5] rounded-[6px] bg-[#f8f9fa] hover:bg-slate-100 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-[#714B67]" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-[#212529] truncate">{att.fileName}</div>
                      <div className="text-[10px] text-[#6b7280]">Click to view specification file</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline fallback icon for cleaner loading states
function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
