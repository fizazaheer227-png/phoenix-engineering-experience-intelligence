import React, { useState } from 'react';
import { Dna, ShieldCheck, Zap, AlertTriangle, ArrowUpRight, Search, Filter, BookOpen } from 'lucide-react';
import { LEARNED_OBSERVATIONS, MOCK_EXPERIENCES } from '../../data/mockMemory';

interface EngineeringDnaViewProps {
  onSelectExperience: (id: string) => void;
}

export const EngineeringDnaView: React.FC<EngineeringDnaViewProps> = ({ onSelectExperience }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const organizationalPatterns = [
    {
      id: 'DNA-01',
      category: 'Architecture Pattern',
      title: 'Decoupled Client SDKs Before Broker Transport Cutover',
      axiom: 'Never bind microservice client libraries directly to broker wire protocols without an abstract adapter layer.',
      groundingProof: 'Derived from ADR-017 & ADR-026 across 10 service migrations.',
      supportingIds: ['ADR-017', 'ADR-026'],
      recurrenceSignal: 'Proven in 4 migrations',
      riskIfNotFollowed: 'Underestimated integration schedule slips by 180% due to downstream deserialization changes.',
    },
    {
      id: 'DNA-02',
      category: 'Data Reliability',
      title: 'Mandatory Consumer Offset Replay and Dead-Letter Semantics',
      axiom: 'Distributed event streams must provide verifiable offset reset and dead-letter queueing before receiving production traffic.',
      groundingProof: 'Derived from INC-009 & EXP-018.',
      supportingIds: ['EXP-018', 'INC-009'],
      recurrenceSignal: 'Proven in 2 production incidents',
      riskIfNotFollowed: 'Ephemeral or uncoordinated restarts lead to 100% dropped message payloads during worker disconnects.',
    },
    {
      id: 'DNA-03',
      category: 'Operational Hygiene',
      title: 'Zero-Blindspot Telemetry Readiness Gate',
      axiom: 'Prometheus exporters, consumer group lag telemetry, and P99 latency alerts must be active in staging 14 days before cutover.',
      groundingProof: 'Derived from INC-011 and INC-004.',
      supportingIds: ['INC-011', 'INC-004'],
      recurrenceSignal: 'Proven in 2 Sev-1 post-mortems',
      riskIfNotFollowed: 'Silent consumer stagnation where messages accumulate undetected until user complaints escalate.',
    },
    {
      id: 'DNA-04',
      category: 'Scaling & Capacity',
      title: 'Dedicated Connection Pooling with Transaction-Mode Sidecars',
      axiom: 'High-density microservice clusters must pool database connections via local sidecars or HA topologies with hard client ceilings.',
      groundingProof: 'Derived from ADR-031 & INC-009.',
      supportingIds: ['ADR-031', 'INC-009'],
      recurrenceSignal: 'Stabilized 80 service replicas',
      riskIfNotFollowed: 'Broker or database connection pool exhaustion cascades into upstream HTTP thread pool starvation.',
    },
    {
      id: 'DNA-05',
      category: 'Cloud FinOps',
      title: 'Locality-Aware Partitioning Across Availability Zones',
      axiom: 'Multi-AZ distributed clusters must configure rack-awareness to prevent inter-zone cross-AZ egress costs and latency penalties.',
      groundingProof: 'Derived from POST_MORTEM-014.',
      supportingIds: ['POST_MORTEM-014'],
      recurrenceSignal: 'Resolved $14.2k monthly invoice leak',
      riskIfNotFollowed: 'Cross-AZ traffic doubles network egress fees and adds 3.8ms round-trip latency to each partition read.',
    },
  ];

  const categories = ['all', 'Architecture Pattern', 'Data Reliability', 'Operational Hygiene', 'Scaling & Capacity', 'Cloud FinOps'];

  const filteredPatterns = organizationalPatterns.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const corpus = [
        p.id,
        p.category,
        p.title,
        p.axiom,
        p.riskIfNotFollowed,
        p.groundingProof,
        p.recurrenceSignal,
        ...p.supportingIds,
      ]
        .join(' ')
        .toLowerCase();

      return searchTerms.every((term) => corpus.includes(term));
    }
    return true;
  });

  const filteredObservations = LEARNED_OBSERVATIONS.filter((obs) => {
    if (!searchQuery.trim()) return true;
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const corpus = [
      obs.id,
      obs.title,
      obs.signalStrength,
      obs.basedOn,
      obs.summary,
      obs.keyRisk,
      obs.recommendedPractice,
      ...obs.supportingExperienceIds,
    ]
      .join(' ')
      .toLowerCase();

    return searchTerms.every((term) => corpus.includes(term));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#202B3D]">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>NovaStack Intelligence Profile</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono text-[#67E8F9]">54 Learned Axioms in Memory</span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1">
          Engineering DNA & Systemic Patterns
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Synthesized operational tendencies, architectural biases, and institutional heuristics derived from real NovaStack outcomes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#141C2B] text-white border border-[#38BDF8]/40 font-medium'
                  : 'text-slate-400 hover:text-slate-200 bg-[#101725] border border-[#202B3D]/70'
              }`}
            >
              {cat === 'all' ? 'All Disciplines' : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search engineering axioms..."
            className="w-full sm:w-64 bg-[#101725] border border-[#202B3D] text-xs text-white placeholder:text-slate-500 rounded px-3 py-1.5 focus:outline-none focus:border-[#635BFF]"
          />
        </div>
      </div>

      {/* Patterns Grid */}
      {filteredPatterns.length === 0 ? (
        <div className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-8 text-center text-xs text-slate-400">
          No engineering DNA patterns found matching your search and filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatterns.map((pattern) => (
          <div
            key={pattern.id}
            className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-5 space-y-3 flex flex-col justify-between hover:border-slate-500 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#202B3D]/70">
                <span className="text-[11px] font-semibold text-[#67E8F9]">{pattern.category}</span>
                <span className="font-mono text-slate-500 text-[10px]">{pattern.id}</span>
              </div>

              <h3 className="text-sm font-bold text-white mt-3 leading-snug">
                {pattern.title}
              </h3>

              <div className="mt-2 p-2.5 bg-[#101725] border border-[#635BFF]/30 rounded text-xs">
                <span className="text-[#7C6CFF] text-[10px] uppercase font-semibold block">
                  Operational Rule:
                </span>
                <p className="text-slate-200 mt-1 leading-relaxed font-medium">
                  "{pattern.axiom}"
                </p>
              </div>

              <div className="mt-3 text-xs space-y-1">
                <span className="text-rose-400 text-[11px] font-medium block">
                  Failure Risk If Violated:
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {pattern.riskIfNotFollowed}
                </p>
              </div>
            </div>

            {/* Traceable Grounding Citations */}
            <div className="pt-3 border-t border-[#202B3D]/50 text-xs">
              <div className="text-[11px] text-slate-500 font-medium mb-1.5 flex items-center justify-between">
                <span>Grounding Proof:</span>
                <span className="font-mono text-emerald-400 text-[10px]">{pattern.recurrenceSignal}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pattern.supportingIds.map((recId) => (
                  <button
                    key={recId}
                    onClick={() => onSelectExperience(recId)}
                    className="font-mono text-[11px] text-[#38BDF8] hover:text-[#67E8F9] bg-[#141C2B] px-2 py-0.5 rounded border border-[#202B3D] flex items-center gap-1 transition-colors hover:border-[#38BDF8]/40"
                    title="Inspect Historical Evidence"
                  >
                    <span>{recId}</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Primary Observations Link */}
      <div className="p-4 bg-[#101725] border border-[#202B3D] rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Validated High-Signal Organizational Tendencies
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {filteredObservations.length} Active {filteredObservations.length === 1 ? 'Signal' : 'Signals'}
          </span>
        </div>
        <div className="space-y-2">
          {filteredObservations.length === 0 ? (
            <div className="p-3 text-xs text-slate-500 italic bg-[#0C111B] rounded border border-[#202B3D]">
              No organizational tendencies match "{searchQuery}".
            </div>
          ) : (
            filteredObservations.map((obs) => (
            <div
              key={obs.id}
              className="p-3 bg-[#0C111B] rounded border border-[#202B3D] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-mono text-slate-400 mr-2 font-semibold">{obs.id}</span>
                <span className="text-slate-200 font-medium">{obs.title}</span>
                <span className="text-slate-500 ml-2">({obs.basedOn})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-medium text-[11px] shrink-0">
                  {obs.signalStrength}
                </span>
                <div className="flex items-center gap-1">
                  {obs.supportingExperienceIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => onSelectExperience(id)}
                      className="font-mono text-[10px] text-[#38BDF8] bg-[#141C2B] px-1.5 py-0.5 rounded hover:border-[#38BDF8]/40 border border-[#202B3D]"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
