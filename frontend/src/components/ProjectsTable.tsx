import React, { useState, useEffect } from 'react';
import type { ProjectListResponse } from '../types';
import { fetchProjects } from '../api';
import { Search, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';

interface ProjectsTableProps {
  onSelectProject: (projectCode: string) => void;
}

const SECTORS = [
  'ROAD TRANSPORT AND HIGHWAYS',
  'POWER',
  'RAILWAYS',
  'URBAN DEVELOPMENT',
  'PETROLEUM',
  'COAL',
  'WATER RESOURCES',
  'CIVIL AVIATION',
  'STEEL',
  'SHIPPING AND PORTS'
];

const RISK_TIERS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const ProjectsTable: React.FC<ProjectsTableProps> = ({ onSelectProject }) => {
  const [data, setData] = useState<ProjectListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(15);
  const [search, setSearch] = useState<string>('');
  const [sector, setSector] = useState<string>('');
  const [riskTier, setRiskTier] = useState<string>('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchProjects(
        page,
        pageSize,
        sector || undefined,
        undefined,
        riskTier || undefined,
        search || undefined
      );
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [page, sector, riskTier]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProjects();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project title, code (e.g. N24000745), or agency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sector filter */}
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="">All Sectors (10)</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Risk Tier filter */}
            <select
              value={riskTier}
              onChange={(e) => {
                setRiskTier(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="">All Risk Tiers</option>
              {RISK_TIERS.map((tier) => (
                <option key={tier} value={tier}>{tier} Risk</option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[350px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mb-2" />
            <p className="text-xs font-medium">Querying authentic project database...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : data && data.projects.length > 0 ? (
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3">Predicted Risk</th>
                <th className="px-4 py-3">Project Code</th>
                <th className="px-4 py-3">Project Title</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3 text-right">Cost (₹ Cr)</th>
                <th className="px-4 py-3 text-right">Reported Delay</th>
                <th className="px-4 py-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.projects.map((p) => {
                let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (p.risk_category === 'CRITICAL') badgeClass = 'bg-red-100 text-red-800 border-red-200';
                else if (p.risk_category === 'HIGH') badgeClass = 'bg-orange-100 text-orange-800 border-orange-200';
                else if (p.risk_category === 'MEDIUM') badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                else if (p.risk_category === 'LOW') badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';

                return (
                  <tr
                    key={p.project_code}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                        {p.risk_score !== undefined ? `${p.risk_score}/100 • ${p.risk_category}` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {p.project_code}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-900 font-medium" title={p.project_name}>
                      {p.project_name}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                      {p.agency}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {p.sector}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                      {p.state}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
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
                        className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="View Complete Project Breakdown & SHAP Drivers"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="text-sm font-semibold">No projects matched your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {data && data.total_pages > 1 && (
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.total_projects)} of {data.total_projects.toLocaleString()} projects
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {page} of {data.total_pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page === data.total_pages}
              className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

