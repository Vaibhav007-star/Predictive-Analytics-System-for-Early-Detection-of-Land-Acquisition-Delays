import React, { useState, useEffect } from 'react';
import type { ProjectSummary, SimulationRequest, SimulationResponse, CustomProjectSimulationRequest } from '../types';
import { fetchProjects, simulateProject, simulateCustomProject } from '../api';
import { Sliders, ArrowRight, TrendingDown, Clock, ShieldCheck, RotateCcw, AlertTriangle, Layers, Building2 } from 'lucide-react';

const TOP_SECTORS = [
  'ROAD TRANSPORT AND HIGHWAYS',
  'POWER',
  'RAILWAYS',
  'URBAN DEVELOPMENT',
  'PETROLEUM',
  'COAL',
  'WATER RESOURCES',
  'CIVIL AVIATION'
];

const MAJOR_STATES = [
  'MAHARASHTRA',
  'UTTAR PRADESH',
  'BIHAR',
  'GUJARAT',
  'TAMIL NADU',
  'KARNATAKA',
  'WEST BENGAL',
  'MADHYA PRADESH',
  'RAJASTHAN',
  'ODISHA',
  'ANDHRA PRADESH',
  'TELANGANA',
  'ASSAM',
  'KERALA',
  'HARYANA',
  'PUNJAB',
  'JHARKHAND',
  'CHHATTISGARH',
  'MULTI STATE'
];

export const PolicySandboxView: React.FC = () => {
  const [mode, setMode] = useState<'existing' | 'custom'>('existing');

  // Existing Project Selection
  const [projectList, setProjectList] = useState<ProjectSummary[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);

  // Custom Project Inputs
  const [customSector, setCustomSector] = useState<string>('ROAD TRANSPORT AND HIGHWAYS');
  const [customState, setCustomState] = useState<string>('MAHARASHTRA');
  const [customAgency, setCustomAgency] = useState<string>('NHAI');
  const [customCost, setCustomCost] = useState<number>(1800);
  const [customDuration, setCustomDuration] = useState<number>(36);

  // Policy Levers
  const [levers, setLevers] = useState<SimulationRequest>({
    package_split_count: 2,
    contingency_budget_pct: 10,
    dedicated_slao_taskforce: true,
    parallel_statutory_hearings: true,
    row_pre_possession_pct: 85,
    execution_buffer_months: 6
  });

  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoadingProjects(true);
        const res = await fetchProjects(1, 30, undefined, undefined, 'CRITICAL');
        setProjectList(res.projects);
        if (res.projects.length > 0) {
          setSelectedCode(res.projects[0].project_code);
        }
      } catch (err: any) {
        console.error('Error fetching project catalog for sandbox:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    loadCatalog();
  }, []);

  const runSimulation = async (updatedLevers: SimulationRequest, currentMode = mode, code = selectedCode) => {
    try {
      setSimulating(true);
      setError(null);

      if (currentMode === 'existing') {
        if (!code) return;
        const res = await simulateProject(code, updatedLevers);
        setSimulation(res);
      } else {
        const req: CustomProjectSimulationRequest = {
          sector: customSector,
          state: customState,
          agency: customAgency,
          orig_cost_cr: customCost,
          planned_duration_months: customDuration,
          approval_year: 2025,
          simulation_levers: updatedLevers
        };
        const res = await simulateCustomProject(req);
        setSimulation(res);
      }
    } catch (err: any) {
      setError(err.message || 'Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    if (selectedCode && mode === 'existing') {
      runSimulation(levers, 'existing', selectedCode);
    } else if (mode === 'custom') {
      runSimulation(levers, 'custom');
    }
  }, [selectedCode, mode, customSector, customState, customAgency, customCost, customDuration]);

  const updateLever = (field: keyof SimulationRequest, val: any) => {
    const updated = { ...levers, [field]: val };
    setLevers(updated);
    runSimulation(updated);
  };

  const resetLevers = () => {
    const defaultLevers: SimulationRequest = {
      package_split_count: 1,
      contingency_budget_pct: 0,
      dedicated_slao_taskforce: false,
      parallel_statutory_hearings: false,
      row_pre_possession_pct: 50,
      execution_buffer_months: 0
    };
    setLevers(defaultLevers);
    runSimulation(defaultLevers);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Intro */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-900/60 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                <Sliders className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
                Decision Support Laboratory
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              National Policy Sandbox & Digital Twin Engine
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Model and simulate counterfactual administrative interventions, contractual restructuring, and statutory acceleration across ongoing or newly conceptualized central sector infrastructure assets.
            </p>
          </div>

          <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex shrink-0 text-xs">
            <button
              onClick={() => setMode('existing')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'existing'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Audit Ongoing Asset (1,477 MoSPI)</span>
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'custom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Pre-Sanction Proposal (Design New)</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Asset Selection / Setup + Levers (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <span>1. Target Project Specification</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {mode === 'existing' ? 'MoSPI Authentic Catalog' : 'Pre-Sanction Configuration'}
              </span>
            </div>

            {mode === 'existing' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Project from National Priority Queue:
                </label>
                {loadingProjects ? (
                  <div className="text-xs text-slate-400">Loading catalog...</div>
                ) : (
                  <select
                    value={selectedCode}
                    onChange={(e) => setSelectedCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  >
                    {projectList.map((p) => (
                      <option key={p.project_code} value={p.project_code}>
                        [{p.project_code}] {p.project_name.slice(0, 65)}... (₹{p.orig_cost_cr} Cr | {p.state})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sector</label>
                  <select
                    value={customSector}
                    onChange={(e) => setCustomSector(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TOP_SECTORS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Jurisdiction</label>
                  <select
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MAJOR_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sanctioned Cost (₹ Crores)</label>
                  <input
                    type="number"
                    min="50"
                    max="100000"
                    step="50"
                    value={customCost}
                    onChange={(e) => setCustomCost(Math.max(10, parseFloat(e.target.value) || 10))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Planned Timeline (Months)</label>
                  <input
                    type="number"
                    min="6"
                    max="120"
                    step="6"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Math.max(6, parseInt(e.target.value) || 6))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Implementing Agency</label>
                  <input
                    type="text"
                    value={customAgency}
                    onChange={(e) => setCustomAgency(e.target.value)}
                    placeholder="e.g., NHAI, RVNL, NTPC, State PWD"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Interactive Policy Levers Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <span>2. Policy & Operational Levers</span>
                {simulating && <span className="text-[10px] text-indigo-600 font-mono animate-pulse">Simulating...</span>}
              </h3>
              <button
                onClick={resetLevers}
                className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-indigo-600 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Levers</span>
              </button>
            </div>

            {/* Lever 1 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Contract Package Splitting</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {levers.package_split_count} {levers.package_split_count === 1 ? 'Package (Single)' : 'Packages'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={levers.package_split_count}
                onChange={(e) => updateLever('package_split_count', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Single EPC</span>
                <span>2 Lots</span>
                <span>3 Lots</span>
                <span>4 Lots (Phased)</span>
              </div>
            </div>

            {/* Lever 2 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Compensation Escrow Pre-Funding</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  +{levers.contingency_budget_pct}% Outlay
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="2.5"
                value={levers.contingency_budget_pct}
                onChange={(e) => updateLever('contingency_budget_pct', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% Standard</span>
                <span>+10%</span>
                <span>+20%</span>
                <span>+25% High Liquidity</span>
              </div>
            </div>

            {/* Lever 3 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Duration Buffer Extension</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  +{levers.execution_buffer_months} Months
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="18"
                step="3"
                value={levers.execution_buffer_months}
                onChange={(e) => updateLever('execution_buffer_months', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 mo</span>
                <span>+6 mo</span>
                <span>+12 mo</span>
                <span>+18 mo</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                levers.dedicated_slao_taskforce
                  ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}>
                <input
                  type="checkbox"
                  checked={levers.dedicated_slao_taskforce}
                  onChange={(e) => updateLever('dedicated_slao_taskforce', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div>
                  <span className="block font-bold">Dedicated SLAO Taskforce</span>
                  <span className="text-[11px] text-slate-500 block font-normal">
                    Dampens state land administrative friction
                  </span>
                </div>
              </label>

              <label className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                levers.parallel_statutory_hearings
                  ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}>
                <input
                  type="checkbox"
                  checked={levers.parallel_statutory_hearings}
                  onChange={(e) => updateLever('parallel_statutory_hearings', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div>
                  <span className="block font-bold">Parallel Section 11 & 15</span>
                  <span className="text-[11px] text-slate-500 block font-normal">
                    Concurrent survey & objection hearings
                  </span>
                </div>
              </label>

              <label className={`sm:col-span-2 p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                levers.row_pre_possession_pct >= 80
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}>
                <input
                  type="checkbox"
                  checked={levers.row_pre_possession_pct >= 80}
                  onChange={(e) => updateLever('row_pre_possession_pct', e.target.checked ? 85.0 : 50.0)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <div>
                  <span className="block font-bold">80% Contiguous Right-of-Way (RoW) Handover Guarantee</span>
                  <span className="text-[11px] text-slate-500 block font-normal">
                    Strict contractual prerequisite before civil contractor appointed date.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Results */}
        <div className="lg:col-span-5 space-y-5">
          {simulation ? (
            <>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Simulated Risk Outcome
                </span>

                <div className="flex items-center justify-between">
                  <div className="text-center p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Unmitigated</span>
                    <span className="text-3xl font-black text-slate-900 block mt-0.5">
                      {simulation.baseline.risk_score}
                    </span>
                    <span
                      className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: simulation.baseline.badge_color }}
                    >
                      {simulation.baseline.risk_category}
                    </span>
                  </div>

                  <div className="px-2 text-slate-400 flex flex-col items-center">
                    <ArrowRight className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs font-bold font-mono text-emerald-600 mt-0.5">
                      {simulation.metrics.risk_score_delta} pts
                    </span>
                  </div>

                  <div className="text-center p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 flex-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 block">With Mitigations</span>
                    <span className="text-3xl font-black text-indigo-950 block mt-0.5">
                      {simulation.simulated.risk_score}
                    </span>
                    <span
                      className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: simulation.simulated.badge_color }}
                    >
                      {simulation.simulated.risk_category}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Timeline Avoided</span>
                    </span>
                    <span className="text-lg font-black text-emerald-950 block mt-0.5">
                      {simulation.metrics.months_overrun_avoided} Months
                    </span>
                    <span className="text-[10px] text-emerald-700">gestation saved</span>
                  </div>

                  <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 flex items-center space-x-1">
                      <TrendingDown className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Capital Escalation Saved</span>
                    </span>
                    <span className="text-lg font-black text-indigo-950 block mt-0.5">
                      ₹{simulation.metrics.capital_escalation_saved_cr} Cr
                    </span>
                    <span className="text-[10px] text-indigo-700">cost inflation prevented</span>
                  </div>
                </div>
              </div>

              {simulation.lever_breakdown.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mitigation Levers Contribution</span>
                  </span>
                  <div className="space-y-1.5">
                    {simulation.lever_breakdown.map((item: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900 block">{item.lever}</span>
                          <span className="text-slate-500 block text-[11px]">{item.description}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs shrink-0">
                          -{item.relative_impact_points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
              Running simulation...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

