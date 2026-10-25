import React from 'react';
import { Cloud, Zap, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react';

export default function Header({ accountId, region, onConnectClick, onRefreshClick, isScanning }) {
  return (
    <header className="border-b border-slate-850 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Cloud className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">CloudOptima</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI FinOps
              </span>
            </div>
            <p className="text-[11px] text-slate-400">AWS Cloud Cost & Waste Reducer</p>
          </div>
        </div>

        {/* Account Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500">Account:</span>
            <span className="font-mono text-slate-200">{accountId || 'Demo Account'}</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 font-mono">{region || 'us-east-1'}</span>
          </div>

          <button
            onClick={onRefreshClick}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-xs font-medium text-slate-200 transition disabled:opacity-50"
            title="Rescan AWS account"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">{isScanning ? 'Scanning...' : 'Rescan'}</span>
          </button>

          <button
            onClick={onConnectClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition transform active:scale-95"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Connect AWS Account
          </button>
        </div>
      </div>
    </header>
  );
}
