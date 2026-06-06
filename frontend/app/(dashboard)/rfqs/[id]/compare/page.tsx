'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getRfqDetail, Rfq } from '../../../../../services/rfq';
import { getQuotationsList, selectVendorQuotation, Quotation } from '../../../../../services/quotation';
import RoleGuard from '../../../../../components/RoleGuard';
import { toast } from 'sonner';
import { 
  Loader2, 
  ChevronLeft, 
  Scale, 
  Building2, 
  Award, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export default function CompareQuotationsPage() {
  const router = useRouter();
  const params = useParams();
  const rfqId = parseInt(params.id as string, 10);

  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [rfq, setRfq] = useState<Rfq | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [rfqRes, quotesRes] = await Promise.all([
          getRfqDetail(rfqId),
          getQuotationsList({ rfqId })
        ]);

        if (rfqRes.success && rfqRes.data?.rfq) {
          setRfq(rfqRes.data.rfq);
        } else {
          toast.error(rfqRes.error || 'Failed to retrieve RFQ details');
          router.push(`/rfqs/${rfqId}`);
          return;
        }

        if (quotesRes.success && quotesRes.data?.quotations) {
          const nonDrafts = quotesRes.data.quotations.filter((q: any) => q.status !== 'DRAFT');
          setQuotations(nonDrafts);
        } else {
          toast.error(quotesRes.error || 'Failed to retrieve quotation bids');
        }

      } catch (err) {
        toast.error('Network failure loading comparison matrix.');
        router.push(`/rfqs/${rfqId}`);
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(rfqId)) {
      loadData();
    }
  }, [rfqId, router]);

  // Find lowest grand total
  const lowestTotal = quotations.length > 0 
    ? Math.min(...quotations.map(q => Number(q.grandTotal))) 
    : Infinity;

  const hasSelectedBid = quotations.some(q => q.status === 'SELECTED');

  const handleSelectBid = async (quotationId: number) => {
    setSelectingId(quotationId);
    try {
      const res = await selectVendorQuotation(rfqId, quotationId);
      if (res.success) {
        toast.success('Winning bid selected! Manager approvals initialized.');
        router.push(`/rfqs/${rfqId}`);
      } else {
        toast.error(res.error || 'Failed to select quotation.');
      }
    } catch (err) {
      toast.error('Network failure executing selection.');
    } finally {
      setSelectingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
        <p className="text-xs text-[#6b7280] mt-2 font-semibold">Generating comparison matrix...</p>
      </div>
    );
  }

  if (!rfq) return null;

  return (
    <RoleGuard allowedRoles={['OFFICER', 'MANAGER', 'ADMIN']}>
      <div className="space-y-6 font-sans text-[#212529]">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/rfqs/${rfqId}`)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] text-xs font-semibold transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to RFQ Specifications</span>
          </button>
        </div>

        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#212529] flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#714B67]" />
            <span>Compare Quotation Bids</span>
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Analyzing procurement proposals for RFQ: <span className="font-semibold text-slate-800">"{rfq.title}"</span>
          </p>
        </div>

        {quotations.length === 0 ? (
          <div className="bg-white border border-[#e5e5e5] rounded-[8px] py-16 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto stroke-[1.5]" />
            <h3 className="text-sm font-bold text-[#212529]">No Bids Submitted Yet</h3>
            <p className="text-xs text-[#6b7280] max-w-sm mx-auto">
              Invited suppliers have not submitted any bidding proposals for this RFQ yet.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e5e5] rounded-[8px] shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e5e5e5] text-[#212529]">
                  <th className="p-4 font-bold w-64 border-r border-[#e5e5e5]">Comparison Parameters</th>
                  {quotations.map(q => {
                    const isLowest = Number(q.grandTotal) === lowestTotal;
                    return (
                      <th 
                        key={q.id} 
                        className={`p-4 font-bold border-r border-[#e5e5e5] text-center w-64 relative ${
                          isLowest ? 'bg-green-50/40' : ''
                        }`}
                      >
                        {q.status === 'SELECTED' && (
                          <span className="absolute top-2 left-2 bg-purple-100 text-[#714B67] text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Selected</span>
                          </span>
                        )}
                        {q.status === 'REJECTED' && (
                          <span className="absolute top-2 left-2 bg-slate-100 text-slate-600 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <span>Rejected</span>
                          </span>
                        )}
                        {isLowest && (
                          <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Award className="w-2.5 h-2.5" />
                            <span>L1 Cost</span>
                          </span>
                        )}
                        <Building2 className="w-6 h-6 text-slate-400 mx-auto mb-1 mt-2" />
                        <div className="text-xs font-bold text-[#212529] truncate max-w-[200px] mx-auto">
                          {q.vendor?.companyName}
                        </div>
                        <div className="text-[9px] text-[#6b7280] font-semibold tracking-wider mt-0.5">
                          {q.vendor?.category}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Line Items Rows */}
                {rfq.lineItems.map(item => (
                  <tr key={item.id} className="border-b border-[#e5e5e5] bg-white last:border-0 hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-800 border-r border-[#e5e5e5]">
                      <div>{item.itemName}</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Qty Required: <span className="font-bold">{item.quantity} {item.unit}</span>
                      </div>
                    </td>
                    {quotations.map(q => {
                      const matchedItem = q.items?.find(qi => qi.rfqLineItemId === item.id);
                      const isLowest = Number(q.grandTotal) === lowestTotal;
                      return (
                        <td 
                          key={q.id} 
                          className={`p-4 border-r border-[#e5e5e5] text-center ${
                            isLowest ? 'bg-green-50/20' : ''
                          }`}
                        >
                          {matchedItem ? (
                            <div className="space-y-1">
                              <div className="font-bold text-slate-800">
                                ₹{Number(matchedItem.unitPrice).toLocaleString()}
                              </div>
                              <div className="text-[9px] text-slate-500 flex items-center justify-center gap-1">
                                <Truck className="w-3 h-3" />
                                <span>{matchedItem.deliveryDays} Days</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No offer</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Subtotal row */}
                <tr className="bg-slate-50/30 border-t border-b border-[#e5e5e5]">
                  <td className="p-4 font-bold text-slate-600 border-r border-[#e5e5e5]">Subtotal (Net)</td>
                  {quotations.map(q => (
                    <td key={q.id} className="p-4 text-center font-bold text-slate-700 border-r border-[#e5e5e5]">
                      ₹{Number(q.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>

                {/* Tax rate row */}
                <tr className="bg-slate-50/30 border-b border-[#e5e5e5] text-xs">
                  <td className="p-4 font-bold text-slate-600 border-r border-[#e5e5e5]">GST Splitting</td>
                  {quotations.map(q => {
                    const tax = Number(q.taxAmount);
                    return (
                      <td key={q.id} className="p-4 text-center text-slate-600 border-r border-[#e5e5e5]">
                        <div className="font-semibold">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">CGST(9%) + SGST(9%) ({q.gstPercent}%)</div>
                      </td>
                    );
                  })}
                </tr>

                {/* Grand Total row */}
                <tr className="bg-slate-50/30 border-b border-[#e5e5e5] font-bold text-sm text-[#212529]">
                  <td className="p-4 border-r border-[#e5e5e5]">Grand Total (Gross)</td>
                  {quotations.map(q => {
                    const isLowest = Number(q.grandTotal) === lowestTotal;
                    return (
                      <td 
                        key={q.id} 
                        className={`p-4 text-center border-r border-[#e5e5e5] ${
                          isLowest ? 'bg-green-100/40 text-green-800' : 'text-slate-800'
                        }`}
                      >
                        ₹{Number(q.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    );
                  })}
                </tr>

                {/* Actions row */}
                <tr className="bg-white border-t border-[#e5e5e5]">
                  <td className="p-4 font-bold border-r border-[#e5e5e5] text-slate-500">Status / Selection</td>
                  {quotations.map(q => (
                    <td key={q.id} className="p-4 text-center border-r border-[#e5e5e5]">
                      {q.status === 'SELECTED' ? (
                        <span className="inline-flex items-center text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full text-[11px] gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected Winner
                        </span>
                      ) : q.status === 'REJECTED' ? (
                        <span className="inline-flex items-center text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-full text-[11px]">
                          Rejected
                        </span>
                      ) : rfq.status === 'PUBLISHED' && !hasSelectedBid ? (
                        <button
                          type="button"
                          disabled={selectingId !== null}
                          onClick={() => handleSelectBid(q.id)}
                          className="px-4 py-2 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-xs font-semibold rounded-[6px] transition-all disabled:opacity-50 inline-flex items-center space-x-1 shadow-sm"
                        >
                          {selectingId === q.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Select Bid</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Submitted</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
