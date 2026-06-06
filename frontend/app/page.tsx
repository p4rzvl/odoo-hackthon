'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Database, 
  Server, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Users, 
  FileText, 
  CheckSquare, 
  ArrowUpRight,
  TrendingUp,
  Mail
} from 'lucide-react';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  database: {
    status: string;
    error: string | null;
  };
}

export default function Home() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pingCount, setPingCount] = useState<number>(0);

  const checkBackendHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${apiUrl}/health`, {
        cache: 'no-store'
      });
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to communicate with Express API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, [pingCount]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#212529] font-sans flex flex-col justify-between selection:bg-[#714B67]/20">
      
      {/* Premium Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#714B67] flex items-center justify-center font-bold text-xl text-white shadow-md shadow-[#714B67]/25">
              V
            </div>
            <span className="text-xl font-bold tracking-tight text-[#212529]">VendorBridge</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#6b7280]">
            <a href="#features" className="hover:text-[#714B67] transition-colors">Key Features</a>
            <a href="#workflow" className="hover:text-[#714B67] transition-colors">How It Works</a>
            <a href="#health-check" className="hover:text-[#714B67] transition-colors flex items-center gap-1.5">
              System Health
              <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-sm font-bold text-[#6b7280] hover:text-[#714B67] px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-sm shadow-[#714B67]/20 flex items-center gap-1"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-gradient-to-b from-[#714B67]/5 via-white to-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#714B67]/10 text-[#714B67] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              ✨ Enterprise-Grade Procurement ERP
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-[#212529]">
              Connect procurement, <br />
              <span className="text-[#714B67]">automate bidding</span>.
            </h2>
            <p className="text-base md:text-lg text-[#6b7280] max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              VendorBridge is a centralized, role-based vendor management platform that streamlines your full procurement cycle from RFQ creation to sequential approvals, GST invoicing, and audit tracking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md shadow-[#714B67]/20 flex items-center justify-center gap-2 text-base"
              >
                Create Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto bg-white border border-[#e5e5e5] hover:border-[#714B67] text-[#212529] hover:text-[#714B67] font-bold px-7 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
              >
                Access Platform
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Hero Visual Mockup Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-md bg-white border border-[#e5e5e5] rounded-2xl shadow-xl overflow-hidden p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4">
                <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">Active Procurement Status</span>
                <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  L2 Finance Approved
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-[#6b7280]">Document Number:</span>
                  <span className="font-mono text-[#714B67]">PO-2026-0042</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-[#6b7280]">Vendor Partner:</span>
                  <span className="text-[#212529]">Global Tech Solutions</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-[#6b7280]">GST Calculation:</span>
                  <span className="text-emerald-600">18% GST (9% CGST + 9% SGST)</span>
                </div>
              </div>
              <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-xl p-3 text-center space-y-1.5">
                <p className="text-xs text-[#6b7280] font-semibold">Audit Logs Immutability</p>
                <div className="flex items-center justify-center gap-1 text-[#714B67] font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Write-Once DB Triggers Enabled
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-24 bg-white border-t border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[#212529]">
              Everything you need for an auditable procurement lifecycle
            </h3>
            <p className="text-[#6b7280] font-medium">
              Say goodbye to fragmented email threads, spreadsheets, and unauthorized spend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-2xl p-6 hover:border-[#714B67] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-[#212529]">Centralized Vendor Directory</h4>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Seamless registrations with verified credentials, classifications, status approvals (Active/Blocked), and detailed vendor analytics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-2xl p-6 hover:border-[#714B67] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-[#212529]">Dynamic RFQs & Bidding</h4>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Create structured RFQs with dynamic line items. Let vendors submit detailed quotations directly inside their portal dashboards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-2xl p-6 hover:border-[#714B67] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-[#212529]">Side-by-Side Comparison</h4>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Compare bids, timelines, and ratings instantly. The system automatically highlights the lowest quotation in green for fast evaluation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-2xl p-6 hover:border-[#714B67] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-[#212529]">L1 & L2 Approval Chain</h4>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Automate double-signature workflows. Purchase requests flow through Procurement Head (L1) and Finance Manager (L2) approvals.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-2xl p-6 hover:border-[#714B67] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-[#212529]">Immutable Audit Trail</h4>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                All lifecycle updates are permanently logged. DB triggers block editing or deleting logs, guaranteeing total transparency.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#f8f9fa] border border-[#e5e5e5] rounded-2xl p-6 hover:border-[#714B67] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-[#212529]">GST & Email dispatch</h4>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Split GST (9% CGST & 9% SGST) automatically. Save, print, or email PDF invoices directly to vendors using Resend templates.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Workflow Section */}
      <section id="workflow" className="py-24 bg-gradient-to-b from-[#f8f9fa] to-white border-t border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl font-bold tracking-tight text-[#212529]">The Bidding & Approval Journey</h3>
            <p className="text-sm text-[#6b7280] font-semibold uppercase tracking-wider">Five Simple Steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-[#e5e5e5] z-0"></div>
            
            {[
              { num: '01', title: 'Publish RFQ', desc: 'Officers write line items and assign active vendors.' },
              { num: '02', title: 'Submit Bids', desc: 'Invited vendors log in and fill pricing/deadlines.' },
              { num: '03', title: 'Compare Prices', desc: 'Officer reviews comparison, selecting the optimal bid.' },
              { num: '04', title: 'Approve Sequence', desc: 'L1 & L2 sign off, auto-triggering unique PO creation.' },
              { num: '05', title: 'Issue Invoice', desc: 'Officers generate GST-compliant invoices and email vendors.' }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-3 px-4">
                <div className="w-14 h-14 rounded-full bg-white border border-[#e5e5e5] text-[#714B67] font-extrabold flex items-center justify-center shadow-sm text-lg">
                  {step.num}
                </div>
                <h5 className="font-bold text-[#212529]">{step.title}</h5>
                <p className="text-xs text-[#6b7280] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backend Integration / Diagnostics Health widget */}
      <section id="health-check" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#714B67] p-5 text-white flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg">Platform Diagnostics</h4>
                <p className="text-xs text-purple-200 mt-0.5">Real-time express API & Database connectivity verification</p>
              </div>
              <button
                onClick={() => setPingCount(prev => prev + 1)}
                disabled={loading}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all disabled:opacity-50"
                title="Refresh Status"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-[#212529]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Express API server card */}
                <div className="flex items-center justify-between p-3.5 bg-[#f8f9fa] border border-[#e5e5e5] rounded-xl">
                  <div className="flex items-center space-x-2.5">
                    <Server className="w-4 h-4 text-[#714B67]" />
                    <span className="text-xs font-bold">API Services</span>
                  </div>
                  {loading ? (
                    <span className="text-[10px] text-[#8f8f8f]">Pinging...</span>
                  ) : error ? (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Offline</span>
                  ) : (
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Online</span>
                  )}
                </div>

                {/* Database server card */}
                <div className="flex items-center justify-between p-3.5 bg-[#f8f9fa] border border-[#e5e5e5] rounded-xl">
                  <div className="flex items-center space-x-2.5">
                    <Database className="w-4 h-4 text-[#714B67]" />
                    <span className="text-xs font-bold">Postgres DB</span>
                  </div>
                  {loading ? (
                    <span className="text-[10px] text-[#8f8f8f]">Checking...</span>
                  ) : error ? (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Unknown</span>
                  ) : data?.database.status === 'connected' ? (
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Connected</span>
                  ) : (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Disconnected</span>
                  )}
                </div>
              </div>

              {/* Console preview */}
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[10px] space-y-1 shadow-inner">
                <p className="text-slate-400">// Diagnostic Logs</p>
                {loading ? (
                  <p className="text-slate-400">Loading live health telemetry...</p>
                ) : error ? (
                  <p className="text-red-400">Communication Error: {error}</p>
                ) : (
                  <>
                    <p>Response: status 200 OK</p>
                    <p>Active Uptime: {data?.uptime.toFixed(2)}s</p>
                    <p>UTC Timestamp: {data?.timestamp}</p>
                    <p>Database Status: {data?.database.status.toUpperCase()}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-[#e5e5e5] bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-[#714B67] flex items-center justify-center font-bold text-sm text-white">
              V
            </div>
            <span className="text-sm font-bold text-[#212529]">VendorBridge ERP</span>
          </div>
          
          <p className="text-xs text-[#6b7280]">
            &copy; {new Date().getFullYear()} VendorBridge. All rights reserved. Odoo Inspired Design System.
          </p>
        </div>
      </footer>

    </div>
  );
}
