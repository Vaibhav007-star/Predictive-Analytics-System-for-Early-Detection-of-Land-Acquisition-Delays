import React, { useEffect, useState } from 'react';
import type { ProjectDetail, ExplanationResponse, User, Intervention } from '../types';
import { fetchProjectDetail, fetchProjectExplanation, fetchProjectInterventions, createIntervention } from '../api';
import { WhatIfSimulationTab } from './WhatIfSimulationTab';
import { StatutoryAdvisoryTab } from './StatutoryAdvisoryTab';
import { SurvivalHazardTab } from './SurvivalHazardTab';
import {
  X,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Info,
  CheckCircle2,
  Send,
  Clock,
  User as UserIcon,
  Sliders,
  Scale,
  Activity,
  ClipboardList
} from 'lucide-react';

interface ProjectDetailModalProps {
  projectCode: string | null;
  onClose: () => void;
  user: User | null;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  projectCode,
  onClose,
  user
}) => {
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab inside modal: 'overview' | 'simulation' | 'survival' | 'statutory' | 'interventions'
  const [activeTab, setActiveTab] = useState<'overview' | 'simulation' | 'survival' | 'statutory' | 'interventions'>('overview');

  // Intervention form state
  const [intType, setIntType] = useState<string>('SLAO Field Deployment & Joint Verification');
  const [intNotes, setIntNotes] = useState<string>('');
  const [submittingInt, setSubmittingInt] = useState<boolean>(false);
  const [intSuccess, setIntSuccess] = useState<string | null>(null);
  const [intError, setIntError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectCode) return;
    setActiveTab('overview');

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIntSuccess(null);
        setIntError(null);
        const [detRes, expRes, intRes] = await Promise.all([
          fetchProjectDetail(projectCode),
          fetchProjectExplanation(projectCode),
          fetchProjectInterventions(projectCode).catch(() => [] as Intervention[])
        ]);
        setDetail(detRes);
        setExplanation(expRes);
        setInterventions(intRes);
      } catch (err: any) {
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectCode]);

  const handleRecordIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectCode || !intNotes.trim()) return;
    setSubmittingInt(true);
    setIntError(null);
    setIntSuccess(null);
    try {
      const created = await createIntervention(projectCode, intType, intNotes.trim());
      setInterventions([created, ...interventions]);
      setIntNotes('');
      setIntSuccess('Intervention logged successfully in MoRD compliance audit trail.');
      setTimeout(() => setIntSuccess(null), 5000);
    } catch (err: any) {
      setIntError(err.message || 'Failed to record intervention');
    } finally {
      setSubmittingInt(false);
    }
  };

  if (!projectCode) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
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

        {/* Sub-Navigation Tabs */}
        {detail && (
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Overview & SHAP</span>
            </button>

            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'simulation'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('survival')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'survival'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Survival Hazard Curve</span>
            </button>

            <button
              onClick={() => setActiveTab('statutory')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'statutory'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>RFCTLARR 2013 Advisory</span>
            </button>

            <button
              onClick={() => setActiveTab('interventions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'interventions'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
              <span>Interventions ({interventions.length})</span>
            </button>
          </div>
        )}

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
              {/* TAB 1: OVERVIEW & SHAP */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
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

                  {/* Feature Shortcuts */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveTab('simulation')}
                      className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2">
                        <Sliders className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-indigo-950 block">What-If Sandbox</span>
                          <span className="text-[10px] text-indigo-700">Simulate package splits</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('survival')}
                      className="p-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-cyan-700 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-cyan-950 block">Hazard Curve</span>
                          <span className="text-[10px] text-cyan-800">Weibull delay pacing</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-cyan-700 group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('statutory')}
                      className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2">
                        <Scale className="w-4 h-4 text-amber-700 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-amber-950 block">RFCTLARR 2013</span>
                          <span className="text-[10px] text-amber-800">Section 25 notice draft</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
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
                </div>
              )}

              {/* TAB 2: WHAT-IF MITIGATION SANDBOX */}
              {activeTab === 'simulation' && (
                <WhatIfSimulationTab project={detail} />
              )}

              {/* TAB 3: SURVIVAL HAZARD ANALYSIS */}
              {activeTab === 'survival' && (
                <SurvivalHazardTab project={detail} />
              )}

              {/* TAB 4: RFCTLARR STATUTORY ADVISORY */}
              {activeTab === 'statutory' && (
                <StatutoryAdvisoryTab project={detail} user={user} />
              )}

              {/* TAB 5: INTERVENTIONS */}
              {activeTab === 'interventions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <span>Administrative Interventions & Executive Actions</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                          {interventions.length} Recorded
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Track official SLAO deployments, joint surveys, and Section 19 R&R authorizations
                      </p>
                    </div>
                  </div>

                  {interventions.length > 0 ? (
                    <div className="space-y-2.5 mb-4">
                      {interventions.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="font-semibold text-slate-900 bg-amber-100/80 text-amber-900 border border-amber-300/60 px-2 py-0.5 rounded text-[11px]">
                              {item.intervention_type}
                            </span>
                            <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                              <span className="flex items-center space-x-1">
                                <UserIcon className="w-3 h-3 text-slate-400" />
                                <span className="font-medium text-slate-700">{item.username}</span>
                                <span>({item.role})</span>
                              </span>
                              <span className="flex items-center space-x-1 font-mono">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{new Date(item.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                              </span>
                            </div>
                          </div>
                          <p className="text-slate-700 pt-1 leading-relaxed">
                            {item.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500 mb-4">
                      No official interventions recorded yet for this project.
                    </div>
                  )}

                  {user?.role === 'Admin' ? (
                    <form onSubmit={handleRecordIntervention} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center space-x-1.5">
                          <Send className="w-3.5 h-3.5 text-amber-600" />
                          <span>Record Administrative Intervention (Admin)</span>
                        </span>
                        <span className="text-[10px] text-amber-800 font-medium">Logged to Audit Trail</span>
                      </div>

                      {intSuccess && (
                        <div className="p-2.5 bg-emerald-100/90 border border-emerald-300 text-emerald-800 rounded-md text-xs flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{intSuccess}</span>
                        </div>
                      )}

                      {intError && (
                        <div className="p-2.5 bg-rose-100/90 border border-rose-300 text-rose-800 rounded-md text-xs flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{intError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Action Category
                          </label>
                          <select
                            value={intType}
                            onChange={(e) => setIntType(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="SLAO Field Deployment & Joint Verification">SLAO Field Deployment & Joint Verification</option>
                            <option value="Section 19 R&R Entitlement Package Approval">Section 19 R&R Entitlement Package Approval</option>
                            <option value="Direct Encumbrance-Free RoW Handover Protocol">Direct Encumbrance-Free RoW Handover Protocol</option>
                            <option value="District Collector Central Sector Review (CSPCC)">District Collector Central Sector Review (CSPCC)</option>
                            <option value="Inter-Departmental Utility Relocation Order">Inter-Departmental Utility Relocation Order</option>
                            <option value="Special Land Tribunal Dispute Fast-Tracking">Special Land Tribunal Dispute Fast-Tracking</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">
                            Operational Directive & Minutes
                          </label>
                          <textarea
                            value={intNotes}
                            onChange={(e) => setIntNotes(e.target.value)}
                            rows={2}
                            placeholder="e.g., Instructed District Collector and NHAI Regional Officer to finalize pending award disbursement for 18.4 km stretch by 30th of month."
                            className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingInt || !intNotes.trim()}
                          className="flex items-center space-x-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submittingInt ? 'Recording...' : 'Submit Official Intervention'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
                      <span>Viewing mode (Auditor clearance). Intervention logging requires MoRD Administrative credentials.</span>
                      <span className="font-semibold text-[11px] text-slate-500">Read-Only</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

