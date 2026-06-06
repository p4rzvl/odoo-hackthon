'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';

export default function Topbar() {
  const pathname = usePathname();

  // Generate breadcrumbs dynamically based on path segments
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const label = segment.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());

    return (
      <span key={segment} className="flex items-center space-x-2">
        {index > 0 && <span>/</span>}
        <span className={isLast ? 'text-[#212529] font-semibold' : 'hover:text-[#714B67] cursor-pointer'}>
          {label}
        </span>
      </span>
    );
  });

  return (
    <header className="h-[60px] bg-white border-b border-[#e5e5e5] flex items-center justify-between px-8 shadow-sm shrink-0 font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-[#6b7280]">
        <span className="hover:text-[#714B67] cursor-pointer">Home</span>
        {breadcrumbs.length > 0 && <span>/</span>}
        {breadcrumbs}
      </div>

      {/* Search bar */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8F8F8F]" />
        <input
          type="text"
          placeholder="Search ERP records..."
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
  );
}
