import React from 'react';
import { LayoutDashboard, Database, MapPin, Shield, UserCheck, History } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'projects' | 'map';
  setActiveTab: (tab: 'dashboard' | 'projects' | 'map') => void;
  user: User | null;
  onSwitchRole: (targetRole: 'Admin' | 'Viewer') => void;
  onOpenAuditLogs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onSwitchRole,
  onOpenAuditLogs
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Ministry Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow">
              SIH
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  SIH26017 • MoRD
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Ministry of Rural Development
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                Land Acquisition & Delay Predictive Analytics System
              </h1>
            </div>
          </div>

          {/* Center: Tab Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>GIS Map</span>
            </button>
          </nav>

          {/* Right: User Auth & Audit Trail */}
          <div className="flex items-center space-x-2">
            {/* Audit Trail Button */}
            <button
              onClick={onOpenAuditLogs}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="View Compliance Audit Trail"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Audit Trail</span>
            </button>

            {/* Active User Badge & Demo Switcher */}
            {user && (
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-lg">
                <div className="text-right hidden sm:block">
                  <div className="text-[11px] font-medium text-slate-200 leading-none truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-none">
                    {user.role === 'Admin' ? 'MoRD Executive' : 'Public Auditor'}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                  user.role === 'Admin'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-sky-950 text-sky-300 border border-sky-700'
                }`}>
                  {user.role === 'Admin' ? (
                    <Shield className="w-3 h-3 mr-0.5" />
                  ) : (
                    <UserCheck className="w-3 h-3 mr-0.5" />
                  )}
                  <span>{user.role}</span>
                </span>

                {/* Switcher Toggle */}
                <button
                  onClick={() => onSwitchRole(user.role === 'Admin' ? 'Viewer' : 'Admin')}
                  className="text-[10px] text-slate-400 hover:text-amber-400 underline pl-1 transition-colors cursor-pointer"
                  title="Switch demo account"
                >
                  Switch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Projects</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
              activeTab === 'map'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>GIS Map</span>
          </button>
        </div>
      </div>
    </header>
  );
};

