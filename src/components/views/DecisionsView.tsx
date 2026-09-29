import React, { useState } from 'react';
import { GitBranch, Plus, Search, ArrowUpRight, CheckCircle2, Clock, AlertCircle, Compass, ShieldAlert } from 'lucide-react';
import { DecisionContext } from '../../types/phoenix';
import { AVAILABLE_DECISIONS, MOCK_EXPERIENCES } from '../../data/mockMemory';

interface DecisionsViewProps {
  activeDecision: DecisionContext;
  onSetActiveDecision: (decision: DecisionContext) => void;
  onSelectExperience: (id: string) => void;
  onNavigateToCommandCenter: () => void;
  onNavigateToPreMortem: () => void;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({
  activeDecision,
  onSetActiveDecision,
  onSelectExperience,
  onNavigateToCommandCenter,
  onNavigateToPreMortem,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProposing, setIsProposing] = useState(false);

  // New Decision Proposal Form
  const [newQuestion, setNewQuestion] = useState('');
  const [newScope, setNewScope] = useState('');
  const [newThroughput, setNewThroughput] = useState('');
  const [newProposedTech, setNewProposedTech] = useState('');

  const [allDecisions, setAllDecisions] = useState<DecisionContext[]>([
    ...AVAILABLE_DECISIONS,
    {
      id: 'ADR-017',
      question: 'Kafka Migration — Billing Platform',
      scope: 'Financial Transactions & Ledgers',
      targetThroughput: '18k msg/s',
      impactedServices: ['billing-core', 'ledger-sync'],
      precedentIds: ['EXP-024'],
      proposedTech: 'Apache Kafka 3.6',
      currentTech: 'RabbitMQ 3.11',
      submittedBy: 'Billing Infrastructure',
      timestamp: 'Oct 2024',
      status: 'adopted',
    },
    {
      id: 'ADR-026',
      question: 'Search Infrastructure Migration',
      scope: 'Discovery & Catalog',
      targetThroughput: '85k search req/s',
      impactedServices: ['catalog-api', 'search-indexer'],
      precedentIds: ['ADR-017'],
      proposedTech: 'OpenSearch 2.12',
      currentTech: 'Elasticsearch 7.17',
      submittedBy: 'Search & Relevance',
      timestamp: 'Mar 2025',
      status: 'adopted',
    },
    {
      id: 'ADR-031',
      question: 'PostgreSQL Connection Pooling with PgBouncer',
      scope: 'User Data Store',
      targetThroughput: '45k qps',
      impactedServices: ['user-service', 'auth-daemon'],
      precedentIds: ['INC-009'],
      proposedTech: 'PgBouncer in Transaction Mode',
      currentTech: 'Unpooled PostgreSQL clients',
      submittedBy: 'Database Operations',
      timestamp: 'Apr 2025',
      status: 'adopted',
    },
  ]);

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const created: DecisionContext = {
      id: `DEC-0${allDecisions.length + 90}`,
      question: newQuestion,
      scope: newScope || 'General Platform',
      targetThroughput: newThroughput || '50k ops/s',
      impactedServices: ['core-gateway'],
      precedentIds: ['ADR-017', 'INC-011'],
      proposedTech: newProposedTech || 'Modern Distributed Stack',
      currentTech: 'Legacy Service',
      submittedBy: 'Alex Vance (Principal Staff)',
      timestamp: 'Just now',
      status: 'active_rfc',
    };

    setAllDecisions([created, ...allDecisions]);
    onSetActiveDecision(created);
    setIsProposing(false);
    setNewQuestion('');
    setNewScope('');
    setNewThroughput('');
    setNewProposedTech('');
  };

  const filteredDecisions = allDecisions.filter((dec) => {
    const isCompleted = dec.status === 'adopted' || dec.status === 'superseded';
    const isActive = dec.status === 'active_rfc' || dec.status === 'under_review';

    if (filterStatus === 'active' && !isActive) return false;
    if (filterStatus === 'completed' && !isCompleted) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        dec.id.toLowerCase().includes(q) ||
        dec.question.toLowerCase().includes(q) ||
        dec.scope.toLowerCase().includes(q) ||
        dec.proposedTech.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202B3D]">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Organizational Ledger</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-300">
              {allDecisions.length} decisions tracked
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Architecture Decisions Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every architectural RFC, ADR, and platform pivot indexed with its eventual production outcome.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProposing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#635BFF] hover:bg-[#5249ea] rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Propose Decision RFC</span>
          </button>
        </div>
      </div>

      {/* Propose Modal / Form */}
      {isProposing && (
        <div className="bg-[#101725] border border-[#635BFF]/50 rounded-lg p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Propose New Engineering Decision RFC
            </h3>
            <button
              onClick={() => setIsProposing(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateDecision} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Decision Question / Proposition
              </label>
              <input
                type="text"
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. Should we adopt Rust microservices for event processing?"
                className="w-full bg-[#0C111B] border border-[#202B3D] rounded p-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#635BFF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Scope / System</label>
                <input
                  type="text"
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  placeholder="e.g. Ingestion Pipeline"
                  className="w-full bg-[#0C111B] border border-[#202B3D] rounded p-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#635BFF]"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Target Throughput</label>
                <input
                  type="text"
                  value={newThroughput}
                  onChange={(e) => setNewThroughput(e.target.value)}
                  placeholder="e.g. 150k events/s"
                  className="w-full bg-[#0C111B] border border-[#202B3D] rounded p-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#635BFF]"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Proposed Technology</label>
                <input
                  type="text"
                  value={newProposedTech}
                  onChange={(e) => setNewProposedTech(e.target.value)}
                  placeholder="e.g. Rust / Tokio runtime"
                  className="w-full bg-[#0C111B] border border-[#202B3D] rounded p-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#635BFF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#202B3D]">
              <button
                type="button"
                onClick={() => setIsProposing(false)}
                className="px-3 py-1 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#635BFF] text-white rounded font-medium hover:bg-[#5249ea] transition-colors"
              >
                Submit and Evaluate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Decision Table */}
      <div className="bg-[#0C111B] border border-[#202B3D] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#202B3D] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filterStatus === 'all'
                  ? 'bg-[#141C2B] text-white border border-[#38BDF8]/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records ({allDecisions.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filterStatus === 'active'
                  ? 'bg-[#141C2B] text-white border border-[#38BDF8]/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active RFCs ({allDecisions.filter((d) => d.status === 'active_rfc' || d.status === 'under_review').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-[#141C2B] text-white border border-[#38BDF8]/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Adopted ADRs ({allDecisions.filter((d) => d.status === 'adopted').length})
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decisions & ADRs..."
              className="w-full sm:w-64 bg-[#101725] border border-[#202B3D] text-xs text-white placeholder:text-slate-500 rounded px-3 py-1.5 focus:outline-none focus:border-[#635BFF]"
            />
          </div>
        </div>

        <div className="divide-y divide-[#202B3D]">
          {filteredDecisions.map((dec) => {
            const isCurrentlyActive = activeDecision.id === dec.id;
            const isAdopted = dec.status === 'adopted';

            return (
              <div
                key={dec.id}
                className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCurrentlyActive ? 'bg-[#101725]/90 border-l-2 border-l-[#635BFF]' : 'hover:bg-[#101725]/50'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 md:w-5/12">
                  <span className="font-mono text-xs font-semibold text-[#38BDF8] shrink-0 pt-0.5">
                    {dec.id}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {dec.question}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{dec.scope}</span>
                      <span className="text-slate-600" aria-hidden="true">·</span>
                      <span className="font-mono">{dec.targetThroughput}</span>
                      <span className="text-slate-600" aria-hidden="true">·</span>
                      <span>{dec.submittedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs md:w-3/12">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Status</div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isAdopted ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-slate-200 capitalize">
                      {dec.status ? dec.status.replace('_', ' ') : 'active rfc'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between md:justify-end gap-2 text-xs shrink-0 md:w-4/12 flex-wrap">
                  {/* Inspect experience if exists */}
                  {MOCK_EXPERIENCES.some((e) => e.id === dec.id) && (
                    <button
                      onClick={() => onSelectExperience(dec.id)}
                      className="px-2.5 py-1 text-slate-300 hover:text-white bg-[#141C2B] border border-[#202B3D] rounded transition-colors text-[11px]"
                    >
                      Inspect Record
                    </button>
                  )}

                  {/* Set as active decision */}
                  <button
                    onClick={() => {
                      onSetActiveDecision(dec);
                      onNavigateToCommandCenter();
                    }}
                    className={`px-2.5 py-1 rounded transition-colors text-[11px] flex items-center gap-1 ${
                      isCurrentlyActive
                        ? 'bg-[#635BFF]/20 text-[#7C6CFF] border border-[#635BFF]/40 font-medium'
                        : 'bg-[#141C2B] text-slate-300 hover:text-white border border-[#202B3D]'
                    }`}
                  >
                    <Compass className="w-3 h-3 text-[#38BDF8]" />
                    <span>{isCurrentlyActive ? 'Active in Command Center' : 'Evaluate in CC'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSetActiveDecision(dec);
                      onNavigateToPreMortem();
                    }}
                    className="p-1 text-slate-400 hover:text-amber-300 rounded hover:bg-[#141C2B] transition-colors"
                    title="Run Pre-Mortem for this decision"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
