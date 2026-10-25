import React, { useState } from 'react';
import { Terminal, ShieldAlert, CheckCircle2, ChevronRight, Copy, Check, Filter } from 'lucide-react';

export default function WasteTable({ findings = [], onRemediateClick }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const categories = ['ALL', ...new Set(findings.map(f => f.category))];

  const filtered = filterCategory === 'ALL'
    ? findings
    : findings.filter(f => f.category === filterCategory);

  const handleCopyCli = (id, command, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Safe':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">100% Safe</span>;
      case 'Zero Downtime':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">Zero Downtime</span>;
      case 'Low Risk':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Low Risk</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Plan Maintenance</span>;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="w-2 h-2 rounded-full bg-rose-500" title="Critical waste" />;
      case 'high':
        return <span className="w-2 h-2 rounded-full bg-amber-500" title="High waste" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-sky-500" title="Medium waste" />;
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
      {/* Table Header & Category Filters */}
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Detected Cloud Waste & Cost Leaks</h3>
          <p className="text-xs text-slate-400 mt-0.5">Click any row to inspect the AI remediation plan and CLI command</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table List */}
      <div className="divide-y divide-slate-800/80">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No waste items match this filter.
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => onRemediateClick(item)}
              className="p-5 hover:bg-slate-800/40 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-1">
                  {getSeverityBadge(item.severity)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                      {item.title}
                    </span>
                    {getRiskBadge(item.risk)}
                    <span className="text-[11px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {item.resource_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Savings and CTA */}
              <div className="flex items-center justify-between md:justify-end gap-5 pl-7 md:pl-0">
                <div className="text-left md:text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    +${item.potential_monthly_savings.toFixed(2)}/mo
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Was ${item.current_monthly_cost.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopyCli(item.id, item.cli_command, e)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
                    title="Copy AWS CLI remediation command"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onRemediateClick(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition border border-emerald-500/20"
                  >
                    Remediate
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
