'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getRfqDetail, Rfq } from '../../../../../services/rfq';
import { submitQuotation, updateQuotationDraft, getQuotationsList, Quotation } from '../../../../../services/quotation';
import RoleGuard from '../../../../../components/RoleGuard';
import { toast } from 'sonner';
import { 
  Loader2, 
  ChevronLeft, 
  Paperclip, 
  Calculator, 
  CheckCircle2, 
  Save, 
  FileText,
  Calendar,
  AlertTriangle,
  Building
} from 'lucide-react';

interface BidItemState {
  rfqLineItemId: number;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  deliveryDays: number;
}

export default function SubmitQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const rfqId = parseInt(params.rfqId as string, 10);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rfq, setRfq] = useState<Rfq | null>(null);
  const [existingQuote, setExistingQuote] = useState<Quotation | null>(null);
  
  // Form States
  const [bidItems, setBidItems] = useState<BidItemState[]>([]);
  const [gstPercent, setGstPercent] = useState<number>(18); // Default 18%

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Load RFQ specifications
        const rfqRes = await getRfqDetail(rfqId);
        if (!rfqRes.success || !rfqRes.data?.rfq) {
          toast.error(rfqRes.error || 'Failed to fetch RFQ specifications');
          router.push('/rfqs');
          return;
        }
        const rfqData = rfqRes.data.rfq;
        setRfq(rfqData);

        // Verify deadline is in future
        if (new Date(rfqData.deadline) < new Date()) {
          toast.error('Bidding deadline for this RFQ has expired.');
          router.push('/rfqs');
          return;
        }

        // 2. Load existing quotation bid if any
        const quoteRes = await getQuotationsList({ rfqId });
        let currentQuote: Quotation | null = null;
        if (quoteRes.success && quoteRes.data?.quotations && quoteRes.data.quotations.length > 0) {
          currentQuote = quoteRes.data.quotations[0];
          setExistingQuote(currentQuote);
          setGstPercent(Number(currentQuote.gstPercent));

          if (currentQuote.status !== 'DRAFT') {
            toast.info('You have already submitted a bid for this RFQ. Edits are locked.');
          }
        }

        // 3. Initialize line items input
        const initialItems = rfqData.lineItems.map(item => {
          const matchedItem = currentQuote?.items?.find(qi => qi.rfqLineItemId === item.id);
          return {
            rfqLineItemId: item.id!,
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: matchedItem ? Number(matchedItem.unitPrice) : 0,
            deliveryDays: matchedItem ? Number(matchedItem.deliveryDays) : 7
          };
        });
        setBidItems(initialItems);

      } catch (err) {
        toast.error('Network failure loading bidding workstation.');
        router.push('/rfqs');
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(rfqId)) {
      loadData();
    }
  }, [rfqId, router]);

  const handleInputChange = (index: number, field: 'unitPrice' | 'deliveryDays', value: string) => {
    const updated = [...bidItems];
    if (field === 'unitPrice') {
      updated[index][field] = Math.max(0, parseFloat(value) || 0);
    } else {
      updated[index][field] = Math.max(1, parseInt(value, 10) || 1);
    }
    setBidItems(updated);
  };

  // Math Calculations
  const subtotal = bidItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * (gstPercent / 100);
  const cgst = taxAmount / 2;
  const sgst = taxAmount / 2;
  const grandTotal = subtotal + taxAmount;

  const validateInputs = () => {
    for (let i = 0; i < bidItems.length; i++) {
      if (bidItems[i].unitPrice <= 0) {
        return `Unit price for "${bidItems[i].itemName}" must be greater than zero.`;
      }
      if (bidItems[i].deliveryDays <= 0) {
        return `Delivery timeline for "${bidItems[i].itemName}" must be at least 1 day.`;
      }
    }
    return null;
  };

  const handleSaveQuotation = async (status: 'DRAFT' | 'SUBMITTED') => {
    if (status === 'SUBMITTED') {
      const error = validateInputs();
      if (error) {
        toast.error(error);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        rfqId,
        gstPercent,
        status,
        items: bidItems.map(item => ({
          rfqLineItemId: item.rfqLineItemId,
          unitPrice: item.unitPrice,
          deliveryDays: item.deliveryDays
        }))
      };

      let res;
      if (existingQuote) {
        res = await updateQuotationDraft(existingQuote.id, payload);
      } else {
        res = await submitQuotation(payload);
      }

      if (res.success) {
        toast.success(status === 'SUBMITTED' ? 'Bidding offer submitted successfully!' : 'Bidding draft saved successfully!');
        router.push('/rfqs');
      } else {
        toast.error(res.error || 'Failed to record bidding offer.');
      }
    } catch (err) {
      toast.error('Network failure while committing bid.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
        <p className="text-xs text-[#6b7280] mt-2 font-semibold">Configuring bidding workstation...</p>
      </div>
    );
  }

  if (!rfq) return null;

  const isLocked = existingQuote !== null && existingQuote.status !== 'DRAFT';
  const apiHost = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace('/api', '');

  return (
    <RoleGuard allowedRoles={['VENDOR']}>
      <div className="max-w-4xl mx-auto space-y-6 font-sans text-[#212529]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/rfqs')}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] text-xs font-semibold transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to RFQs</span>
          </button>
          <div className="text-xs text-slate-500">
            {isLocked ? (
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold border border-green-200">
                Bid Offer Submitted
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold border border-amber-200">
                Bidding Open
              </span>
            )}
          </div>
        </div>

        {/* Detailed RFQ Info panel */}
        <div className="bg-white border border-[#e5e5e5] rounded-[8px] p-6 shadow-sm space-y-4">
          <div className="border-b border-[#e5e5e5] pb-4 flex justify-between items-start">
            <div className="space-y-1">
              <span className="bg-[#714B67]/10 text-[#714B67] px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                {rfq.category}
              </span>
              <h1 className="text-xl font-bold text-[#212529] mt-1">{rfq.title}</h1>
              <p className="text-xs text-slate-500">Bidding Round Specifications</p>
            </div>
            <div className="bg-slate-50 border border-[#e5e5e5] p-3 rounded-[6px] text-center shrink-0 min-w-[140px]">
              <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Deadline</div>
              <div className="text-xs font-bold text-red-600 mt-0.5">
                {new Date(rfq.deadline).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">RFQ Guidelines</label>
            <p className="text-xs text-slate-700 leading-relaxed bg-[#f8f9fa] p-4 rounded-[6px] border border-[#e5e5e5] whitespace-pre-wrap">
              {rfq.description}
            </p>
          </div>

          {/* Files List */}
          {rfq.attachments && rfq.attachments.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Technical Drawings / Specs</label>
              <div className="flex flex-wrap gap-3">
                {rfq.attachments.map(att => (
                  <a
                    key={att.id}
                    href={`${apiHost}${att.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-2 border border-[#e5e5e5] hover:bg-slate-50 bg-[#fcfbfd] rounded-[6px] text-xs font-semibold text-[#714B67] transition-all"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{att.fileName}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bidding Worksheet */}
        <div className="bg-white border border-[#e5e5e5] rounded-[8px] p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-[#e5e5e5] pb-3">
            <FileText className="w-5 h-5 text-[#714B67]" />
            <h2 className="text-sm font-bold text-[#212529]">Quotation Bidding Sheet</h2>
          </div>

          {/* Items Input Table */}
          <div className="border border-[#e5e5e5] rounded-[6px] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[10px] uppercase tracking-wider">
                  <th className="p-3 pl-4">Material Required</th>
                  <th className="p-3 w-24 text-center">Required Qty</th>
                  <th className="p-3 w-24">Unit</th>
                  <th className="p-3 w-40">Unit Price (INR)</th>
                  <th className="p-3 w-40">Estimated Delivery (Days)</th>
                  <th className="p-3 w-32 text-right pr-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {bidItems.map((item, index) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <tr key={item.rfqLineItemId} className="border-b border-[#e5e5e5] bg-white last:border-0">
                      <td className="p-3 pl-4 font-semibold text-[#212529]">{item.itemName}</td>
                      <td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td>
                      <td className="p-3">
                        <span className="bg-[#f8f9fa] border border-[#e5e5e5] px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-600">
                          {item.unit}
                        </span>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0.01}
                          step={0.01}
                          disabled={isLocked}
                          value={item.unitPrice || ''}
                          placeholder="0.00"
                          onChange={e => handleInputChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#f8f9fa] disabled:bg-[#f1f3f5] border border-[#e5e5e5] rounded-[4px] font-semibold text-xs outline-none focus:border-[#714B67]"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={1}
                          disabled={isLocked}
                          value={item.deliveryDays || ''}
                          placeholder="e.g. 7"
                          onChange={e => handleInputChange(index, 'deliveryDays', e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#f8f9fa] disabled:bg-[#f1f3f5] border border-[#e5e5e5] rounded-[4px] font-semibold text-xs outline-none focus:border-[#714B67]"
                        />
                      </td>
                      <td className="p-3 text-right pr-4 font-bold text-slate-800">
                        ₹{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pricing Math Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-[6px] border border-[#e5e5e5] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tax Options</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 block">GST Percentage Rate</label>
                  <select
                    disabled={isLocked}
                    value={gstPercent}
                    onChange={e => setGstPercent(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-[#e5e5e5] rounded-[4px] text-xs px-2.5 py-1.5 outline-none focus:border-[#714B67] font-semibold"
                  >
                    <option value={0}>0% (Tax Exempt)</option>
                    <option value={5}>5% (GST)</option>
                    <option value={12}>12% (GST)</option>
                    <option value={18}>18% (Standard GST)</option>
                    <option value={28}>28% (Luxury GST)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-slate-50 p-4 rounded-[6px] border border-[#e5e5e5] space-y-2.5 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bidding Price breakdown</h3>
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal (Net Value)</span>
                <span className="font-semibold">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>CGST (Intra-State 9% Split)</span>
                <span>₹{cgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>SGST (Intra-State 9% Split)</span>
                <span>₹{sgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-[#e5e5e5] pt-2 flex justify-between items-center text-sm font-bold text-[#212529]">
                <span>Grand Total (Incl. Tax)</span>
                <span className="text-[#714B67]">
                  ₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          {!isLocked && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-[#e5e5e5]">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveQuotation('DRAFT')}
                className="px-4 py-2 border border-[#e5e5e5] hover:bg-[#f8f9fa] active:bg-[#f1f3f5] rounded-[6px] text-xs font-semibold text-[#212529] transition-all disabled:opacity-50 inline-flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Bidding Draft</span>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveQuotation('SUBMITTED')}
                className="px-6 py-2 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-xs font-semibold rounded-[6px] transition-all disabled:opacity-50 inline-flex items-center space-x-1.5 shadow-sm"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Bidding Offer</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
