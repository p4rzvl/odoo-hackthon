'use client';

import { useAuth } from '../../../context/AuthContext';
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

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  // Render role-specific content
  const renderDashboardContent = () => {
    switch (role) {
      case 'ADMIN':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Admin Control Center</h1>
              <p className="text-sm text-[#6b7280] mt-1">Manage platform onboarding, system security, and audit trails.</p>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Pending Approvals</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">3 Accounts</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Active Users</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">18 Users</p>
                </div>
                <div className="p-3 bg-purple-50 text-[#714B67] rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Audit Operations</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">142 Logs</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm">
              <h3 className="text-sm font-bold text-[#212529] mb-4">Quick Operations</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/admin/users"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>Onboard Pending Accounts</span>
                </Link>
                <Link
                  href="/activity-logs"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#f8f9fa] border border-[#e5e5e5] hover:bg-[#e5e5e5]/45 text-[#212529] text-xs font-semibold rounded-[6px] transition-all"
                >
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
              <Link
                href="/rfqs/create"
                className="flex items-center space-x-2 px-4 py-2.5 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create RFQ</span>
              </Link>
            </div>

            {/* Officer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Active RFQs</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">12 Active</p>
                </div>
                <div className="p-3 bg-purple-50 text-[#714B67] rounded-lg">
                  <FolderOpen className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Registered Vendors</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">45 Profiles</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Pending Approvals</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">4 Items</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <CheckSquare className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Total PO Spend</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">$24.5k</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Navigation Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm">
                <h3 className="text-sm font-bold text-[#212529] mb-2">Recent RFQs</h3>
                <p className="text-xs text-[#6b7280] mb-4">View status of the latest procurement requests.</p>
                <div className="text-xs text-center py-8 text-[#8F8F8F] border border-dashed border-[#e5e5e5] rounded-[6px]">
                  No active RFQs found. Click &quot;Create RFQ&quot; to begin.
                </div>
              </div>

              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#212529] mb-2">Procurement Reports</h3>
                  <p className="text-xs text-[#6b7280] mb-4">Review total corporate expenditure, vendor delivery performance, and tax statistics.</p>
                </div>
                <Link
                  href="/reports"
                  className="flex items-center justify-center space-x-2 w-full py-2.5 bg-[#f8f9fa] border border-[#e5e5e5] hover:bg-[#e5e5e5]/45 text-[#212529] text-xs font-semibold rounded-[6px] transition-all"
                >
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

            {/* Vendor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Invited RFQs</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">2 Invitations</p>
                </div>
                <div className="p-3 bg-purple-50 text-[#714B67] rounded-lg">
                  <FolderOpen className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Submitted Bids</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">5 Quotations</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Unpaid Invoices</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">$3,420</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm">
              <h3 className="text-sm font-bold text-[#212529] mb-4">Immediate Tasks</h3>
              <div className="flex gap-4">
                <Link
                  href="/rfqs"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all"
                >
                  <span>Review RFQ Invites</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/invoices"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#f8f9fa] border border-[#e5e5e5] hover:bg-[#e5e5e5]/45 text-[#212529] text-xs font-semibold rounded-[6px] transition-all"
                >
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

            {/* Manager Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Pending My Sign-Off</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">3 Items</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <CheckSquare className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Approved Today</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">12 POs</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Monthly Spend Authorized</p>
                  <p className="text-2xl font-bold text-[#212529] mt-2">$45.8k</p>
                </div>
                <div className="p-3 bg-purple-50 text-[#714B67] rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-sm">
              <h3 className="text-sm font-bold text-[#212529] mb-4">Operations Queue</h3>
              <div className="flex gap-4">
                <Link
                  href="/approvals"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#714B67] hover:bg-[#9e7592] text-white text-xs font-semibold rounded-[6px] transition-all"
                >
                  <span>Access Approval Queue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/reports"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#f8f9fa] border border-[#e5e5e5] hover:bg-[#e5e5e5]/45 text-[#212529] text-xs font-semibold rounded-[6px] transition-all"
                >
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
