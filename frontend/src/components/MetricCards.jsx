import React from 'react';
import { DollarSign, TrendingDown, Sparkles, Gauge, ArrowDownRight } from 'lucide-react';

export default function MetricCards({ data }) {
  const currentSpend = data?.monthly_current_spend || 0;
  const optimizedSpend = data?.monthly_optimized_spend || 0;
  const monthlySavings = data?.total_monthly_savings || 0;
  const annualSavings = data?.total_annual_savings || 0;
  const savingsPct = data?.savings_percentage || 0;
  const efficiencyScore = Math.max(10, Math.min(100, Math.round(100 - savingsPct * 1.4)));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Monthly Savings */}
      <div className="relative rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900/90 border border-emerald-500/30 p-5 shadow-xl shadow-emerald-950/20 overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingDown className="w-24 h-24 text-emerald-400" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Identified Waste Savings
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300">
            <ArrowDownRight className="w-3 h-3" />
            {savingsPct}% Cut
          </span>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            ${monthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-medium text-slate-400 ml-1">/month</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Annual projection: <span className="text-emerald-400 font-semibold">${annualSavings.toLocaleString()} /year</span>
          </p>
        </div>
      </div>

      {/* Current vs Optimized Spend */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current Monthly AWS Spend
          </span>
          <DollarSign className="w-4 h-4 text-slate-500" />
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold text-slate-200 tracking-tight">
            ${currentSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Optimized target: <span className="text-white font-semibold">${optimizedSpend.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Cloud Efficiency Score */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cloud Efficiency Score
          </span>
          <Gauge className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {efficiencyScore}<span className="text-lg text-slate-500 font-medium">/100</span>
          </div>
          <span className={`text-xs font-semibold ${efficiencyScore >= 80 ? 'text-emerald-400' : efficiencyScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
            {efficiencyScore >= 80 ? 'Good' : efficiencyScore >= 60 ? 'Needs Optimization' : 'Severe Waste'}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${efficiencyScore >= 80 ? 'bg-emerald-500' : efficiencyScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
            style={{ width: `${efficiencyScore}%` }}
          ></div>
        </div>
      </div>

      {/* Active Waste Opportunities */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Waste Anomaly Alerts
          </span>
          <Sparkles className="w-4 h-4 text-teal-400" />
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {data?.findings_count || 0}
            <span className="text-xs font-medium text-slate-400 ml-1.5">Actionable items</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            EC2, EBS, RDS, S3 & EIP leaks
          </p>
        </div>
      </div>
    </div>
  );
}
