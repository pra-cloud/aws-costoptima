import React from 'react';
import { Server, HardDrive, Network, Database, Layers, ArrowUpRight } from 'lucide-react';

const CATEGORY_ICONS = {
  'EC2 Compute': Server,
  'EBS Storage': HardDrive,
  'Networking': Network,
  'RDS Database': Database,
  'S3 Storage': Layers,
};

export default function SavingsBreakdown({ categories = {}, totalSavings = 1 }) {
  const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Monthly Savings by Category</h3>
          <p className="text-xs text-slate-400 mt-0.5">Where your cloud budget is leaking the most</p>
        </div>
        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
          <span>Live Telemetry</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </span>
      </div>

      <div className="space-y-4">
        {entries.map(([category, amount]) => {
          const Icon = CATEGORY_ICONS[category] || Layers;
          const percentage = totalSavings > 0 ? Math.round((amount / totalSavings) * 100) : 0;

          return (
            <div key={category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-300">
                  <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">{percentage}%</span>
                  <span className="font-bold text-emerald-400 font-mono">${amount.toFixed(2)}/mo</span>
                </div>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
