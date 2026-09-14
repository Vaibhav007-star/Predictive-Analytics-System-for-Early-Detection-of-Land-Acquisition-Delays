import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { RisksSummaryResponse } from '../types';

interface RiskDistributionChartProps {
  summary: RisksSummaryResponse;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ summary }) => {
  const counts = summary.counts_by_risk_category;
  const pcts = summary.percentages_by_risk_category;

  const tiers = [
    {
      key: 'CRITICAL',
      label: 'Critical Risk',
      range: 'Score 81–100',
      count: counts.CRITICAL || 0,
      pct: pcts.CRITICAL || 0,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: <AlertOctagon className="w-5 h-5 text-red-600" />,
      action: 'Urgent Taskforce: Convene inter-ministerial coordination to resolve severe statutory & RoW bottlenecks.'
    },
    {
      key: 'HIGH',
      label: 'High Risk',
      range: 'Score 61–80',
      count: counts.HIGH || 0,
      pct: pcts.HIGH || 0,
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      action: 'Priority Intervention: Schedule joint state revenue review with Competent Authority (CALA).'
    },
    {
      key: 'MEDIUM',
      label: 'Medium Risk',
      range: 'Score 31–60',
      count: counts.MEDIUM || 0,
      pct: pcts.MEDIUM || 0,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
      action: 'Heightened Surveillance: Monitor monthly survey and preliminary Section 11 gazette milestones.'
    },
    {
      key: 'LOW',
      label: 'Low Risk',
      range: 'Score 0–30',
      count: counts.LOW || 0,
      pct: pcts.LOW || 0,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      action: 'Routine Governance: Execution proceeding within standard operational and clearance tolerances.'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Portfolio Risk Profile & Tier Distribution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrated probabilistic model output mapped to 4 operational governance tiers (Gradient Boosting v1.0)
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 self-start sm:self-auto">
          N = {summary.total_projects.toLocaleString()} Authentic Assets
        </span>
      </div>

      {/* Stacked Proportional Bar */}
      <div className="mt-5 mb-6">
        <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
          <div style={{ width: `${pcts.CRITICAL || 0}%` }} className="bg-red-500 h-full transition-all" title={`Critical: ${pcts.CRITICAL}%`} />
          <div style={{ width: `${pcts.HIGH || 0}%` }} className="bg-orange-500 h-full transition-all" title={`High: ${pcts.HIGH}%`} />
          <div style={{ width: `${pcts.MEDIUM || 0}%` }} className="bg-amber-400 h-full transition-all" title={`Medium: ${pcts.MEDIUM}%`} />
          <div style={{ width: `${pcts.LOW || 0}%` }} className="bg-emerald-500 h-full transition-all" title={`Low: ${pcts.LOW}%`} />
        </div>
      </div>

      {/* Grid of 4 Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {tiers.map((t) => (
          <div
            key={t.key}
            className={`rounded-lg p-4 border ${t.borderColor} ${t.bgColor} flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {t.icon}
                  <span className={`text-sm font-bold ${t.textColor}`}>
                    {t.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-medium text-slate-500">
                  {t.range}
                </span>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900">
                  {t.count.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  ({t.pct}%)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/60 leading-relaxed">
              {t.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

