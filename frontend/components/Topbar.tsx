'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, CheckCheck, ExternalLink } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getUnreadCount, getNotificationsList, markAllAsRead, markAsRead, type Notification } from '@/services/notification';

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchUnread = async () => {
    const res = await getUnreadCount();
    if (res.success && res.data) setUnread(res.data.count);
  };

  const openDropdown = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setLoading(true);
      const res = await getNotificationsList({ read: false, limit: 5 });
      if (res.success && res.data) setNotifications(res.data.notifications);
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setUnread(0);
    setNotifications([]);
  };

  const handleMarkRead = async (id: number) => {
    await markAsRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnread(prev => Math.max(0, prev - 1));
  };

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
      <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
        <button className="p-2 text-[#6b7280] hover:text-[#714B67] transition-all relative" onClick={openDropdown}>
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#dc2626] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 w-[360px] bg-white border border-[#e5e5e5] rounded-lg shadow-lg z-50 max-h-[480px] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5] shrink-0">
              <span className="text-sm font-semibold text-[#212529]">Notifications</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#714B67] hover:text-[#5a3950] flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => { router.push('/notifications'); setShowDropdown(false); }}
                  className="text-xs text-[#6b7280] hover:text-[#714B67] flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View all
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-6 text-center text-sm text-[#6b7280]">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#6b7280]">No new notifications</div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className="px-4 py-3 border-b border-[#e5e5e5] hover:bg-[#f8f9fa] cursor-pointer group"
                    onClick={() => handleMarkRead(n.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-[#212529] leading-relaxed flex-1">{n.message}</p>
                      <span className="w-1.5 h-1.5 bg-[#714B67] rounded-full mt-1.5 shrink-0 group-hover:opacity-0" />
                    </div>
                    <p className="text-[10px] text-[#6b7280] mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <span className="text-[10px] text-[#6b7280] bg-[#f8f9fa] border border-[#e5e5e5] px-3 py-1.5 rounded-full font-mono font-semibold">
          v19.0.1.0.0
        </span>
      </div>
    </header>
  );
}
