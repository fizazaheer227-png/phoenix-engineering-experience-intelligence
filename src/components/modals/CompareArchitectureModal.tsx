import React, { useState } from 'react';
import { X, Columns, Check, AlertTriangle, ArrowRight, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface CompareArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExperience?: (id: string) => void;
}

export const CompareArchitectureModal: React.FC<CompareArchitectureModalProps> = ({
  isOpen,
  onClose,
  onSelectExperience,
}) => {
  if (!isOpen) return null;

  type ComparisonKey = 'rabbitmq-kafka' | 'redis-kafka' | 'postgres-pgbouncer' | 'locality-routing';

  const [selectedPair, setSelectedPair] = useState<ComparisonKey>('rabbitmq-kafka');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-[#0C111B] border border-[#202B3D] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#202B3D] flex items-start justify-between bg-[#101725]">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[#38BDF8] font-semibold">ARCH-COMPARE</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">Historical Evidence Matrix</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Compare Architecture Paradigms
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Grounded comparisons synthesized from NovaStack benchmark spikes, ADRs, and incidents.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#141C2B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pair Selector Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-[#202B3D]/70 bg-[#0C111B] flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedPair('rabbitmq-kafka')}
            className={`px-3 py-1.5 font-medium rounded transition-colors shrink-0 ${
              selectedPair === 'rabbitmq-kafka'
                ? 'bg-[#141C2B] text-white border border-[#38BDF8]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RabbitMQ vs Apache Kafka (Current Context)
          </button>
          <button
            onClick={() => setSelectedPair('redis-kafka')}
            className={`px-3 py-1.5 font-medium rounded transition-colors shrink-0 ${
              selectedPair === 'redis-kafka'
                ? 'bg-[#141C2B] text-white border border-[#38BDF8]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Redis Pub/Sub vs Kafka (EXP-018)
          </button>
          <button
            onClick={() => setSelectedPair('postgres-pgbouncer')}
            className={`px-3 py-1.5 font-medium rounded transition-colors shrink-0 ${
              selectedPair === 'postgres-pgbouncer'
                ? 'bg-[#141C2B] text-white border border-[#38BDF8]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct DB vs PgBouncer (ADR-031)
          </button>
          <button
            onClick={() => setSelectedPair('locality-routing')}
            className={`px-3 py-1.5 font-medium rounded transition-colors shrink-0 ${
              selectedPair === 'locality-routing'
                ? 'bg-[#141C2B] text-white border border-[#38BDF8]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Multi-AZ vs Rack-Aware (FinOps)
          </button>
        </div>

        {/* Content Comparison Grid */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {selectedPair === 'rabbitmq-kafka' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RabbitMQ Column */}
                <div className="bg-[#101725] border border-[#202B3D] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#202B3D] pb-2">
                    <span className="font-bold text-white text-sm">RabbitMQ (Current)</span>
                    <span className="text-[10px] text-slate-400 font-mono">In Production Since 2023</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Observed Strengths:</span>
                    <p className="text-slate-200 mt-1">
                      Flexible AMQP routing keys, per-message acknowledgments, straightforward dead-letter routing without consumer coordinate management.
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Observed Failure Modes in NovaStack:</span>
                    <p className="text-rose-300 mt-1">
                      INC-009: Connection pool exhaustion during reconnect waves. Queue memory pressure when consumer throughput lags behind burst dispatch (&gt;28k msg/s).
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Historical Max Throughput:</span>
                    <p className="font-mono text-slate-200 mt-1 tabular-nums">28,400 msg/s peak (cluster saturated)</p>
                  </div>
                </div>

                {/* Kafka Column */}
                <div className="bg-[#101725] border border-[#635BFF]/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#202B3D] pb-2">
                    <span className="font-bold text-[#67E8F9] text-sm">Apache Kafka (Target)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Verified in EXP-024</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Observed Strengths:</span>
                    <p className="text-slate-200 mt-1">
                      Partition log persistence, deterministic consumer replay, horizontal partition scaling to &gt;180k msg/s without broker memory ballooning.
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Observed Failure Modes in NovaStack:</span>
                    <p className="text-amber-300 mt-1">
                      ADR-017 & INC-011: Consumer rebalancing storms, complex partition reassignments, and requirement for strict consumer lag observability prior to cutover.
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Historical Max Throughput:</span>
                    <p className="font-mono text-emerald-300 mt-1 tabular-nums">184,000 msg/s peak (EXP-024 sustained 4.2M/day)</p>
                  </div>
                </div>
              </div>

              {/* Architectural Recommendation Callout */}
              <div className="p-4 bg-[#141C2B] border border-[#202B3D] rounded-lg">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Phoenix Organizational Recommendation</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Proceed with Kafka migration strictly if target throughput exceeds 30k msg/s (NovaStack requirement is 120k msg/s).
                  However, budget a mandatory 2-week schedule buffer specifically for client SDK backpressure tuning, as demonstrated by the 11-day slip in ADR-017.
                </p>
              </div>
            </div>
          )}

          {selectedPair === 'redis-kafka' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#101725] border border-[#202B3D] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#202B3D] pb-2">
                    <span className="font-bold text-white text-sm">Redis Pub/Sub</span>
                    <span className="text-[10px] text-slate-400 font-mono">Evaluated in EXP-018</span>
                  </div>
                  <p className="text-slate-200">
                    Sub-millisecond dispatch latency with minimal infrastructure overhead, but fire-and-forget semantics cause complete message loss on worker disconnects.
                  </p>
                  <div className="text-[11px] text-rose-300">
                    Data Loss: 100% on subscriber disconnection. No replay offset.
                  </div>
                </div>

                <div className="bg-[#101725] border border-[#202B3D] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#202B3D] pb-2">
                    <span className="font-bold text-[#67E8F9] text-sm">Kafka Partition Log</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Selected Standard</span>
                  </div>
                  <p className="text-slate-200">
                    Persistent log storage enables consumer catch-up, reprocessing of dead messages, and audit trail compliance for financial notifications.
                  </p>
                  <div className="text-[11px] text-emerald-300">
                    Durability: Partition commit log guarantees zero dropped events.
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPair === 'postgres-pgbouncer' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#101725] border border-[#202B3D] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#202B3D] pb-2">
                    <span className="font-bold text-white text-sm">Direct Microservice Connections</span>
                    <span className="text-[10px] text-rose-400 font-mono">Contention Risk</span>
                  </div>
                  <p className="text-slate-200">
                    80 Kubernetes pods each maintaining 15-20 database connections easily saturated PostgreSQL process table at 1,200 active connections, degrading P99 to 82ms.
                  </p>
                </div>

                <div className="bg-[#101725] border border-[#202B3D] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#202B3D] pb-2">
                    <span className="font-bold text-[#67E8F9] text-sm">PgBouncer (Transaction Mode)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Verified in ADR-031</span>
                  </div>
                  <p className="text-slate-200">
                    Multiplexed 1,200 client connections down to 48 backend database processes, stabilizing P99 latency at 4.2ms with zero application contention.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedPair === 'locality-routing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#101725] border border-[#202B3D] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#202B3D] pb-2">
                    <span className="font-bold text-white text-sm">Blind Multi-AZ Cross Routing</span>
                    <span className="text-[10px] text-rose-400 font-mono">Invoice Anomaly</span>
                  </div>
                  <p className="text-slate-200">
                    POST_MORTEM-014 discovered consumers in us-east-1a reading from partition leaders in us-east-1b without rack-awareness, creating a $14.2k monthly egress bill leak and +3.8ms latency penalty.
                  </p>
                </div>

                <div className="bg-[#101725] border border-[#202B3D] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#202B3D] pb-2">
                    <span className="font-bold text-[#67E8F9] text-sm">Rack-Aware Ingestion Routing</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Resolved $14.2k/mo</span>
                  </div>
                  <p className="text-slate-200">
                    Configuring rack-awareness allowed Kafka consumers to fetch from local in-AZ replicas, reducing cross-AZ transfer by 78% and eliminating round-trip transport delay.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#202B3D] bg-[#101725] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-200 bg-[#141C2B] hover:bg-[#1f2c42] border border-[#202B3D] rounded transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
