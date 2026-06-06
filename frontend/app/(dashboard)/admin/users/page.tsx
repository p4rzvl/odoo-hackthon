'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useSearchParams } from 'next/navigation';
import RoleGuard from '../../../../components/RoleGuard';
import StatusBadge from '../../../../components/StatusBadge';
import { Loader2, Shield, UserCheck, UserX, RefreshCw, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  approvalLevel: number | null;
  createdAt: string;
  updatedAt: string;
}

const ROLES = ['ADMIN', 'MANAGER', 'OFFICER', 'VENDOR'];
const STATUSES = ['PENDING', 'ACTIVE', 'INACTIVE'];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const perPage = 8;

  // Read query param on mount
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'PENDING') {
      setStatusFilter(new Set(['PENDING']));
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/admin/users`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setUsers(json.data.users);
      else toast.error(json.error || 'Failed to load users');
    } catch {
      toast.error('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (roleFilter.size > 0) {
      result = result.filter(u => roleFilter.has(u.role));
    }
    if (statusFilter.has('PENDING')) {
      result = result.filter(u => !u.isActive && u.createdAt === u.updatedAt);
    }
    if (statusFilter.has('INACTIVE')) {
      result = result.filter(u => !u.isActive && u.createdAt !== u.updatedAt);
    }
    if (statusFilter.has('ACTIVE')) {
      result = result.filter(u => u.isActive);
    }
    return result;
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  const toggleRole = (r: string) => {
    setRoleFilter(prev => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  };

  const toggleStatus = (s: string) => {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const toggleActive = async (userId: number) => {
    const res = await fetch(`${API_URL}/v1/admin/users/${userId}/activate`, {
      method: 'PATCH', credentials: 'include'
    });
    const json = await res.json();
    if (json.success) {
      toast.success('User status updated');
      fetchUsers();
    } else toast.error(json.error || 'Failed to update user');
  };

  const setLevel = async (userId: number, level: number | null) => {
    const res = await fetch(`${API_URL}/v1/admin/users/${userId}/approval-level`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalLevel: level }),
      credentials: 'include'
    });
    const json = await res.json();
    if (json.success) {
      toast.success('Approval level updated');
      fetchUsers();
    } else toast.error(json.error || 'Failed to set approval level');
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6 font-sans text-[#212529]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#212529] flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#714B67]" />
              <span>User Management</span>
            </h1>
            <p className="text-sm text-[#6b7280] mt-1">
              Activate/deactivate users and assign L1/L2 approval levels to managers.
            </p>
          </div>
          <button onClick={fetchUsers} className="p-2 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] transition-all">
            <RefreshCw className="w-4 h-4 text-[#6b7280]" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8F8F8F]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#f8f9fa] w-full pl-9 pr-4 py-2 rounded-[6px] text-xs outline-none border border-[#e5e5e5] focus:border-[#714B67] text-[#212529] transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-1">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => toggleRole(r)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-full border transition-all ${
                    roleFilter.has(r)
                      ? 'bg-[#714B67] text-white border-[#714B67]'
                      : 'bg-white text-[#6b7280] border-[#e5e5e5] hover:border-[#714B67] hover:text-[#714B67]'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-[#e5e5e5]" />
            <div className="flex flex-wrap gap-1">
              {STATUSES.map(s => {
                let activeStyle = 'bg-[#714B67] text-white border-[#714B67]';
                if (s === 'PENDING') activeStyle = 'bg-amber-500 text-white border-amber-500';
                else if (s === 'ACTIVE') activeStyle = 'bg-emerald-500 text-white border-emerald-500';
                else if (s === 'INACTIVE') activeStyle = 'bg-slate-500 text-white border-slate-500';
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-full border transition-all ${
                      statusFilter.has(s)
                        ? activeStyle
                        : 'bg-white text-[#6b7280] border-[#e5e5e5] hover:border-[#714B67] hover:text-[#714B67]'
                    }`}
                  >
                    {s === 'ALL' ? 'All' : s}
                  </button>
                );
              })}
            </div>
            {(roleFilter.size > 0 || statusFilter.size > 0) && (
              <button
                onClick={() => { setRoleFilter(new Set()); setStatusFilter(new Set()); }}
                className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#6b7280] hover:text-red-600 transition-all"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
              <p className="text-xs text-[#6b7280] mt-2 font-semibold">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[11px] uppercase tracking-wider">
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Approval Level</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((u, i) => (
                    <tr key={u.id} className={`border-b border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#fcfbfd]'}`}>
                      <td className="p-4">
                        <span className="font-bold">{u.firstName} {u.lastName}</span>
                      </td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4"><StatusBadge status={u.role} /></td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.role === 'MANAGER' ? (
                          <select
                            value={u.approvalLevel ?? ''}
                            onChange={e => setLevel(u.id, e.target.value ? parseInt(e.target.value) : null)}
                            className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-[4px] px-2 py-1 text-[10px] font-semibold outline-none focus:border-[#714B67]"
                          >
                            <option value="">None</option>
                            <option value="1">L1 - Manager</option>
                            <option value="2">L2 - Senior Manager</option>
                          </select>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleActive(u.id)}
                          disabled={u.id === user?.id}
                          className="flex items-center space-x-1 px-2.5 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] text-[10px] font-bold transition-all disabled:opacity-30 ml-auto"
                        >
                          {u.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          <span>{u.isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-sm text-[#6b7280]">No users match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-[#6b7280]">
            <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-2.5 py-1 rounded-[4px] font-bold transition-all ${
                    page === p ? 'bg-[#714B67] text-white' : 'border border-[#e5e5e5] hover:bg-[#f8f9fa]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
