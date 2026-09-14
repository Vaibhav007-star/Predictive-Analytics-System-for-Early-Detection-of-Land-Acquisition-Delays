import React, { useEffect, useState } from 'react';
import { ShieldCheck, X, RefreshCw, Clock, User, AlertCircle, FileText } from 'lucide-react';
import { fetchAuditLogs } from '../api';
import type { AuditLogItem } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, isAdmin }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogs(50);
      setLogs(data.items);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Administrative Audit Trail & Compliance Log</span>
                <span className="text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 px-2 py-0.5 rounded">
                  Tamper-Evident
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Chronological log of administrative interventions, SLAO assignments, and governance actions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button
                onClick={loadLogs}
                disabled={loading}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors cursor-pointer"
                title="Refresh audit logs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!isAdmin ? (
            <div className="p-8 text-center bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-base font-semibold text-white">Access Restricted</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Viewing the administrative audit log requires MoRD Administrative clearance. Switch to the <strong>Admin</strong> account to inspect historical interventions and compliance logs.
              </p>
            </div>
          ) : loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Loading audit log entries from SQLite repository...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No audit logs recorded yet in this session.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-1">
                <span>Showing {logs.length} most recent compliance events</span>
                <span className="text-[11px] text-emerald-400 font-mono">SQLite: audit_logs</span>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden">
                {logs.map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-800/30 hover:bg-slate-800/60 transition-colors text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[11px] ${
                          item.action === 'INTERVENTION_CREATED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : item.action === 'USER_LOGIN'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {item.action}
                        </span>
                        {item.project_code && (
                          <span className="px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-200 border border-slate-700 text-[11px] flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>Proj #{item.project_code}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-300 font-medium">{item.username}</span>
                          <span className="text-slate-500">({item.role})</span>
                        </span>
                        <span className="flex items-center space-x-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(item.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs pl-0.5">
                      {item.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-800/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Official Ministry of Rural Development Digital Governance Archive</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

