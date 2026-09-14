import React from 'react';
import type { ProjectSummary } from '../types';
import { AlertOctagon, Sparkles } from 'lucide-react';

interface PriorityQueueTableProps {
  projects: ProjectSummary[];
  onSelectProject: (projectCode: string) => void;
}

export const PriorityQueueTable: React.FC<PriorityQueueTableProps> = ({
  projects,
  onSelectProject
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-red-600" />
          <h2 className="text-base font-bold text-slate-900">
            Priority Intervention Queue (Critical & High Risk Assets)
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Ranked by Predictive Risk Score Descending
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">Risk Tier</th>
              <th className="px-4 py-3">Project Code</th>
              <th className="px-4 py-3">Project Title</th>
              <th className="px-4 py-3">Agency & Sector</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3 text-right">Cost (₹ Cr)</th>
              <th className="px-4 py-3 text-right">Reported Delay</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {projects.map((p) => {
              const isCritical = p.risk_category === 'CRITICAL';
              return (
                <tr
                  key={p.project_code}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        isCritical
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-orange-100 text-orange-800 border border-orange-200'
                      }`}
                    >
                      {p.risk_score}/100 • {p.risk_category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {p.project_code}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-900 font-medium" title={p.project_name}>
                    {p.project_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{p.agency}</span>
                    <span className="block text-xs text-slate-500">{p.sector}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap font-medium">
                    {p.state}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900 font-bold whitespace-nowrap">
                    ₹{p.orig_cost_cr.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {p.delay_months !== null && p.delay_months !== undefined ? (
                      <span className={p.delay_months > 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-semibold'}>
                        {p.delay_months > 0 ? `+${p.delay_months} mos` : 'On-Time'}
                      </span>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onSelectProject(p.project_code)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>XAI Insights</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
