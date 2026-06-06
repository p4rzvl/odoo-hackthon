'use client';

import { useEffect, useState } from 'react';
import { getNotificationsList, markAllAsRead, type Notification } from '@/services/notification';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const TYPE_COLORS: Record<string, string> = {
  RFQ_INVITATION: 'text-blue-600 bg-blue-50',
  APPROVAL_REQUEST: 'text-amber-600 bg-amber-50',
  APPROVAL_REJECTED: 'text-red-600 bg-red-50',
  PO_GENERATED: 'text-purple-600 bg-purple-50',
  PO_ISSUED: 'text-purple-600 bg-purple-50',
  INVOICE: 'text-emerald-600 bg-emerald-50',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 15;

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await getNotificationsList({ page, limit });
    if (res.success && res.data) {
      setNotifications(res.data.notifications);
      setTotal(res.data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    toast.success('All notifications marked as read');
    fetchNotifications();
  };

  const totalPages = Math.ceil(total / limit);

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#714B67]/10 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#714B67]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#212529]">Notifications</h1>
            <p className="text-sm text-[#6b7280]">{total} notification{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2 text-[#6b7280] hover:text-[#714B67] rounded-lg hover:bg-[#f8f9fa] transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs text-[#714B67] hover:text-[#5a3950] font-medium px-3 py-1.5 rounded-lg hover:bg-[#f8f9fa] transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-[#f8f9fa] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-[#e5e5e5] mx-auto mb-3" />
          <p className="text-[#6b7280] text-sm">No notifications yet</p>
        </div>
      ) : (
        <>
          {/* Notification list */}
          <div className="space-y-2">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`bg-white border border-[#e5e5e5] rounded-lg p-4 transition-all hover:shadow-sm ${!n.isRead ? 'border-l-2 border-l-[#714B67]' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[n.type] || 'text-gray-600 bg-gray-50'}`}>
                        {getTypeLabel(n.type)}
                      </span>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 bg-[#714B67] rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-[#212529]">{n.message}</p>
                    <p className="text-[11px] text-[#6b7280] mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e5e5e5]">
              <p className="text-xs text-[#6b7280]">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 text-[#6b7280] hover:text-[#714B67] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#f8f9fa] transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 text-[#6b7280] hover:text-[#714B67] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#f8f9fa] transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
