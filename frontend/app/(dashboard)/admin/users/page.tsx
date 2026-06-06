'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import RoleGuard from '../../../../components/RoleGuard';
import StatusBadge from '../../../../components/StatusBadge';
import { Loader2, Shield, UserCheck, UserX, RefreshCw } from 'lucide-react';
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
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
                  {users.map((u, i) => (
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
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
