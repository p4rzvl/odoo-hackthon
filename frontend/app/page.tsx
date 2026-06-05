'use client';

import { useState, useEffect } from 'react';
import { Activity, Database, Server, RefreshCw } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
        {/* Header (Odoo Purple highlight style) */}
        <div className="bg-[#714B67] p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Odoo Hackathon Integration Test</h1>
            <p className="text-xs text-purple-200 mt-1">Express API + Next.js Connection Status</p>
          </div>
          <button
            onClick={() => setPingCount(prev => prev + 1)}
            disabled={loading}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all disabled:opacity-50"
            title="Refresh Status"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Connection details panel */}
        <div className="p-6 space-y-6">
          {/* Express API Server Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-md">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Express API Server</p>
                <p className="text-xs text-slate-500">
                  Target: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/health
                </p>
              </div>
            </div>
            {loading ? (
              <span className="text-xs text-slate-400">Pinging...</span>
            ) : error ? (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">Offline</span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Online</span>
            )}
          </div>

          {/* PostgreSQL Database Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-md">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">PostgreSQL Database (Neon)</p>
                <p className="text-xs text-slate-500">
                  Connectivity check via Prisma 7 Client
                </p>
              </div>
            </div>
            {loading ? (
              <span className="text-xs text-slate-400">Checking...</span>
            ) : error ? (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">Unknown</span>
            ) : data?.database.status === 'connected' ? (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Connected</span>
            ) : (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">Disconnected</span>
            )}
          </div>

          {/* Diagnostic Console */}
          <div className="bg-slate-950 text-slate-200 p-4 rounded-md font-mono text-xs overflow-x-auto shadow-inner space-y-1">
            <p className="text-slate-400">// System logs & response schema</p>
            {loading ? (
              <p className="text-slate-400">Loading diagnostics...</p>
            ) : error ? (
              <p className="text-red-400">Error: {error}</p>
            ) : (
              <>
                <p>Status Code: 200 OK</p>
                <p>Uptime: {data?.uptime.toFixed(2)}s</p>
                <p>Timestamp: {data?.timestamp}</p>
                <p>Database Status: {data?.database.status.toUpperCase()}</p>
                {data?.database.error && <p className="text-red-400">Database Error: {data.database.error}</p>}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-xs text-slate-400">
          Odoo inspired style guide matching core guidelines.
        </div>
      </div>
    </div>
  );
}
