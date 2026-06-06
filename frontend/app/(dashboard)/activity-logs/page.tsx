'use client';

import { useState, useEffect, useMemo } from 'react';
import { getActivityLogsList, getActivityLogDetail, ActivityLog } from '../../../services/activityLog';
import { useAuth } from '../../../context/AuthContext';
import { History, Loader2, User, FileText, ClipboardList, CheckCircle2, ShoppingCart, DollarSign, ShieldAlert, X, ExternalLink, Activity, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const actionTypeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  USER:      { label: 'User',      icon: User,         color: 'text-blue-600',     bg: 'bg-blue-50' },
  VENDOR:    { label: 'Vendor',    icon: Building2,    color: 'text-emerald-600',  bg: 'bg-emerald-50' },
  RFQ:       { label: 'RFQ',       icon: ClipboardList,color: 'text-indigo-600',   bg: 'bg-indigo-50' },
  QUOTATION: { label: 'Quotation', icon: FileText,     color: 'text-amber-600',    bg: 'bg-amber-50' },
  APPROVAL:  { label: 'Approval',  icon: CheckCircle2, color: 'text-purple-600',   bg: 'bg-purple-50' },
  PO:        { label: 'PO',        icon: ShoppingCart, color: 'text-cyan-600',     bg: 'bg-cyan-50' },
  INVOICE:   { label: 'Invoice',   icon: DollarSign,   color: 'text-rose-600',     bg: 'bg-rose-50' },
  SYSTEM:    { label: 'System',    icon: ShieldAlert,  color: 'text-slate-600',    bg: 'bg-slate-50' },
};

function Building2({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
}

const ROLE_TYPES: Record<string, string[]> = {
  ADMIN: ['USER', 'VENDOR', 'RFQ', 'QUOTATION', 'APPROVAL', 'PO', 'INVOICE', 'SYSTEM'],
  MANAGER: ['APPROVAL', 'PO', 'RFQ', 'QUOTATION', 'INVOICE'],
  OFFICER: ['RFQ', 'QUOTATION', 'PO', 'INVOICE', 'VENDOR'],
  VENDOR: ['RFQ', 'PO', 'INVOICE', 'QUOTATION', 'SYSTEM'],
};

export default function ActivityLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const role = user?.role || 'VENDOR';
  const visibleTypes = ROLE_TYPES[role] || ROLE_TYPES.VENDOR;

  // Client-side search filter on description
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(l => l.description.toLowerCase().includes(q));
  }, [logs, searchQuery]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const actionTypes = selectedTypes.size > 0 ? Array.from(selectedTypes).join(',') : undefined;
      const res = await getActivityLogsList({ actionTypes, page, limit: 15 });
      if (res.success && res.data) {
        setLogs(res.data.logs);
        setTotalPages(res.data.pagination.totalPages);
        setTotal(res.data.pagination.total);
      } else {
        toast.error(res.error || 'Failed to retrieve activity logs');
      }
    } catch {
      toast.error('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [selectedTypes, page]);

  const openDetail = async (log: ActivityLog) => {
    setLoadingDetail(true);
    setSelectedLog(log);
    try {
      const res = await getActivityLogDetail(log.id);
      if (res.success && res.data) {
        setSelectedLog(res.data.log);
      }
    } catch {
      // fall through — we already have the list data
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-6 font-sans text-[#212529]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Activity Logs</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Immutable audit trail of all system actions. {total > 0 && <span className="font-semibold">{total} records</span>}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {/* Filter chips */}
        <div className="p-4 border-b border-[#e5e5e5] space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8F8F8F]" />
            <input
              type="text"
              placeholder="Search activity descriptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#f8f9fa] w-full pl-9 pr-4 py-2 rounded-[6px] text-xs outline-none border border-[#e5e5e5] focus:border-[#714B67] text-[#212529] transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {visibleTypes.map(t => {
                const cfg = actionTypeConfig[t] || actionTypeConfig.SYSTEM;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTypes(prev => {
                        const next = new Set(prev);
                        if (next.has(t)) next.delete(t);
                        else next.add(t);
                        return next;
                      });
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-full border transition-all ${
                      selectedTypes.has(t)
                        ? `${cfg.bg} ${cfg.color} border-transparent`
                        : 'bg-white text-[#6b7280] border-[#e5e5e5] hover:border-[#714B67] hover:text-[#714B67]'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            {selectedTypes.size > 0 && (
              <button
                onClick={() => { setSelectedTypes(new Set()); setPage(1); }}
                className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#6b7280] hover:text-red-600 transition-all"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div>
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
              <p className="text-xs text-[#6b7280] mt-2 font-semibold">Loading activity trail...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <History className="w-12 h-12 text-[#8F8F8F] mx-auto stroke-[1.5]" />
              <div className="text-sm font-bold text-[#212529]">No Activity Logs Found</div>
              <p className="text-xs text-[#6b7280] max-w-sm mx-auto">
                {searchQuery ? 'No logs match your search query.' : 'System actions will appear here as users interact with the platform.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e5e5]">
              {filteredLogs.map((log, i) => {
                const cfg = actionTypeConfig[log.actionType] || actionTypeConfig.SYSTEM;
                const Icon = cfg.icon;
                return (
                  <button
                    key={log.id}
                    onClick={() => openDetail(log)}
                    className={`w-full text-left p-4 flex items-start space-x-4 hover:bg-[#f8f9fa] transition-colors cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-[#fcfbfd]'}`}
                  >
                    <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#212529]">{log.description}</p>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#9ca3af]" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-1.5">
                        <span className="text-xs text-[#6b7280]">
                          {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'}
                          {log.actor && <span className="opacity-50 ml-1">({log.actor.role})</span>}
                        </span>
                        <span className="text-[10px] text-[#9ca3af]">&bull;</span>
                        <span className="text-xs text-[#9ca3af]">{formatDate(log.createdAt)}</span>
                        {log.entityType && log.entityId && (
                          <>
                            <span className="text-[10px] text-[#9ca3af]">&bull;</span>
                            <span className="text-xs text-[#9ca3af]">
                              {log.entityType} #{log.entityId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {totalPages > 1 && (
                <div className="p-4 border-t border-[#e5e5e5] flex items-center justify-between">
                  <div className="text-[11px] text-[#6b7280]">Page <b>{page}</b> of <b>{totalPages}</b> ({total} records)</div>
                  <div className="flex items-center gap-1">
                    <button disabled={page === 1} onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      className="p-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] disabled:opacity-30 transition-all">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold transition-all ${
                          page === p ? 'bg-[#714B67] text-white' : 'border border-[#e5e5e5] hover:bg-[#f8f9fa]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button disabled={page === totalPages} onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      className="p-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] disabled:opacity-30 transition-all">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-[12px] shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto border border-[#e5e5e5]"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-[#e5e5e5] px-6 py-4 flex items-center justify-between rounded-t-[12px]">
              <h2 className="text-sm font-bold text-[#212529] tracking-tight flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#714B67]" />
                <span>Activity Details</span>
              </h2>
              <button onClick={() => setSelectedLog(null)} className="p-1.5 hover:bg-[#f8f9fa] rounded-full transition-colors">
                <X className="w-4 h-4 text-[#6b7280]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {loadingDetail ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#714B67] mx-auto" />
                </div>
              ) : (
                <>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Description</div>
                    <p className="text-sm font-semibold text-[#212529]">{selectedLog.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Action Type</div>
                      <div className="flex items-center space-x-1.5">
                        {(() => {
                          const c = actionTypeConfig[selectedLog.actionType] || actionTypeConfig.SYSTEM;
                          const I = c.icon;
                          return (
                            <>
                              <div className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center`}>
                                <I className={`w-3 h-3 ${c.color}`} />
                              </div>
                              <span className="text-xs font-bold uppercase">{c.label}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Log ID</div>
                      <span className="text-xs font-mono font-bold text-[#212529]">#{selectedLog.id}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Actor</div>
                      <div className="text-xs font-semibold text-[#212529]">
                        {selectedLog.actor
                          ? `${selectedLog.actor.firstName} ${selectedLog.actor.lastName}`
                          : <span className="text-[#6b7280]">System</span>}
                      </div>
                      {selectedLog.actor && (
                        <div className="text-[10px] text-[#6b7280] mt-0.5">
                          {selectedLog.actor.email} &middot; {selectedLog.actor.role}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Timestamp</div>
                      <div className="text-xs font-semibold text-[#212529]">{formatFullDate(selectedLog.createdAt)}</div>
                      <div className="text-[10px] text-[#6b7280] mt-0.5">
                        {new Date(selectedLog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {(selectedLog.entityType || selectedLog.entityId) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLog.entityType && (
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Entity Type</div>
                          <span className="text-xs font-bold text-[#714B67]">{selectedLog.entityType}</span>
                        </div>
                      )}
                      {selectedLog.entityId && (
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Entity ID</div>
                          <span className="text-xs font-mono font-bold text-[#212529]">#{selectedLog.entityId}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[#f8f9fa] rounded-[8px] p-3 border border-[#e5e5e5]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1">Immutable Record</div>
                    <p className="text-[11px] text-[#6b7280] leading-relaxed">
                      This activity log entry was automatically recorded at the time of the action and cannot be modified or deleted. It serves as an immutable audit trail entry.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
