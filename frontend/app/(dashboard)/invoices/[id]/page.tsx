'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getInvoiceDetail, markInvoiceAsPaid, InvoiceDetail } from '../../../../services/invoice';
import { useAuth } from '../../../../context/AuthContext';
import StatusBadge from '../../../../components/StatusBadge';
import {
  Receipt, Loader2, ChevronLeft, Building2, FileText,
  Calendar, CheckCircle2, Clock, MapPin, Phone, Printer, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const invoiceId = parseInt(params.id as string, 10);

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showPaidRemarks, setShowPaidRemarks] = useState(false);
  const [paidRemarks, setPaidRemarks] = useState('');

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await getInvoiceDetail(invoiceId);
      if (res.success && res.data?.invoice) {
        setInvoice(res.data.invoice);
      } else {
        toast.error(res.error || 'Failed to retrieve invoice');
        router.push('/invoices');
      }
    } catch {
      toast.error('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(invoiceId)) fetchInvoice();
  }, [invoiceId]);

  const handleMarkPaid = async () => {
    if (showPaidRemarks && !paidRemarks.trim()) {
      toast.error('Please enter payment remarks');
      return;
    }
    setPaying(true);
    try {
      const res = await markInvoiceAsPaid(invoiceId, paidRemarks.trim() || undefined);
      if (res.success) {
        toast.success('Invoice marked as paid!');
        fetchInvoice();
      } else {
        toast.error(res.error || 'Failed to mark as paid');
      }
    } catch {
      toast.error('Could not connect to backend server.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
        <p className="text-xs text-[#6b7280] mt-2 font-semibold">Loading Invoice details...</p>
      </div>
    );
  }

  if (!invoice) return null;

  const isOfficer = user?.role === 'OFFICER' || user?.role === 'ADMIN';
  const vendorInfo = invoice.purchaseOrder.quotation?.vendor || invoice.purchaseOrder.vendor;

  return (
    <div className="space-y-6 font-sans text-[#212529]">
      <button onClick={() => router.push('/invoices')}
        className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] text-xs font-semibold transition-all">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Invoices</span>
      </button>

      <div className="bg-white rounded-[12px] border border-[#e5e5e5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <Receipt className="w-6 h-6 text-[#714B67]" />
              <span className="text-2xl font-bold text-[#714B67] font-mono">{invoice.invoiceNumber}</span>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-[#6b7280]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Issued: {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="font-mono text-xs text-[#6b7280] bg-[#f8f9fa] border border-[#e5e5e5] px-3 py-1.5 rounded-[6px]">
            PO: {invoice.purchaseOrder.poNumber}
          </div>
        </div>

        {/* Two-column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
              <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>Vendor Information</span>
            </h3>
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-4 space-y-2">
              <div className="text-sm font-bold text-[#212529]">{vendorInfo.companyName}</div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{vendorInfo.gstNumber}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vendorInfo.address}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vendorInfo.contactNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>RFQ Reference</span>
            </h3>
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-4 space-y-2">
              <div className="text-sm font-bold text-[#212529]">{invoice.purchaseOrder.quotation.rfq.title}</div>
              <div className="text-[10px] text-[#6b7280]">Category: {invoice.purchaseOrder.quotation.rfq.category}</div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        {invoice.purchaseOrder.quotation.items && invoice.purchaseOrder.quotation.items.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>Invoice Line Items</span>
            </h3>
            <div className="border border-[#e5e5e5] rounded-[6px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-3 pl-4">Item</th>
                    <th className="p-3 w-20">Qty</th>
                    <th className="p-3 w-24">Unit</th>
                    <th className="p-3 w-28">Unit Price</th>
                    <th className="p-3 w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.purchaseOrder.quotation.items.map(item => (
                    <tr key={item.id} className="border-b border-[#e5e5e5] bg-white last:border-0 hover:bg-slate-50">
                      <td className="p-3 pl-4 font-semibold">{item.rfqLineItem?.itemName || `Item #${item.rfqLineItemId}`}</td>
                      <td className="p-3">{item.rfqLineItem?.quantity || '-'}</td>
                      <td className="p-3">
                        <span className="bg-[#f8f9fa] border border-[#e5e5e5] px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                          {item.rfqLineItem?.unit || '-'}
                        </span>
                      </td>
                      <td className="p-3 font-medium">₹{Number(item.unitPrice).toLocaleString()}</td>
                      <td className="p-3 font-bold text-slate-800">₹{Number(item.totalPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Summary */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
            <Receipt className="w-4 h-4 mr-1.5 text-slate-400" />
            <span>GST Breakdown</span>
          </h3>
          <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-4 space-y-2 max-w-md">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{Number(invoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>CGST (9%)</span>
              <span className="font-semibold">₹{Number(invoice.cgst).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>SGST (9%)</span>
              <span className="font-semibold">₹{Number(invoice.sgst).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-[#e5e5e5] pt-2 flex justify-between text-sm font-bold text-[#212529]">
              <span>Grand Total</span>
              <span className="text-[#714B67] text-lg">
                ₹{Number(invoice.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Paid Info */}
        {invoice.paidAt && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-[6px] p-3 space-y-1">
            <div className="flex items-center space-x-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold">Paid on {new Date(invoice.paidAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            {invoice.paidRemarks && (
              <div className="flex items-start space-x-1.5 text-[11px] text-emerald-700 ml-6">
                <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{invoice.paidRemarks}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-start pt-4 border-t border-[#e5e5e5]">
          <div className="space-y-2 flex-1 max-w-md">
            {isOfficer && invoice.status === 'PENDING_PAYMENT' && (
              <>
                {showPaidRemarks && (
                  <textarea
                    placeholder="Enter payment remarks (received via bank transfer, cheque no, etc.)..."
                    value={paidRemarks}
                    onChange={e => setPaidRemarks(e.target.value)}
                    rows={2}
                    className="w-full bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] px-3 py-2 text-xs outline-none focus:border-[#714B67] resize-none transition-all"
                  />
                )}
                <div className="flex items-center space-x-2">
                  <button onClick={handleMarkPaid} disabled={paying}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm disabled:opacity-50">
                    {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{paying ? 'Processing...' : 'Mark as Paid'}</span>
                  </button>
                  <button onClick={() => { setShowPaidRemarks(!showPaidRemarks); setPaidRemarks(''); }}
                    className="px-3 py-2 border border-[#e5e5e5] hover:bg-[#f8f9fa] text-[#6b7280] text-xs font-semibold rounded-[6px] transition-all">
                    {showPaidRemarks ? 'Cancel' : '+ Add Remarks'}
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => window.open(`/invoice-print/${invoiceId}`, '_blank')}
            className="flex items-center space-x-1.5 px-4 py-2 border border-[#714B67] text-[#714B67] hover:bg-[#f8f5f7] text-xs font-semibold rounded-[6px] transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
