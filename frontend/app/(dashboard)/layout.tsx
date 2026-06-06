'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
          <p className="text-sm text-[#212529] font-semibold">Verifying Secure Odoo Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-[#212529] overflow-hidden h-screen w-screen">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Top Header Panel */}
        <Topbar />

        {/* Dynamic page context */}
        <main className="flex-1 overflow-y-auto bg-[#f8f9fa] p-8">
          <div className="max-w-[1200px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
