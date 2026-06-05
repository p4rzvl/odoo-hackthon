'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardMetrics } from '../../services/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  LogOut,
  LayoutDashboard,
  Settings,
  Package,
  Loader2,
  Bell,
  Search
} from 'lucide-react';

interface Metrics {
  activeUsers: number;
  totalOrders: number;
  revenueUSD: number;
  satisfactionRate: string;
}

export default function DashboardPage() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !token)) {
      router.push('/login');
      return;
    }

    const fetchMetrics = async () => {
      if (!token) return;
      try {
        const res = await getDashboardMetrics(token);
        if (res.success && res.metrics) {
          setMetrics(res.metrics);
        } else {
          toast.error(res.error || 'Failed to retrieve secure metrics.');
          logout();
        }
      } catch (err) {
        toast.error('Connection issue with database server.');
      } finally {
        setLoadingMetrics(false);
      }
    };

    if (user && token) {
      fetchMetrics();
    }
  }, [user, token, authLoading, router]);

  if (authLoading || (!user && !token)) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
          <p className="text-sm text-[#212529] font-semibold">Loading Odoo Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-[#212529]">
      {/* Sidebar Navigation Menu (Odoo Spec: width 250px, border-r 1px solid #e5e5e5) */}
      <aside className="w-[250px] bg-white border-r border-[#e5e5e5] flex flex-col justify-between shadow-sm shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-[#e5e5e5] flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-[#714B67] flex items-center justify-center font-bold text-lg text-white">
              O
            </div>
            <span className="text-lg font-bold tracking-tight text-[#212529]">Odoo ERP</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] px-3 mb-2">Apps</p>
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-2 bg-[#714B67] text-white rounded-[6px] font-semibold text-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-2.5 text-[#212529] hover:bg-[#f8f9fa] hover:text-[#714B67] rounded-[6px] font-semibold text-sm transition-all"
            >
              <Package className="w-4 h-4 text-[#8F8F8F]" />
              <span>Inventory</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-2.5 text-[#212529] hover:bg-[#f8f9fa] hover:text-[#714B67] rounded-[6px] font-semibold text-sm transition-all"
            >
              <Settings className="w-4 h-4 text-[#8F8F8F]" />
              <span>Settings</span>
            </a>
          </nav>
        </div>

        {/* User profile details & Logout */}
        <div className="p-4 border-t border-[#e5e5e5] space-y-3">
          <div className="px-4">
            <p className="text-[10px] text-[#6b7280] font-semibold uppercase tracking-wider">Active User</p>
            <p className="text-sm font-bold text-[#212529] truncate">{user?.name}</p>
            <p className="text-xs text-[#6b7280] truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-[6px] font-semibold text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar Control Panel (Odoo Spec: height 60px, border-b 1px solid #e5e5e5) */}
        <header className="h-[60px] bg-white border-b border-[#e5e5e5] flex items-center justify-between px-8 shadow-sm">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm text-[#6b7280]">
            <span className="hover:text-[#714B67] cursor-pointer">Home</span>
            <span>/</span>
            <span className="hover:text-[#714B67] cursor-pointer">Sales</span>
            <span>/</span>
            <span className="text-[#212529] font-semibold">Dashboard</span>
          </div>

          {/* Search bar */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8F8F8F]" />
            <input
              type="text"
              placeholder="Search record..."
              className="bg-[#f8f9fa] w-full pl-9 pr-4 py-1.5 rounded-[6px] text-xs outline-none border border-transparent focus:border-[#e5e5e5] text-[#212529] transition-all"
            />
          </div>

          {/* Toolbar utilities */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-[#6b7280] hover:text-[#714B67] transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#dc2626] rounded-full" />
            </button>
            <span className="text-[10px] text-[#6b7280] bg-[#f8f9fa] border border-[#e5e5e5] px-3 py-1.5 rounded-full font-mono font-semibold">
              v19.0.1.0.0
            </span>
          </div>
        </header>

        {/* Dashboard Metrics Container */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 max-w-[1200px] w-full mx-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#212529]">ERP KPI Dashboard</h1>
            <p className="text-sm text-[#6b7280] mt-1">
              Transactional metric tracking. Validated sessions monitored securely.
            </p>
          </div>

          {/* Metric cards (Odoo Spec: white background, border 1px solid #e5e5e5, rounded 8px, shadow 0 1px 3px) */}
          {loadingMetrics ? (
            <div className="h-64 flex items-center justify-center bg-white rounded-[8px] border border-[#e5e5e5]">
              <div className="text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#714B67] mx-auto" />
                <p className="text-xs text-slate-400">Loading transactional data...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Active Users */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Active Customers</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">{metrics?.activeUsers}</p>
                </div>
                <div className="p-3 bg-purple-50 text-[#714B67] rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Total Sales Orders</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">{metrics?.totalOrders}</p>
                </div>
                <div className="p-3 bg-purple-50 text-[#714B67] rounded-lg">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Revenue */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Gross Revenue</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">
                    ${metrics?.revenueUSD.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 text-[#714B67] rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Satisfaction */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Client Satisfaction</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">{metrics?.satisfactionRate}</p>
                </div>
                <div className="p-3 bg-purple-50 text-[#714B67] rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Database Table (Odoo Spec: high-density, row limits border, alternate stripes, hover highlight bg-e5e5e5/35) */}
          <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <h3 className="text-sm font-bold text-[#212529] mb-2">Connected System Nodes</h3>
            <p className="text-xs text-[#6b7280] mb-4">Relational verification check on API and Neon PostgreSQL layers.</p>
            <div className="border border-[#e5e5e5] rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[11px] uppercase tracking-wider">
                    <th className="p-3">Node Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#e5e5e5] hover:bg-[#e5e5e5]/35 transition-colors">
                    <td className="p-3 font-semibold text-[#212529]">Express API Node</td>
                    <td className="p-3 text-[#6b7280]">Server Layer</td>
                    <td className="p-3">
                      <span className="text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-[4px] font-semibold text-[10px]">
                        Online
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-[#f9f9f9] border-b border-[#e5e5e5] hover:bg-[#e5e5e5]/35 transition-colors">
                    <td className="p-3 font-semibold text-[#212529]">Neon PostgreSQL</td>
                    <td className="p-3 text-[#6b7280]">Database Layer</td>
                    <td className="p-3">
                      <span className="text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-[4px] font-semibold text-[10px]">
                        Connected
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
