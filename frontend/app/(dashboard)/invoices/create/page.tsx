'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPurchaseOrderDetail, PurchaseOrder } from '../../../../services/purchaseOrder';
import { createInvoice } from '../../../../services/invoice';
import { useAuth } from '../../../../context/AuthContext';
import RoleGuard from '../../../../components/RoleGuard';
import { Loader2, ChevronLeft, Receipt, Building2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = parseInt(searchParams.get('poId') || '', 10);

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState(defaultDue);

  useEffect(() => {
    if (!poId || isNaN(poId)) {
      toast.error('No Purchase Order ID provided');
      router.push('/invoices');
      return;
    }

    const fetchPo = async () => {
      try {
        const res = await getPurchaseOrderDetail(poId);
        if (res.success && res.data?.purchaseOrder) {
          const poData = res.data.purchaseOrder;
          if (poData.status !== 'APPROVED') {
            toast.error('Purchase Order must be APPROVED before generating an invoice');
            router.push(`/purchase-orders/${poId}`);
            return;
          }
          if (poData.invoices && poData.invoices.length > 0) {
            toast.error('An invoice has already been generated for this Purchase Order');
            router.push(`/purchase-orders/${poId}`);
            return;
          }
          setPo(poData);
        } else {
          toast.error(res.error || 'Failed to load Purchase Order');
          router.push('/purchase-orders');
        }
      } catch {
        toast.error('Could not connect to backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchPo();
  }, [poId]);

  const handleCreateInvoice = async () => {
    if (!invoiceDate || !dueDate) {
      toast.error('Please select invoice date and due date');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createInvoice({ poId, invoiceDate, dueDate });
      if (res.success && res.data?.invoice) {
        toast.success(`Invoice ${res.data.invoice.invoiceNumber} generated successfully!`);
        router.push(`/invoices/${res.data.invoice.id}`);
      } else {
        toast.error(res.error || 'Failed to generate invoice');
      }
    } catch {
      toast.error('Could not connect to backend server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
        <p className="text-xs text-[#6b7280] mt-2 font-semibold">Loading Purchase Order details...</p>
      </div>
    );
  }

  if (!po) return null;

  const subtotal = Number(po.totalAmount);
  const cgstVal = Math.round(subtotal * 9 / 100 * 100) / 100;
  const sgstVal = Math.round(subtotal * 9 / 100 * 100) / 100;
  const grandTotal = Math.round((subtotal + cgstVal + sgstVal) * 100) / 100;

  return (
    <RoleGuard allowedRoles={['OFFICER', 'ADMIN']}>
      <div className="space-y-6 font-sans text-[#212529] max-w-3xl mx-auto">
        <button onClick={() => router.push(`/purchase-orders/${poId}`)}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] text-xs font-semibold transition-all">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Purchase Order</span>
        </button>

        <div className="bg-white rounded-[12px] border border-[#e5e5e5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 space-y-6">
          <div className="flex items-center space-x-3 border-b border-[#e5e5e5] pb-4">
            <Receipt className="w-6 h-6 text-[#714B67]" />
            <div>
              <h1 className="text-xl font-bold text-[#212529]">Generate Invoice</h1>
              <p className="text-xs text-[#6b7280] mt-0.5">
                From Purchase Order <span className="font-bold font-mono text-[#714B67]">{po.poNumber}</span>
              </p>
            </div>
          </div>

          {/* PO Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-4 space-y-2">
              <h3 className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">Vendor</h3>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-sm">{po.vendor.companyName}</span>
              </div>
              <p className="text-xs text-slate-500 font-mono">GST: {po.vendor.gstNumber}</p>
            </div>
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-4 space-y-2">
              <h3 className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">RFQ</h3>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-sm">{po.quotation.rfq.title}</span>
              </div>
              <p className="text-xs text-slate-500">Category: {po.quotation.rfq.category}</p>
            </div>
          </div>

          {/* Financial Preview */}
          <div className="border border-[#e5e5e5] rounded-[6px] p-4 space-y-2 max-w-sm">
            <h3 className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">Amount Breakdown</h3>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal (from PO)</span>
              <span className="font-semibold">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>CGST (9%)</span>
              <span className="font-semibold">₹{cgstVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>SGST (9%)</span>
              <span className="font-semibold">₹{sgstVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-[#e5e5e5] pt-2 flex justify-between text-sm font-bold text-[#212529]">
              <span>Grand Total</span>
              <span className="text-[#714B67] text-lg">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] px-3 py-2 text-xs font-semibold outline-none focus:border-[#714B67] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] px-3 py-2 text-xs font-semibold outline-none focus:border-[#714B67] transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-[#e5e5e5]">
            <button
              onClick={() => router.push(`/purchase-orders/${poId}`)}
              className="px-4 py-2 border border-[#e5e5e5] hover:bg-[#f8f9fa] text-[#6b7280] text-xs font-semibold rounded-[6px] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateInvoice}
              disabled={submitting}
              className="flex items-center space-x-1.5 px-5 py-2 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-bold rounded-[6px] transition-all shadow-sm disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
              <span>{submitting ? 'Generating...' : 'Generate Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
