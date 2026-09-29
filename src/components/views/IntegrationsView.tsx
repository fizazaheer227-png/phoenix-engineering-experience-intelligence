import React, { useState } from 'react';
import { Cpu, GitBranch, FileText, AlertTriangle, Activity, Check, RefreshCw, Info, ShieldCheck } from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<Record<string, { lastSync: string; count: number }>>({
    github: { lastSync: '12 minutes ago', count: 1420 },
    confluence: { lastSync: '1 hour ago', count: 147 },
    pagerduty: { lastSync: 'Just now', count: 23 },
    datadog: { lastSync: 'Continuous stream', count: 184000 },
  });

  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSync = (key: string, name: string) => {
    setIsSyncing(key);
    setTimeout(() => {
      setIsSyncing(null);
      setSyncStatus((prev) => ({
        ...prev,
        [key]: { ...prev[key], lastSync: 'Just now' },
      }));
      setToastMessage(`Re-indexed local ${name} demo fixtures into memory core.`);
      setTimeout(() => setToastMessage(null), 3000);
    }, 700);
  };

  const integrations = [
    {
      id: 'github',
      name: 'GitHub PRs & Commits',
      environment: 'Demo Fixture Feed',
      isLiveConnected: false,
      description: 'Continuous extraction of architecture discussions, pull request retrospectives, and merge commits from engineering repositories.',
      stats: '34 repositories · 1,420 merged PRs indexed',
      groundingNote: 'Supplies EXP-024, EXP-018, and code refactor benchmarks.',
    },
    {
      id: 'confluence',
      name: 'ADR & RFC Documents',
      environment: 'Demo Fixture Feed',
      isLiveConnected: false,
      description: 'Ingests Architecture Decision Records and engineering RFC documents directly from markdown repositories and wiki spaces.',
      stats: '147 ADR documents indexed',
      groundingNote: 'Supplies ADR-017, ADR-026, ADR-031 architectural specifications.',
    },
    {
      id: 'pagerduty',
      name: 'Incident.io & PagerDuty Post-Mortems',
      environment: 'Demo Fixture Feed',
      isLiveConnected: false,
      description: 'Synchronizes post-mortems, root cause analyses, and timeline logs from production Sev-1 and Sev-2 outages.',
      stats: '23 incident retrospectives indexed',
      groundingNote: 'Supplies INC-011, INC-009, INC-004 failure telemetry.',
    },
    {
      id: 'datadog',
      name: 'Telemetry & Cluster Exporters',
      environment: 'Demo Fixture Feed',
      isLiveConnected: false,
      description: 'Correlates deployment timestamps with throughput spikes, latency regressions, and consumer lag telemetry.',
      stats: 'Cluster telemetry stream active',
      groundingNote: 'Supplies empirical broker benchmarks and consumer lag metrics.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-[#101725] border border-emerald-500/40 text-emerald-300 rounded text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-[#202B3D]">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Evidence Sources</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono text-cyan-400">Local NovaStack Memory Active</span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1">
          Memory Ingestion Connectors
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configured feeds that continuously supply organizational experiences into Phoenix memory.
        </p>
      </div>

      {/* Honest Environment Clarification Banner */}
      <div className="p-4 bg-[#101725] border border-[#202B3D] rounded-lg text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200">
            Operating in Local Demo Dataset Mode
          </div>
          <p className="text-slate-400 leading-relaxed">
            External production webhooks (GitHub Enterprise OAuth, Confluence Cloud, PagerDuty live incident streams) are currently disconnected in this prototype environment. All experiences, benchmarks, and post-mortems are indexed from the verified NovaStack organizational demo dataset.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between text-xs pb-3 border-b border-[#202B3D]/70">
                <span className="font-semibold text-white text-sm">{item.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {item.environment}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {item.description}
              </p>
              <div className="mt-3 text-[11px] font-mono text-slate-400 bg-[#101725] p-2 rounded border border-[#202B3D]/60 flex items-center justify-between">
                <span>{item.stats}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                {item.groundingNote}
              </div>
            </div>

            <div className="pt-3 border-t border-[#202B3D]/50 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                Last synced: {syncStatus[item.id]?.lastSync || 'Recently'}
              </span>
              <button
                onClick={() => handleSync(item.id, item.name)}
                disabled={isSyncing === item.id}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#141C2B] hover:bg-[#1a253a] border border-[#202B3D] rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing === item.id ? 'animate-spin' : ''}`} />
                <span>{isSyncing === item.id ? 'Re-indexing...' : 'Sync Dataset'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
