'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPurchaseOrderDetail, PurchaseOrder } from '../../../../services/purchaseOrder';
import { useAuth } from '../../../../context/AuthContext';
import StatusBadge from '../../../../components/StatusBadge';
import { 
  ShoppingBag, Loader2, ChevronLeft, Building2, FileText, 
  Calendar, Clock, Truck, Receipt, Info, CheckCircle2, MapPin, Phone, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PurchaseOrderDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const poId = parseInt(params.id as string, 10);

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPoDetail = async () => {
    setLoading(true);
    try {
      const res = await getPurchaseOrderDetail(poId);
      if (res.success && res.data?.purchaseOrder) {
        setPo(res.data.purchaseOrder);
      } else {
        toast.error(res.error || 'Failed to retrieve Purchase Order');
        router.push('/purchase-orders');
      }
    } catch (err) {
      toast.error('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(poId)) {
      fetchPoDetail();
    }
  }, [poId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
        <p className="text-xs text-[#6b7280] mt-2 font-semibold">Loading Purchase Order details...</p>
      </div>
    );
  }

  if (!po) return null;

  const isOfficer = user?.role === 'OFFICER' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6 font-sans text-[#212529]">
      {/* Back button */}
      <button
        onClick={() => router.push('/purchase-orders')}
        className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] text-xs font-semibold transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Purchase Orders</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-[12px] border border-[#e5e5e5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 space-y-6">
        {/* PO Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-6 h-6 text-[#714B67]" />
              <span className="text-2xl font-bold text-[#714B67] font-mono">{po.poNumber}</span>
              <StatusBadge status={po.status} />
            </div>
            <p className="text-xs text-[#6b7280]">
              Generated on {new Date(po.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {po.quotation.rfq.status && (
              <span className="bg-[#f8f9fa] border border-[#e5e5e5] px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                RFQ: {po.quotation.rfq.status}
              </span>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Vendor Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
              <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>Supplier Information</span>
            </h3>
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-4 space-y-2">
              <div className="text-sm font-bold text-[#212529]">{po.vendor.companyName}</div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{po.vendor.gstNumber}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{po.vendor.address}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{po.vendor.contactNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: RFQ Reference */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>RFQ Reference</span>
            </h3>
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-4 space-y-2">
              <div className="text-sm font-bold text-[#212529]">{po.quotation.rfq.title}</div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Deadline: {new Date(po.quotation.rfq.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Category: {po.quotation.rfq.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        {po.quotation.items && po.quotation.items.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
              <ShoppingBag className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>Order Line Items</span>
            </h3>
            <div className="border border-[#e5e5e5] rounded-[6px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-3 pl-4">Item</th>
                    <th className="p-3 w-24">Qty</th>
                    <th className="p-3 w-24">Unit</th>
                    <th className="p-3 w-28">Unit Price</th>
                    <th className="p-3 w-28">Total</th>
                    <th className="p-3 w-28">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {po.quotation.items.map((item) => (
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
                      <td className="p-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.deliveryDays} days
                        </span>
                      </td>
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
            <span>Financial Summary</span>
          </h3>
          <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] p-4 space-y-2 max-w-md">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{Number(po.quotation.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>GST ({po.quotation.gstPercent}%)</span>
              <span className="font-semibold">₹{Number(po.quotation.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-[#e5e5e5] pt-2 flex justify-between text-sm font-bold text-[#212529]">
              <span>Grand Total</span>
              <span className="text-[#714B67] text-lg">
                ₹{Number(po.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] flex items-center">
            <Receipt className="w-4 h-4 mr-1.5 text-slate-400" />
            <span>Invoices ({po.invoices.length})</span>
          </h3>
          {po.invoices.length > 0 ? (
            <div className="space-y-2">
              {po.invoices.map(inv => (
                <Link key={inv.id} href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between p-3 bg-white border border-[#e5e5e5] rounded-[6px] hover:bg-[#f8f9fa] hover:border-[#714B67]/30 transition-all cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="font-mono font-bold text-[#714B67] text-xs">{inv.invoiceNumber}</div>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold">
                      ₹{Number(inv.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6b7280]" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#8F8F8F] py-4 text-center border border-dashed border-[#e5e5e5] rounded-[6px]">
              No invoices generated yet for this Purchase Order.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isOfficer && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-[#e5e5e5]">
            {po.status === 'APPROVED' && po.invoices.length === 0 && (
              <Link href={`/invoices/create?poId=${po.id}`}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm">
                <Receipt className="w-4 h-4" />
                <span>Generate Invoice</span>
              </Link>
            )}
            {po.status === 'DRAFT' && (
              <button onClick={async () => {
                const { updatePoStatus } = await import('../../../../services/purchaseOrder');
                const res = await updatePoStatus(po.id, 'APPROVED');
                if (res.success) { toast.success('Purchase Order approved!'); fetchPoDetail(); }
                else { toast.error(res.error || 'Failed to approve PO'); }
              }} className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve PO</span>
              </button>
            )}
            {po.status === 'FULFILLED' && (
              <span className="px-4 py-2 bg-[#f8f9fa] border border-[#e5e5e5] text-[#6b7280] text-xs font-semibold rounded-[6px]">
                ✓ PO Fulfilled
              </span>
            )}
            {po.invoices.length > 0 && po.invoices.some(inv => inv.status === 'PAID') && po.status !== 'FULFILLED' && (
              <button onClick={async () => {
                const { updatePoStatus } = await import('../../../../services/purchaseOrder');
                const res = await updatePoStatus(po.id, 'FULFILLED');
                if (res.success) { toast.success('Purchase Order marked as fulfilled!'); fetchPoDetail(); }
                else { toast.error(res.error || 'Failed to fulfill PO'); }
              }} className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Fulfilled</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
