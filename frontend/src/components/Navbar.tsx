import React from 'react';
import { LayoutDashboard, Database, MapPin } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'projects' | 'map';
  setActiveTab: (tab: 'dashboard' | 'projects' | 'map') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
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

          {/* Tab Navigation */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
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
        </div>
      </div>
    </header>
  );
};
