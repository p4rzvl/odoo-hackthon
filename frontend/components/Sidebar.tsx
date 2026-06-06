'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  ShoppingBag, 
  Receipt, 
  History, 
  BarChart3,
  LogOut,
  FolderOpen,
  Bell
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const role = user.role;

  // Base navigation configuration
  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MANAGER', 'OFFICER', 'VENDOR']
    },
    {
      label: 'User Manager',
      href: '/admin/users',
      icon: Users,
      roles: ['ADMIN']
    },
    {
      label: 'Vendor Directory',
      href: '/vendors',
      icon: Users,
      roles: ['OFFICER', 'MANAGER']
    },
    {
      label: 'RFQs',
      href: '/rfqs',
      icon: FolderOpen,
      roles: ['OFFICER', 'VENDOR']
    },
    {
      label: 'Quotations',
      href: '/quotations',
      icon: FileText,
      roles: ['VENDOR']
    },
    {
      label: 'Approvals',
      href: '/approvals',
      icon: CheckSquare,
      roles: ['MANAGER']
    },
    {
      label: 'Purchase Orders',
      href: '/purchase-orders',
      icon: ShoppingBag,
      roles: ['OFFICER', 'MANAGER']
    },
    {
      label: 'Invoices',
      href: '/invoices',
      icon: Receipt,
      roles: ['OFFICER', 'MANAGER', 'VENDOR']
    },
    {
      label: 'Activity Logs',
      href: '/activity-logs',
      icon: History,
      roles: ['ADMIN', 'OFFICER', 'MANAGER', 'VENDOR']
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      roles: ['ADMIN', 'OFFICER', 'MANAGER', 'VENDOR']
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['OFFICER', 'MANAGER']
    }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-[250px] bg-white border-r border-[#e5e5e5] flex flex-col justify-between shadow-sm shrink-0 h-screen sticky top-0 font-sans">
      <div>
        {/* Brand header */}
        <div className="p-6 border-b border-[#e5e5e5] flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-[#714B67] flex items-center justify-center font-bold text-lg text-white">
            V
          </div>
          <span className="text-lg font-bold tracking-tight text-[#212529]">VendorBridge</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] px-3 mb-2">Applications</p>
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-[6px] font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-[#714B67] text-white'
                    : 'text-[#212529] hover:bg-[#f8f9fa] hover:text-[#714B67]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8F8F8F]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile details & Logout */}
      <div className="p-4 border-t border-[#e5e5e5] flex flex-col gap-3">
        {/* Profile Card */}
        <div className="p-3 bg-[#f8f9fa] border border-[#e5e5e5] rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#714B67]/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#714B67]/20">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-[#714B67]">
                  {((user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '')).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#212529] truncate">{user.name}</p>
              <p className="text-xs text-[#6b7280] truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#e5e5e5]/60">
            <span className="text-[10px] text-[#6b7280] font-semibold uppercase tracking-wider">Active Role</span>
            <div className="flex items-center space-x-1.5 bg-[#714B67]/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-[10px] font-bold text-[#714B67] uppercase tracking-wider">{role}</span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-100/80 rounded-lg font-semibold text-sm transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
