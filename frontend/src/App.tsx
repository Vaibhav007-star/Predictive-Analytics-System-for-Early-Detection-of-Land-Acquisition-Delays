import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { RiskDistributionChart } from './components/RiskDistributionChart';
import { PriorityQueueTable } from './components/PriorityQueueTable';
import { ProjectsTable } from './components/ProjectsTable';
import { GISMap } from './components/GISMap';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { AuditLogModal } from './components/AuditLogModal';
import type { RisksSummaryResponse, User } from './types';
import { fetchRisksSummary, getStoredUser, loginUser, getAuthToken } from './api';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'map'>('dashboard');
  const [summary, setSummary] = useState<RisksSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication & RBAC state (Defaults to MoRD Admin for frictionless hackathon demonstration)
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Selected project for modal detail inspection
  const [selectedProjectCode, setSelectedProjectCode] = useState<string | null>(null);

  const initAuth = async () => {
    // If no token or user, automatically establish demo admin session
    if (!getAuthToken() || !user) {
      try {
        const authData = await loginUser('admin', 'sih26017');
        setUser(authData.user);
      } catch (e) {
        console.warn('Auto-login fallback:', e);
      }
    }
  };

  const handleSwitchRole = async (targetRole: 'Admin' | 'Viewer') => {
    try {
      if (targetRole === 'Admin') {
        const authData = await loginUser('admin', 'sih26017');
        setUser(authData.user);
      } else {
        const authData = await loginUser('viewer', 'viewer123');
        setUser(authData.user);
      }
    } catch (err: any) {
      alert(`Role switch error: ${err.message}`);
    }
  };

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRisksSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to analytics backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
    loadSummary();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSwitchRole={handleSwitchRole}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
      />


      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
            <p className="text-sm font-semibold">Connecting to SIH26017 Predictive Engine...</p>
            <p className="text-xs text-slate-400 mt-1">Loading authentic MoSPI Central Sector dataset (1,477 assets)</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto mt-12">
            <h3 className="text-base font-bold text-red-800">Connection Error</h3>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <p className="text-xs text-slate-500 mt-3">Ensure FastAPI backend is running on port 8000.</p>
            <button
              onClick={loadSummary}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : summary ? (
          <>
            {/* View 1: Executive Dashboard */}
            {activeTab === 'dashboard' && (
              <div>
                <KPICards summary={summary} />
                <RiskDistributionChart summary={summary} />
                <PriorityQueueTable
                  projects={summary.priority_queue}
                  onSelectProject={(code) => setSelectedProjectCode(code)}
                />
              </div>
            )}

            {/* View 2: Projects Directory */}
            {activeTab === 'projects' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">National Central Sector Projects Directory</h2>
                  <p className="text-xs text-slate-500">
                    Search and filter 1,477 authentic infrastructure assets across 10 sectors and 33 Indian States/UTs.
                  </p>
                </div>
                <ProjectsTable onSelectProject={(code) => setSelectedProjectCode(code)} />
              </div>
            )}

            {/* View 3: National GIS Map */}
            {activeTab === 'map' && (
              <div>
                <GISMap onSelectProject={(code) => setSelectedProjectCode(code)} />
              </div>
            )}
          </>
        ) : null}
      </main>

      {/* Project Detail & SHAP Explainability Modal */}
      <ProjectDetailModal
        projectCode={selectedProjectCode}
        onClose={() => setSelectedProjectCode(null)}
        user={user}
      />

      {/* Administrative Compliance Audit Trail Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        isAdmin={user?.role === 'Admin'}
      />


      {/* Official Government System Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">Strict Non-Fabrication Protocol:</span>
            <span>100% Traceable to MoSPI Flash Report (Feb 2025) & PMGSY OMMAS</span>
          </div>
          <p className="text-slate-400">
            SIH26017 Decision Support System • Ministry of Rural Development • Government of India
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
