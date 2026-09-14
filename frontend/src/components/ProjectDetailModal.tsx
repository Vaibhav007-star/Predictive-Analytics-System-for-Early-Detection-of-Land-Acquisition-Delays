import React, { useEffect, useState } from 'react';
import type { ProjectDetail, ExplanationResponse } from '../types';
import { fetchProjectDetail, fetchProjectExplanation } from '../api';
import { X, Sparkles, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface ProjectDetailModalProps {
  projectCode: string | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  projectCode,
  onClose
}) => {
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectCode) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [detRes, expRes] = await Promise.all([
          fetchProjectDetail(projectCode),
          fetchProjectExplanation(projectCode)
        ]);
        setDetail(detRes);
        setExplanation(expRes);
      } catch (err: any) {
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectCode]);

  if (!projectCode) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                {projectCode}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {detail?.agency} • {detail?.sector}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
              {detail?.project_name || 'Loading Project...'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-semibold">Generating SHAP explanation & decision support...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
              <p className="font-bold">Error loading project analysis</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          ) : detail ? (
            <>
              {/* Risk Assessment & Recommendation Banner */}
              <div
                className="rounded-xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                style={{
                  backgroundColor: `${detail.badge_color}10`,
                  borderColor: `${detail.badge_color}40`
                }}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase text-white shadow-sm"
                      style={{ backgroundColor: detail.badge_color }}
                    >
                      {detail.risk_category} RISK • {detail.risk_score}/100
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      Calculated Delay Probability: {((detail.probability || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Recommended Administrative Action (Decision Support):
                    </p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5 leading-relaxed">
                      {detail.recommended_action || "Review project execution pacing in line ministry review."}
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-slate-200/80 text-right shrink-0">
                  <span className="text-xs text-slate-500 block font-medium">Reported Delay Duration</span>
                  <span className={`text-xl font-extrabold ${detail.delay_months && detail.delay_months > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {detail.delay_months && detail.delay_months > 0 ? `+${detail.delay_months} Months` : 'On-Time'}
                  </span>
                </div>
              </div>

              {/* Baseline Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Sanctioned Cost</span>
                  <span className="text-sm font-bold text-slate-900">₹{detail.orig_cost_cr.toLocaleString()} Cr</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Approval Date</span>
                  <span className="text-sm font-bold text-slate-900">{detail.approval_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Original Target</span>
                  <span className="text-sm font-bold text-slate-900">{detail.orig_commissioning_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Anticipated Commissioning</span>
                  <span className="text-sm font-bold text-slate-900">{detail.ant_commissioning_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Physical Progress</span>
                  <span className="text-sm font-bold text-slate-900">{detail.physical_progress_pct}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Disbursed Outlay</span>
                  <span className="text-sm font-bold text-slate-900">₹{detail.cumulative_exp_cr?.toLocaleString() || 0} Cr</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Jurisdiction (State)</span>
                  <span className="text-sm font-bold text-slate-900">{detail.state}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Geo Precision</span>
                  <span className="text-sm font-bold text-slate-700">{detail.geo_precision}</span>
                </div>
              </div>

              {/* SHAP XAI Risk Drivers */}
              {explanation && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Explainable AI (SHAP) Risk Decomposition
                    </h3>
                  </div>

                  {/* Delay-Elevating Drivers */}
                  <div>
                    <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>Factors Elevating Delay Risk:</span>
                    </h4>
                    <div className="space-y-2">
                      {explanation.top_risk_drivers.map((d, i) => (
                        <div key={i} className="p-3 bg-red-50/70 border border-red-100 rounded-lg flex items-start justify-between gap-3 text-xs">
                          <div>
                            <span className="font-mono font-bold text-red-900 block">{d.feature}</span>
                            <span className="text-slate-700 mt-0.5 block">{d.explanation}</span>
                          </div>
                          <span className="font-mono font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded shrink-0">
                            +{d.shap_value.toFixed(3)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mitigating Factors */}
                  {explanation.top_mitigating_factors.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Favorable Mitigating Factors:</span>
                      </h4>
                      <div className="space-y-2">
                        {explanation.top_mitigating_factors.map((d, i) => (
                          <div key={i} className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-start justify-between gap-3 text-xs">
                            <div>
                              <span className="font-mono font-bold text-emerald-900 block">{d.feature}</span>
                              <span className="text-slate-700 mt-0.5 block">{d.explanation}</span>
                            </div>
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded shrink-0">
                              {d.shap_value.toFixed(3)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer Banner */}
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>{explanation.disclaimer}</span>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
