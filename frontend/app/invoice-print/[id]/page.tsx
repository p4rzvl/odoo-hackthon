'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getInvoiceDetail, InvoiceDetail } from '../../../services/invoice';
import { Loader2 } from 'lucide-react';

export default function InvoicePrintPage() {
  const params = useParams();
  const invoiceId = parseInt(params.id as string, 10);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNaN(invoiceId)) return;
    const fetchData = async () => {
      const res = await getInvoiceDetail(invoiceId);
      if (res.success && res.data?.invoice) setInvoice(res.data.invoice);
      setLoading(false);
    };
    fetchData();
  }, [invoiceId]);

  useEffect(() => {
    if (!loading && invoice) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, invoice]);

  if (loading || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67]" />
      </div>
    );
  }

  const v = invoice.purchaseOrder.quotation?.vendor || invoice.purchaseOrder.vendor;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[210mm] mx-auto p-8 print:p-4 print:m-0">
        <style>{`
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
            @page { margin: 15mm; }
            .no-print { display: none !important; }
          }
        `}</style>

        <div className="no-print text-center text-xs text-[#6b7280] mb-4 p-2 bg-amber-50 border border-amber-200 rounded-[6px]">
          Use <b>Cmd+P</b> (Mac) or <b>Ctrl+P</b> (Windows) and choose <b>Save as PDF</b>.
          <button onClick={() => window.print()} className="ml-2 px-2 py-0.5 bg-[#714B67] text-white rounded text-[10px] font-bold">
            Print
          </button>
        </div>

        <div className="border-b-2 border-[#714B67] pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-[#714B67] font-mono">{invoice.invoiceNumber}</h1>
            <p className="text-xs text-[#6b7280] mt-1">
              Date: {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#212529]">TAX INVOICE</div>
            <p className="text-[10px] text-[#6b7280]">GST Invoice</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1">Supplier</h3>
            <p className="text-sm font-bold">{v.companyName}</p>
            <p className="text-xs text-slate-600">{v.address}</p>
            <p className="text-xs text-slate-600">GST: {v.gstNumber}</p>
            <p className="text-xs text-slate-600">Phone: {v.contactNumber}</p>
          </div>
          <div className="text-right">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1">Buyer</h3>
            <p className="text-sm font-bold">VendorBridge ERP</p>
            <p className="text-xs text-slate-600">Procurement Department</p>
            <p className="text-xs text-slate-600">Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {invoice.purchaseOrder.quotation.items && invoice.purchaseOrder.quotation.items.length > 0 && (
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="bg-[#f8f9fa] border-y border-[#e5e5e5] text-[10px] font-bold uppercase tracking-wider">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Unit Price</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.purchaseOrder.quotation.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-[#e5e5e5]">
                  <td className="p-2 text-[#6b7280]">{idx + 1}</td>
                  <td className="p-2 font-medium">{item.rfqLineItem?.itemName || `Item #${item.rfqLineItemId}`}</td>
                  <td className="p-2 text-right">{item.rfqLineItem?.quantity || '-'} {item.rfqLineItem?.unit || ''}</td>
                  <td className="p-2 text-right">₹{Number(item.unitPrice).toLocaleString()}</td>
                  <td className="p-2 text-right font-medium">₹{Number(item.totalPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 border-t-2 border-[#714B67] pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#6b7280]">Subtotal</span>
              <span>₹{Number(invoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6b7280]">CGST (9%)</span>
              <span>₹{Number(invoice.cgst).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6b7280]">SGST (9%)</span>
              <span>₹{Number(invoice.sgst).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#e5e5e5]">
              <span>Grand Total</span>
              <span className="text-[#714B67]">₹{Number(invoice.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#e5e5e5] text-[10px] text-[#6b7280] text-center">
          <p>This is a computer-generated invoice. No signature is required.</p>
          <p className="mt-0.5">Invoice {invoice.invoiceNumber} | PO {invoice.purchaseOrder.poNumber}</p>
        </div>
      </div>
    </div>
  );
}
