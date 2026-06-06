'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('ADMIN' | 'MANAGER' | 'OFFICER' | 'VENDOR')[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const hasPermission = allowedRoles.includes(user.role as any);
      if (!hasPermission) {
        toast.error('Access Denied: You do not have permission to view this page.');
        router.push('/dashboard');
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
          <p className="text-sm text-[#6b7280]">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (user && allowedRoles.includes(user.role as any)) {
    return <>{children}</>;
  }

  return null;
}
