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
      <div className="p-4 border-t border-[#e5e5e5] space-y-3">
        <div className="px-4">
          <p className="text-[10px] text-[#6b7280] font-semibold uppercase tracking-wider">Active Role</p>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-bold text-[#714B67] uppercase">{role}</span>
          </div>
          <p className="text-sm font-bold text-[#212529] truncate mt-1">{user.name}</p>
          <p className="text-xs text-[#6b7280] truncate">{user.email}</p>
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
  );
}
