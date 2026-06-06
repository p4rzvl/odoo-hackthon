'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getDashboardMetrics, DashboardMetrics } from '../../../services/dashboard';
import { 
  Users, 
  FolderOpen, 
  CheckSquare, 
  FileText, 
  DollarSign, 
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function formatCurrency(value: number) {
  return '₹' + Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await getDashboardMetrics();
        if (res.success && res.data) {
          setMetrics(res.data.metrics);
        } else {
          toast.error(res.error || 'Failed to load dashboard metrics');
        }
      } catch {
        toast.error('Could not connect to backend server.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (!user) return null;
  if (loading) return <DashboardShell><LoadingSkeleton /></DashboardShell>;

  const role = user.role;

  const renderDashboardContent = () => {
    switch (role) {
      case 'ADMIN':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Admin Control Center</h1>
              <p className="text-sm text-[#6b7280] mt-1">Manage platform onboarding, system security, and audit trails.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                label="Pending Approvals"
                value={`${metrics?.pendingAccounts ?? 0} Accounts`}
                icon={AlertCircle}
                bg="bg-amber-50" iconColor="text-amber-600"
              />
              <MetricCard
                label="Active Users"
                value={`${metrics?.activeUsers ?? 0} Users`}
                icon={Users}
                bg="bg-purple-50" iconColor="text-[#714B67]"
              />
              <MetricCard
                label="Audit Operations"
                value={`${metrics?.totalActivityLogs ?? 0} Logs`}
                icon={ShieldCheck}
                bg="bg-blue-50" iconColor="text-blue-600"
              />
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm">
              <h3 className="text-sm font-bold text-[#212529] mb-4">Quick Operations</h3>
              <div className="flex flex-wrap gap-4">
                <Link href="/admin/users"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all">
                  <Users className="w-4 h-4" />
                  <span>Onboard Pending Accounts</span>
                </Link>
                <Link href="/activity-logs"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#f8f9fa] border border-[#e5e5e5] hover:bg-[#e5e5e5]/45 text-[#212529] text-xs font-semibold rounded-[6px] transition-all">
                  <ShieldCheck className="w-4 h-4 text-[#6b7280]" />
                  <span>View Security Audits</span>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'OFFICER':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Procurement Dashboard</h1>
                <p className="text-sm text-[#6b7280] mt-1">Manage vendor qualifications, create RFQs, and monitor purchase execution.</p>
              </div>
              <Link href="/rfqs/create"
                className="flex items-center space-x-2 px-4 py-2.5 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Create RFQ</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard label="Active RFQs" value={`${metrics?.activeRfqs ?? 0} Active`} icon={FolderOpen} bg="bg-purple-50" iconColor="text-[#714B67]" />
              <MetricCard label="Registered Vendors" value={`${metrics?.registeredVendors ?? 0} Profiles`} icon={Users} bg="bg-blue-50" iconColor="text-blue-600" />
              <MetricCard label="Pending Approvals" value={`${metrics?.pendingApprovals ?? 0} Items`} icon={CheckSquare} bg="bg-amber-50" iconColor="text-amber-600" />
              <MetricCard label="Total PO Spend" value={formatCurrency(metrics?.totalPoSpend ?? 0)} icon={DollarSign} bg="bg-emerald-50" iconColor="text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm">
                <h3 className="text-sm font-bold text-[#212529] mb-2">Recent RFQs</h3>
                <p className="text-xs text-[#6b7280] mb-4">View status of the latest procurement requests.</p>
                <div className="text-xs text-center py-8 text-[#8F8F8F] border border-dashed border-[#e5e5e5] rounded-[6px]">
                  {metrics?.activeRfqs && metrics.activeRfqs > 0
                    ? `${metrics.activeRfqs} RFQs currently active. Visit the RFQs page to manage them.`
                    : 'No active RFQs found. Click "Create RFQ" to begin.'}
                </div>
              </div>
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#212529] mb-2">Procurement Reports</h3>
                  <p className="text-xs text-[#6b7280] mb-4">Review total corporate expenditure, vendor delivery performance, and tax statistics.</p>
                </div>
                <Link href="/reports"
                  className="flex items-center justify-center space-x-2 w-full py-2.5 bg-[#f8f9fa] border border-[#e5e5e5] hover:bg-[#e5e5e5]/45 text-[#212529] text-xs font-semibold rounded-[6px] transition-all">
                  <span>Go to Reports Hub</span>
                  <ArrowRight className="w-4 h-4 text-[#6b7280]" />
                </Link>
              </div>
            </div>
          </div>
        );

      case 'VENDOR':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Vendor Portal</h1>
              <p className="text-sm text-[#6b7280] mt-1">Review assigned bidding rounds, submit quotation pricing, and track invoice payments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard label="Invited RFQs" value={`${metrics?.invitedRfqs ?? 0} Invitations`} icon={FolderOpen} bg="bg-purple-50" iconColor="text-[#714B67]" />
              <MetricCard label="Submitted Bids" value={`${metrics?.submittedBids ?? 0} Quotations`} icon={FileText} bg="bg-blue-50" iconColor="text-blue-600" />
              <MetricCard label="Unpaid Invoices" value={formatCurrency(metrics?.unpaidInvoices ?? 0)} icon={AlertCircle} bg="bg-amber-50" iconColor="text-amber-600" />
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm">
              <h3 className="text-sm font-bold text-[#212529] mb-4">Immediate Tasks</h3>
              <div className="flex gap-4">
                <Link href="/rfqs"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all">
                  <span>Review RFQ Invites</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/invoices"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#f8f9fa] border border-[#e5e5e5] hover:bg-[#e5e5e5]/45 text-[#212529] text-xs font-semibold rounded-[6px] transition-all">
                  <span>View Billing Statement</span>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'MANAGER':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Approvals Hub</h1>
              <p className="text-sm text-[#6b7280] mt-1">Review quotation price comparisons, sign off PO requests, and track cost center allocations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard label="Pending My Sign-Off" value={`${metrics?.pendingSignOff ?? 0} Items`} icon={CheckSquare} bg="bg-amber-50" iconColor="text-amber-600" />
              <MetricCard label="Approved Today" value={`${metrics?.approvedToday ?? 0} POs`} icon={TrendingUp} bg="bg-emerald-50" iconColor="text-emerald-600" />
              <MetricCard label="Monthly Spend Authorized" value={formatCurrency(metrics?.monthlySpendAuthorized ?? 0)} icon={DollarSign} bg="bg-purple-50" iconColor="text-[#714B67]" />
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm">
              <h3 className="text-sm font-bold text-[#212529] mb-4">Operations Queue</h3>
              <div className="flex gap-4">
                <Link href="/approvals"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all">
                  <span>Access Approval Queue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/reports"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#f8f9fa] border border-[#e5e5e5] hover:bg-[#e5e5e5]/45 text-[#212529] text-xs font-semibold rounded-[6px] transition-all">
                  <span>Examine Spend Metrics</span>
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderDashboardContent();
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-[#e5e5e5] rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm h-24 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, bg, iconColor }: {
  label: string;
  value: string;
  icon: any;
  bg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-[#212529] mt-2">{value}</p>
      </div>
      <div className={`p-3 ${bg} ${iconColor} rounded-lg`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
