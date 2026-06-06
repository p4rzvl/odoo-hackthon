'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getReportOverview, getSpendTrend, getSpendByVendor, ReportOverview, SpendTrend, VendorSpend } from '../../../services/report';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Loader2, ChevronDown, DollarSign, Users, TrendingUp, AlertCircle, Building2, ShoppingBag, FileText } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function formatLakhs(value: number) {
  const lakhs = value / 100000;
  if (lakhs >= 1) return '₹' + lakhs.toFixed(1) + ' L';
  return '₹' + Number(value).toLocaleString('en-IN');
}

function formatCurrency(value: number) {
  return '₹' + Number(value).toLocaleString('en-IN');
}

const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthOptions = [
  { label: 'January 2026', value: '2026-01' },
  { label: 'February 2026', value: '2026-02' },
  { label: 'March 2026', value: '2026-03' },
  { label: 'April 2026', value: '2026-04' },
  { label: 'May 2026', value: '2026-05' },
  { label: 'June 2026', value: '2026-06' },
];

type KpiItem = { label: string; value: string; icon: any; bg: string; color: string };

export default function ReportsPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [trend, setTrend] = useState<SpendTrend[]>([]);
  const [vendors, setVendors] = useState<VendorSpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[5]);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const fetchData = useCallback(async (monthVal: string) => {
    setLoading(true);
    try {
      const [ovRes, trRes, vdRes] = await Promise.all([
        getReportOverview(monthVal),
        getSpendTrend(monthVal),
        getSpendByVendor()
      ]);
      if (ovRes.success && ovRes.data) setOverview(ovRes.data.overview);
      if (trRes.success && trRes.data) setTrend(trRes.data.trend);
      if (vdRes.success && vdRes.data) setVendors(vdRes.data.vendors);
    } catch {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(selectedMonth.value); }, [selectedMonth.value, fetchData]);

  const monthLabels = useMemo(() => {
    const [year, monthNum] = selectedMonth.value.split('-').map(Number);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, monthNum - 1 - 5 + i, 1);
      return shortMonths[d.getMonth()];
    });
  }, [selectedMonth.value]);

  const trendWithLabels = useMemo(() => {
    const trendMap = new Map(trend.map(t => [t.month, t]));
    const [year, monthNum] = selectedMonth.value.split('-').map(Number);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, monthNum - 1 - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const data = trendMap.get(key);
      return {
        label: shortMonths[d.getMonth()],
        spend: data?.spend ?? 0
      };
    });
  }, [trend, selectedMonth.value]);

  const spendByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of vendors) {
      map[v.category] = (map[v.category] ?? 0) + v.totalSpend;
    }
    const entries = Object.entries(map).sort(([, a], [, b]) => b - a);
    const max = entries.length > 0 ? Math.max(...entries.map(([, v]) => v)) : 1;
    return entries.map(([category, spend]) => ({ category, spend, pct: (spend / max) * 100 }));
  }, [vendors]);

  const kpis: KpiItem[] = useMemo(() => {
    if (!overview) return [];
    return [
      { label: 'Total Spend',    value: formatLakhs(overview.totalSpend),    icon: DollarSign,   bg: 'bg-emerald-50', color: 'text-emerald-600' },
      { label: 'Total POs',      value: String(overview.totalPoCount),       icon: ShoppingBag,  bg: 'bg-purple-50',  color: 'text-[#714B67]' },
      { label: 'Active Vendors', value: String(overview.activeVendors),     icon: Users,        bg: 'bg-blue-50',    color: 'text-blue-600' },
      { label: 'Total RFQs',     value: String(overview.rfqCount),          icon: FileText,     bg: 'bg-indigo-50',  color: 'text-indigo-600' },
      { label: 'PO Fulfillment', value: overview.fulfillmentRate + '%',     icon: TrendingUp,   bg: 'bg-cyan-50',    color: 'text-cyan-600' },
      { label: 'Overdue Invoices', value: String(overview.overdueInvoices), icon: AlertCircle,  bg: 'bg-rose-50',    color: 'text-rose-600' },
    ];
  }, [overview]);

  if (loading && !overview) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
        <p className="text-xs text-[#6b7280] mt-2 font-semibold">Loading reports...</p>
      </div>
    );
  }

  const exportUrl = `${API_URL}/v1/reports/export/csv`;

  return (
    <div className="space-y-6 font-sans text-[#212529]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Reports & Analytics</h1>
          <p className="text-sm text-[#6b7280] mt-1">Procurement Insights – {selectedMonth.label}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold border border-[#e5e5e5] rounded-[6px] bg-white hover:bg-[#f8f9fa] transition-colors"
            >
              <span>{selectedMonth.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6b7280]" />
            </button>
            {showMonthDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMonthDropdown(false)} />
                <div className="absolute right-0 mt-1 bg-white border border-[#e5e5e5] rounded-[6px] shadow-lg z-20 py-1 w-44">
                  {monthOptions.map(m => (
                    <button
                      key={m.value}
                      onClick={() => { setSelectedMonth(m); setShowMonthDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-[#f8f9fa] transition-colors ${m.value === selectedMonth.value ? 'text-[#714B67]' : 'text-[#212529]'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {user?.role !== 'VENDOR' && (
            <a href={exportUrl}
              className="flex items-center space-x-2 px-4 py-2 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </a>
          )}
        </div>
      </div>

      {kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white p-4 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-[#212529]">{k.value}</p>
                  <p className="text-[10px] text-[#6b7280] font-semibold mt-0.5">{k.label}</p>
                </div>
                <div className={`p-2 ${k.bg} ${k.color} rounded-lg flex-shrink-0 ml-2`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#714B67] mx-auto" /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-[8px] border border-[#e5e5e5] shadow-sm">
          <h3 className="text-sm font-bold text-[#212529] mb-4 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#714B67]" />
            <span>Spend by Category</span>
          </h3>
          {spendByCategory.length > 0 ? (
            <div className="space-y-4">
              {spendByCategory.map(cat => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#212529]">{cat.category}</span>
                    <span className="text-xs font-bold text-[#714B67]">{formatLakhs(cat.spend)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#f0ecf0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: cat.pct + '%', backgroundColor: '#714B67' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-[#6b7280]">No category data for this period.</div>
          )}
        </div>

        <div className="bg-white p-5 rounded-[8px] border border-[#e5e5e5] shadow-sm">
          <h3 className="text-sm font-bold text-[#212529] mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4 text-[#714B67]" />
            <span>Top Vendors by Spend</span>
          </h3>
          {vendors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e5e5] text-[#6b7280] font-bold text-[10px] uppercase tracking-wider">
                    <th className="pb-2.5 pr-3">Vendor</th>
                    <th className="pb-2.5 px-3 text-right">Spend (₹)</th>
                    <th className="pb-2.5 pl-3 text-right">POs</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.slice(0, 8).map((v, i) => (
                    <tr key={v.id} className="border-b border-[#e5e5e5]/60">
                      <td className="py-2.5 pr-3 font-semibold text-[#212529]">{v.companyName}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{Number(v.totalSpend).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 pl-3 text-right text-[#6b7280]">{v.poCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-[#6b7280]">No vendor data.</div>
          )}
        </div>
      </div>

      <div className="bg-white p-5 rounded-[8px] border border-[#e5e5e5] shadow-sm">
        <h3 className="text-sm font-bold text-[#212529] mb-4 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-[#714B67]" />
          <span>Monthly Trend</span>
        </h3>
        {trendWithLabels.some(t => t.spend > 0) ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendWithLabels} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value ?? 0)), 'Spend']}
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e5e5' }}
                />
                <Bar dataKey="spend" fill="#714B67" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-[#6b7280]">No spend data for {selectedMonth.label.toLowerCase()} period.</div>
        )}
      </div>
    </div>
  );
}
