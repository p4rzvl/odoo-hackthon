'use client';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const formattedStatus = status.toUpperCase();

  const getStyle = () => {
    switch (formattedStatus) {
      // Vendor Status
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'BLOCKED':
        return 'bg-red-50 text-red-700 border-red-200';

      // RFQ / Quotation Status
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'PUBLISHED':
      case 'SUBMITTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CLOSED':
      case 'SELECTED':
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold border uppercase tracking-wider ${getStyle()}`}>
      {status.toLowerCase().replace(/_/g, ' ')}
    </span>
  );
}
