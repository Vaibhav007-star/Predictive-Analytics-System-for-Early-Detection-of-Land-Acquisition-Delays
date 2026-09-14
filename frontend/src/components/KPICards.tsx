import React from 'react';
import { AlertOctagon, AlertTriangle, Clock, Layers } from 'lucide-react';
import type { RisksSummaryResponse } from '../types';

interface KPICardsProps {
  summary: RisksSummaryResponse;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary }) => {
  const criticalCount = summary.counts_by_risk_category.CRITICAL || 0;
  const criticalPct = summary.percentages_by_risk_category.CRITICAL || 0;
  const highCount = summary.counts_by_risk_category.HIGH || 0;
  const highPct = summary.percentages_by_risk_category.HIGH || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Monitored Projects */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Projects
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {summary.total_projects.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span>Authentic MoSPI Central Sector</span>
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <Layers className="w-6 h-6" />
        </div>
      </div>

      {/* Critical Risk Tier */}
      <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
            Critical Risk (Score 81–100)
          </p>
          <p className="text-2xl font-extrabold text-red-700 mt-1">
            {criticalCount.toLocaleString()}
          </p>
          <p className="text-xs text-red-500 mt-1 font-medium">
            {criticalPct}% of central portfolio
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
          <AlertOctagon className="w-6 h-6" />
        </div>
      </div>

      {/* High Risk Tier */}
      <div className="bg-white rounded-xl p-5 border border-orange-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
            High Risk (Score 61–80)
          </p>
          <p className="text-2xl font-extrabold text-orange-700 mt-1">
            {highCount.toLocaleString()}
          </p>
          <p className="text-xs text-orange-500 mt-1 font-medium">
            {highPct}% priority monitoring
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      {/* Overall Delay Rate */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Reported Timeline Breaches
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {summary.overall_delay_rate_pct}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.delayed_projects_count.toLocaleString()} Delayed / {summary.ontime_projects_count.toLocaleString()} On-Time
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
          <Clock className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

