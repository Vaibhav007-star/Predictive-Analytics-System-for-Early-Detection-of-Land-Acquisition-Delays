import React, { useState, useEffect } from 'react';
import type { ProjectDetail, User, StatutoryAssessmentResponse, NoticeDraftResponse } from '../types';
import { fetchStatutoryAssessment, generateStatutoryNotice } from '../api';
import { Scale, AlertTriangle, ShieldCheck, FileText, CheckCircle2, RefreshCw, Send, Copy } from 'lucide-react';

interface StatutoryAdvisoryTabProps {
  project: ProjectDetail;
  user: User | null;
}

export const StatutoryAdvisoryTab: React.FC<StatutoryAdvisoryTabProps> = ({ project, user }) => {
  const [assessment, setAssessment] = useState<StatutoryAssessmentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Notice Drafter State
  const [recipientTitle, setRecipientTitle] = useState<string>('District Collector & District Magistrate');
  const [customInstructions, setCustomInstructions] = useState<string>(
    'Ensure joint measurement survey (JMS) is completed and compensation deposited in dedicated escrow account before the Section 25 12-month ceiling.'
  );
  const [drafting, setDrafting] = useState<boolean>(false);
  const [draftResult, setDraftResult] = useState<NoticeDraftResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStatutoryAssessment(project.project_code);
        setAssessment(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load statutory compliance assessment');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [project.project_code]);

  const handleGenerateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDrafting(true);
      const res = await generateStatutoryNotice(
        project.project_code,
        recipientTitle,
        customInstructions
      );
      setDraftResult(res);
    } catch (err: any) {
      alert(`Notice generation failed: ${err.message}`);
    } finally {
      setDrafting(false);
    }
  };

  const handleCopyNotice = () => {
    if (draftResult?.formatted_document) {
      navigator.clipboard.writeText(draftResult.formatted_document);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mb-2" />
        <span className="text-xs">Evaluating RFCTLARR Act 2013 Statutory Compliance...</span>
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

  if (!assessment) return null;

  return (
    <div className="space-y-6">
      {/* Statutory Header Card */}
      <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Statutory Regulatory Assessment
              </span>
              <h4 className="text-sm font-bold text-white leading-tight">
                {assessment.current_statutory_stage}
              </h4>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Section 25 Lapsing Risk
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider text-white mt-0.5 ${
                assessment.lapsing_risk_level === 'CRITICAL'
                  ? 'bg-rose-600'
                  : assessment.lapsing_risk_level === 'HIGH'
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}
            >
              {assessment.lapsing_risk_level} ({assessment.lapsing_risk_score}/100)
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
          {assessment.stage_description}
        </p>
      </div>

      {/* Mandatory Statutory Directives */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>RFCTLARR 2013 Statutory Directives & Mitigation Action Plan</span>
          </h4>
          {assessment.urgency_clause_eligible && (
            <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded border border-sky-300">
              Section 40 Urgency Clause Eligible
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {assessment.statutory_directives.map((dir, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{dir.title}</span>
                <span className="text-[10px] font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {dir.urgency}
                </span>
              </div>
              <span className="text-[11px] font-mono text-indigo-700 block">{dir.statutory_ref}</span>
              <p className="text-slate-600 leading-relaxed">{dir.directive}</p>
            </div>
          ))}
        </div>

        <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-[11px] text-indigo-900 flex items-start space-x-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
          <span><strong>Compensation Framework:</strong> {assessment.multiplier_framework}</span>
        </div>
      </div>

      {/* Official Notice Drafter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Generate Official RFCTLARR Executive Compliance Notice</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Government of India Gazette Format</span>
        </div>

        {user?.role === 'Admin' ? (
          <form onSubmit={handleGenerateNotice} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Addressee Designation:</label>
                <input
                  type="text"
                  value={recipientTitle}
                  onChange={(e) => setRecipientTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authority Clearance Level:</label>
                <input
                  type="text"
                  disabled
                  value="Ministry of Rural Development • Executive Division"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Operational Directive & Action Mandate:
              </label>
              <textarea
                rows={2}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={drafting}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{drafting ? 'Generating Gazette Notice...' : 'Generate Official Compliance Memorandum'}</span>
            </button>
          </form>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            Notice drafting requires MoRD Administrative clearance. Switch to Admin account to generate official memoranda.
          </div>
        )}

        {draftResult && (
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Generated Official Document:</span>
              <button
                onClick={handleCopyNotice}
                className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Document'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-xl overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap border border-slate-800">
              {draftResult.formatted_document}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
