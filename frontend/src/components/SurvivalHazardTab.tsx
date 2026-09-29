import React, { useState, useEffect } from 'react';
import type { SurvivalResponse, ProjectDetail } from '../types';
import { fetchProjectSurvival } from '../api';
import { Clock, TrendingUp, AlertTriangle, Calendar, Activity, RefreshCw } from 'lucide-react';

interface SurvivalHazardTabProps {
  project: ProjectDetail;
}

export const SurvivalHazardTab: React.FC<SurvivalHazardTabProps> = ({ project }) => {
  const [survival, setSurvival] = useState<SurvivalResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProjectSurvival(project.project_code);
        setSurvival(data);
      } catch (err: any) {
        setError(err.message || 'Failed to calculate survival hazard curve');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [project.project_code]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
        <span className="text-xs">Computing Continuous Weibull Survival Distribution S(t)...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!survival) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner: Weibull Mathematical Parameters & Peak Danger Window */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Peak Danger Window */}
        <div className="p-4 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 text-white rounded-xl border border-amber-500/30 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              Critical Gestation Window
            </span>
          </div>

          <div className="pt-1">
            <span className="text-2xl font-black text-white block">
              {survival.peak_danger_window.window}
            </span>
            <span className="text-xs text-amber-300 font-semibold block mt-0.5">
              Peak Danger Month: Month {survival.peak_danger_window.peak_month} ({survival.peak_danger_window.statutory_milestone})
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
            {survival.peak_danger_window.description}
          </p>
        </div>

        {/* Weibull Model Parameters */}
        <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
              Weibull Distribution Parameters S(t) = exp(-(t/λ)^k)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Shape Parameter (k)</span>
              <span className="text-xl font-black text-indigo-300 mt-0.5 block">
                {survival.weibull_parameters.shape_k}
              </span>
              <span className="text-[10px] text-slate-400">Aging hazard rate (k &gt; 1)</span>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Scale Parameter (λ)</span>
              <span className="text-xl font-black text-indigo-300 mt-0.5 block">
                {survival.weibull_parameters.scale_lambda_months} mo
              </span>
              <span className="text-[10px] text-slate-400">Characteristic gestation</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>Expected Overrun: <strong className="text-white">{survival.forecasting.expected_overrun_months} Months</strong></span>
            <span>80% Range: <strong className="text-white">{survival.forecasting.projected_dates.confidence_range_80}</strong></span>
          </div>
        </div>
      </div>

      {/* Completion Timeline Forecasting Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Original Target</span>
          </span>
          <span className="text-base font-bold text-slate-900 block mt-0.5">
            {survival.forecasting.projected_dates.original_target}
          </span>
          <span className="text-[10px] text-slate-500">Sanctioned schedule</span>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl shadow-xs text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Weibull Forecast</span>
          </span>
          <span className="text-base font-black text-amber-950 block mt-0.5">
            {survival.forecasting.projected_dates.expected_completion}
          </span>
          <span className="text-[10px] text-amber-700">+{survival.forecasting.expected_overrun_months} months expected delay</span>
        </div>

        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl shadow-xs text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-indigo-800 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>95% Confidence Upper Bound</span>
          </span>
          <span className="text-base font-black text-indigo-950 block mt-0.5">
            +{survival.forecasting.confidence_interval_95_months[1]} Months
          </span>
          <span className="text-[10px] text-indigo-700">Tail-risk ceiling</span>
        </div>
      </div>

      {/* Discrete Hazard Curve Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Monthly Survival Function S(t) & Hazard Dynamics Table
          </h4>
          <span className="text-[10px] font-mono text-slate-500">Gestation Months 1 to 60</span>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Gestation Month</th>
                <th className="py-2.5 px-3">Survival Prob S(t)</th>
                <th className="py-2.5 px-3">Cumulative Delay Risk</th>
                <th className="py-2.5 px-3">Monthly Hazard Rate h(t)</th>
                <th className="py-2.5 px-3">Cumulative Hazard H(t)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {survival.hazard_curve.map((row) => (
                <tr
                  key={row.month}
                  className={`hover:bg-slate-50 transition-colors ${
                    row.month === survival.peak_danger_window.peak_month
                      ? 'bg-amber-100/50 font-bold'
                      : ''
                  }`}
                >
                  <td className="py-2 px-3 text-slate-900">
                    Month {row.month}
                    {row.month === survival.peak_danger_window.peak_month && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-sans font-bold">
                        PEAK
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-emerald-700">
                    {(row.survival_probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 px-3 text-rose-700">
                    {(row.delay_probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 px-3 text-indigo-700">
                    {row.monthly_hazard_rate}% / mo
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {row.cumulative_hazard.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
