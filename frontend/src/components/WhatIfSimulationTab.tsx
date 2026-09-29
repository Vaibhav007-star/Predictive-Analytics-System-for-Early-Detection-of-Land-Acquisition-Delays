import React, { useState, useEffect } from 'react';
import type { SimulationRequest, SimulationResponse, ProjectDetail } from '../types';
import { simulateProject } from '../api';
import { Sliders, TrendingDown, Clock, ShieldCheck, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

interface WhatIfSimulationTabProps {
  project: ProjectDetail;
}

export const WhatIfSimulationTab: React.FC<WhatIfSimulationTabProps> = ({ project }) => {
  const [levers, setLevers] = useState<SimulationRequest>({
    package_split_count: 1,
    contingency_budget_pct: 0,
    dedicated_slao_taskforce: false,
    parallel_statutory_hearings: false,
    row_pre_possession_pct: 50,
    execution_buffer_months: 0
  });

  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (updatedLevers: SimulationRequest) => {
    try {
      setSimulating(true);
      setError(null);
      const res = await simulateProject(project.project_code, updatedLevers);
      setSimulation(res);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate simulation');
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation(levers);
  }, [project.project_code]);

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
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-5 border border-indigo-700/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-300">
              <Sliders className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
              Counterfactual Policy Sandbox (Digital Twin)
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Simulate Interventions for {project.project_code}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Test regulatory, contractual, and operational policy levers to evaluate risk delta before committing capital.
          </p>
        </div>
        <button
          onClick={resetLevers}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Policy Levers (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <span>Operational & Contractual Levers</span>
              {simulating && <span className="text-[10px] text-indigo-600 font-mono animate-pulse">Recalculating...</span>}
            </h4>

            {/* Lever 1: Package Splitting */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Contract Package Splitting</span>
                  <span className="text-[11px] text-slate-500">Divide mega-contract into independent execution packages</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded border border-indigo-200">
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
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>1 (Single EPC)</span>
                <span>2 Lots</span>
                <span>3 Lots</span>
                <span>4 Lots (Phased)</span>
              </div>
            </div>

            {/* Lever 2: Contingency Escrow */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Contingency Escrow Pre-Funding</span>
                  <span className="text-[11px] text-slate-500">Dedicated advance bank escrow for landowner compensation</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded border border-emerald-200">
                  +{levers.contingency_budget_pct}% Budget
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
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0% (Standard)</span>
                <span>+10%</span>
                <span>+20%</span>
                <span>+25% (High Reserve)</span>
              </div>
            </div>

            {/* Lever 3: Execution Buffer */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Planned Duration Buffer Extension</span>
                  <span className="text-[11px] text-slate-500">Alleviate compressed unviable construction milestones</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded border border-amber-200">
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
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0 mo</span>
                <span>+6 mo</span>
                <span>+12 mo</span>
                <span>+18 mo</span>
              </div>
            </div>

            {/* Lever 4: Toggle Switches */}
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
                    Reduces state historical friction by up to 35%
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
                    Simultaneous survey & objection hearings
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
                  <span className="block font-bold">Enforce 80% Contiguous RoW Pre-Handover</span>
                  <span className="text-[11px] text-slate-500 block font-normal">
                    Mandatory possession before contractor appointed date; eliminates idling claims.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Results */}
        <div className="lg:col-span-5 space-y-4">
          {simulation ? (
            <>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Simulated Risk Trajectory
                </span>

                <div className="flex items-center justify-between">
                  <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Baseline</span>
                    <span className="text-2xl font-black text-slate-900 block mt-0.5">
                      {simulation.baseline.risk_score}
                    </span>
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: simulation.baseline.badge_color }}
                    >
                      {simulation.baseline.risk_category}
                    </span>
                  </div>

                  <div className="px-2 text-slate-400 flex flex-col items-center">
                    <ArrowRight className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] font-bold font-mono text-emerald-600 mt-0.5">
                      {simulation.metrics.risk_score_delta} pts
                    </span>
                  </div>

                  <div className="text-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 flex-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 block">Simulated</span>
                    <span className="text-2xl font-black text-indigo-950 block mt-0.5">
                      {simulation.simulated.risk_score}
                    </span>
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: simulation.simulated.badge_color }}
                    >
                      {simulation.simulated.risk_category}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Delay Probability Shift</span>
                    <span className="font-mono font-bold text-emerald-600">
                      -{( (simulation.baseline.probability - simulation.simulated.probability) * 100 ).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-indigo-600"
                      style={{ width: `${Math.min(100, Math.max(5, simulation.simulated.probability * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>Timeline Saved</span>
                    </span>
                    <span className="text-base font-extrabold text-emerald-900 block mt-0.5">
                      {simulation.metrics.months_overrun_avoided} Months
                    </span>
                    <span className="text-[10px] text-emerald-700">avoided overrun</span>
                  </div>

                  <div className="p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 flex items-center space-x-1">
                      <TrendingDown className="w-3 h-3 text-indigo-600" />
                      <span>Capital Saved</span>
                    </span>
                    <span className="text-base font-extrabold text-indigo-900 block mt-0.5">
                      ₹{simulation.metrics.capital_escalation_saved_cr} Cr
                    </span>
                    <span className="text-[10px] text-indigo-700">escalation prevented</span>
                  </div>
                </div>
              </div>

              {simulation.lever_breakdown.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Applied Mitigations Impact</span>
                  </span>
                  <div className="space-y-1.5">
                    {simulation.lever_breakdown.map((item: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900 block">{item.lever}</span>
                          <span className="text-slate-500 block text-[10px]">{item.description}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                          -{item.relative_impact_points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
              Initializing simulation engine...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
