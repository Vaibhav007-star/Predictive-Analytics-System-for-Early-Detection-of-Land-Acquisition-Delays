import React, { useState, useEffect } from 'react';
import type { GraphNetworkResponse, CascadeResponse } from '../types';
import { fetchContagionNetwork, simulateContagionCascade } from '../api';
import { Share2, AlertTriangle, ArrowRight, Building2, MapPin, Zap, RefreshCw } from 'lucide-react';

export const ContagionGraphView: React.FC = () => {
  const [network, setNetwork] = useState<GraphNetworkResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cascade Simulation State
  const [epicenterCode, setEpicenterCode] = useState<string>('');
  const [delayShockMonths, setDelayShockMonths] = useState<number>(18);
  const [cascade, setCascade] = useState<CascadeResponse | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchContagionNetwork();
        setNetwork(data);
        const projects = data.nodes.filter((n) => n.type === 'PROJECT');
        if (projects.length > 0) {
          setEpicenterCode(projects[0].id);
          runCascade(projects[0].id, 18);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load contagion network');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const runCascade = async (code: string, shockMonths: number) => {
    try {
      setSimulating(true);
      const res = await simulateContagionCascade(code, shockMonths);
      setCascade(res);
    } catch (err: any) {
      console.error('Cascade error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (epicenterCode) {
      runCascade(epicenterCode, delayShockMonths);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <span className="text-xs">Constructing Multi-Relational Infrastructure Knowledge Graph...</span>
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

  if (!network) return null;

  const projectNodes = network.nodes.filter((n) => n.type === 'PROJECT');
  const agencyNodes = network.nodes.filter((n) => n.type === 'AGENCY');
  const stateNodes = network.nodes.filter((n) => n.type === 'STATE');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-900/60 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                <Share2 className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
                Macro-Prudential Infrastructure Analytics
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Infrastructure Contagion & Dependency Knowledge Graph
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Models multi-relational interdependencies across central sector projects, implementing agencies, and state administrative jurisdictions. Simulates topological shock propagation and cascading capital inflation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Network Nodes</span>
              <span className="text-lg font-black text-indigo-300">{network.total_nodes}</span>
            </div>
            <div className="px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Dependency Links</span>
              <span className="text-lg font-black text-amber-300">{network.total_links}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Topology Inspector & Cascade Shock Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Network Topology Explorer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Multi-Relational Knowledge Graph Topology</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {projectNodes.length} Projects • {agencyNodes.length} Agencies • {stateNodes.length} States
              </span>
            </div>

            {/* Nodes Visual Representation */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Implementing Authority Hubs (Resource Sharing)
                </span>
                <div className="flex flex-wrap gap-2">
                  {agencyNodes.map((a) => (
                    <span
                      key={a.id}
                      className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-bold flex items-center space-x-1"
                    >
                      <Building2 className="w-3 h-3 text-indigo-600" />
                      <span>{a.agency}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Jurisdictional Administrative Clusters
                </span>
                <div className="flex flex-wrap gap-2">
                  {stateNodes.map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-900 rounded-lg text-xs font-bold flex items-center space-x-1"
                    >
                      <MapPin className="w-3 h-3 text-sky-600" />
                      <span>{s.state}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Sample Multi-Relational Dependency Edges
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
                  {network.links.slice(0, 8).map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-slate-800 font-semibold">{link.source}</span>
                      <span className="text-indigo-600 text-[10px] font-sans font-bold px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100">
                        --[{link.relationship}]--&gt;
                      </span>
                      <span className="text-slate-700">{link.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Delay Cascade Shock Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Topological Delay Shock Simulator</span>
              </h3>
              {simulating && (
                <span className="text-[10px] text-amber-600 font-mono animate-pulse">Propagating...</span>
              )}
            </div>

            <form onSubmit={handleSimulate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Epicenter Project:
                </label>
                <select
                  value={epicenterCode}
                  onChange={(e) => setEpicenterCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                >
                  {projectNodes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Injected Delay Shock:</span>
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    +{delayShockMonths} Months
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="48"
                  step="3"
                  value={delayShockMonths}
                  onChange={(e) => setDelayShockMonths(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Simulate Delay Cascade & Capital Ripple</span>
              </button>
            </form>

            {cascade && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                {/* Cascade Summary Cards */}
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-rose-800">
                      Systemic Contagion Severity
                    </span>
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black uppercase">
                      {cascade.cascade_summary.ripple_severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 bg-white/80 rounded-lg text-center border border-rose-100">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Secondary Delay</span>
                      <span className="text-lg font-black text-rose-900 block mt-0.5">
                        +{cascade.cascade_summary.total_secondary_delay_months} Months
                      </span>
                      <span className="text-[10px] text-slate-400">across {cascade.cascade_summary.exposed_projects_count} assets</span>
                    </div>

                    <div className="p-2 bg-white/80 rounded-lg text-center border border-rose-100">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Cascaded Cost Escalation</span>
                      <span className="text-lg font-black text-rose-900 block mt-0.5">
                        ₹{cascade.cascade_summary.total_cascade_escalation_cr} Cr
                      </span>
                      <span className="text-[10px] text-slate-400">capital inflation</span>
                    </div>
                  </div>
                </div>

                {/* Cascaded Projects List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Exposed Downstream Infrastructure Assets:
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {cascade.cascaded_projects.map((proj) => (
                      <div
                        key={proj.project_code}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-mono">[{proj.project_code}]</span>
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            +{proj.secondary_delay_months} mo (₹{proj.estimated_cost_escalation_cr} Cr)
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium truncate">{proj.project_name}</p>
                        <span className="text-[10px] text-indigo-700 block font-mono">
                          Pathway: {proj.contagion_pathway}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
