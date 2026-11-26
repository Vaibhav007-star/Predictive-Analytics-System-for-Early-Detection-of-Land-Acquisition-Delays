import React from 'react';
import { LayoutDashboard, Database, MapPin, Box, Sliders, Compass, Share2, Shield, UserCheck, History } from 'lucide-react';
import type { User } from '../types';

export type NavigationTab = 'dashboard' | 'projects' | 'map' | 'twin3d' | 'sandbox' | 'corridors' | 'contagion';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
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
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'projects', label: 'Projects', icon: <Database className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'map', label: 'GIS Map', icon: <MapPin className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'twin3d', label: '3D Twin', icon: <Box className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'sandbox', label: 'Policy Sandbox', icon: <Sliders className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'corridors', label: 'Corridor Studio', icon: <Compass className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'contagion', label: 'Contagion Network', icon: <Share2 className="w-3.5 h-3.5 shrink-0" /> }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand & User Controls */}
        <div className="flex items-center justify-between gap-4 py-2.5">
          {/* Brand & Ministry Header */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-sm text-white shadow">
              SIH
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 whitespace-nowrap">
                  SIH26017 • MoRD
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline whitespace-nowrap">
                  Ministry of Rural Development
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight truncate mt-0.5">
                Land Acquisition & Delay Predictive Analytics System
              </h1>
            </div>
          </div>

          {/* Right: User Auth & Audit Trail */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Audit Trail Button */}
            <button
              onClick={onOpenAuditLogs}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-medium border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              title="View Compliance Audit Trail"
            >
              <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Audit Trail</span>
            </button>

            {/* Active User Badge & Demo Switcher */}
            {user && (
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-lg">
                <div className="text-right hidden sm:block">
                  <div className="text-[11px] font-medium text-slate-200 leading-none truncate max-w-[130px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-none whitespace-nowrap">
                    {user.role === 'Admin' ? 'MoRD Executive' : 'Public Auditor'}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 whitespace-nowrap ${
                  user.role === 'Admin'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-sky-950 text-sky-300 border border-sky-700'
                }`}>
                  {user.role === 'Admin' ? (
                    <Shield className="w-3 h-3 mr-0.5 shrink-0" />
                  ) : (
                    <UserCheck className="w-3 h-3 mr-0.5 shrink-0" />
                  )}
                  <span>{user.role}</span>
                </span>

                {/* Switcher Toggle */}
                <button
                  onClick={() => onSwitchRole(user.role === 'Admin' ? 'Viewer' : 'Admin')}
                  className="text-[10px] text-slate-400 hover:text-amber-400 underline pl-1 transition-colors cursor-pointer whitespace-nowrap"
                  title="Switch demo account"
                >
                  Switch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Clean Single-Line Navigation Bar */}
        <nav className="flex items-center space-x-1.5 py-2 border-t border-slate-800/80 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

