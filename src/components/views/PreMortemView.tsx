import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  Clock,
  ListFilter,
  Check,
  Download,
  AlertCircle,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DecisionContext, PreMortemScenario } from '../../types/phoenix';
import { generatePreMortem } from '../../services/intelligenceService';
import { AVAILABLE_DECISIONS } from '../../data/mockMemory';

interface PreMortemViewProps {
  decision: DecisionContext;
  onUpdateDecision: (d: DecisionContext) => void;
  onSelectExperience: (id: string) => void;
  onNavigateToCommandCenter: () => void;
  onOpenExport?: () => void;
}

export const PreMortemView: React.FC<PreMortemViewProps> = ({
  decision,
  onUpdateDecision,
  onSelectExperience,
  onNavigateToCommandCenter,
  onOpenExport,
}) => {
  const [scenarios, setScenarios] = useState<PreMortemScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [showDecisionPicker, setShowDecisionPicker] = useState(false);

  // Load scenarios for current decision
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadingStep('Retrieving organizational memory…');

    generatePreMortem(decision, undefined, (step) => {
      if (isMounted) setLoadingStep(step);
    }).then((res) => {
      if (isMounted) {
        setScenarios(res);
        setIsLoading(false);
        setLoadingStep('');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [decision]);

  const handleSimulate = async () => {
    setIsLoading(true);
    setLoadingStep('Retrieving organizational memory…');
    try {
      const res = await generatePreMortem(decision, undefined, (step) => {
        setLoadingStep(step);
      });
      setScenarios(res);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleToggleMitigation = (id: string) => {
    setScenarios((prev) =>
      prev.map((scen) => {
        if (scen.id !== id) return scen;
        const current = scen.mitigationStatus || 'unmitigated';
        const next: PreMortemScenario['mitigationStatus'] =
          current === 'unmitigated' ? 'in_progress' : current === 'in_progress' ? 'mitigated' : 'unmitigated';
        return { ...scen, mitigationStatus: next };
      })
    );
  };

  const isGeminiEngine = scenarios.some((s) => s.sourceEngine === 'gemini');
  const mitigatedCount = scenarios.filter((s) => s.mitigationStatus === 'mitigated').length;
  const inProgressCount = scenarios.filter((s) => s.mitigationStatus === 'in_progress').length;
  const readinessPct = scenarios.length > 0 ? Math.round(((mitigatedCount + inProgressCount * 0.5) / scenarios.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202B3D]">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Failure Mode Synthesis</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="font-mono text-amber-400">Evidence-Grounded Pre-Mortem</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Pre-Mortem Simulation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Predicting prospective failure vectors for active decisions based on previous incident post-mortems and ADRs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#101725] hover:bg-[#141C2B] border border-[#202B3D] rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Re-simulating...' : 'Re-run Pre-Mortem'}</span>
          </button>

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#635BFF] hover:bg-[#5249ea] rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
          )}

          <button
            onClick={onNavigateToCommandCenter}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Back to Command Center
          </button>
        </div>
      </div>

      {/* Target Decision Banner */}
      <div className="p-4 bg-[#101725] border border-[#202B3D] rounded-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>Subject Decision Under Pre-Mortem</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-[10px] font-mono text-[#38BDF8]">
                {isGeminiEngine
                  ? `Gemini (${scenarios[0]?.modelUsed || 'Flash'}) Grounded`
                  : 'Local Memory Engine · Deterministic Fallback'}
              </span>
            </div>
            <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-2">
              <span className="font-mono text-[#67E8F9]">{decision.id}</span>
              <span>—</span>
              <span>{decision.question}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Scope: {decision.scope}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono">Throughput: {decision.targetThroughput}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span>Impacted: {decision.impactedServices.join(', ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Decision selector */}
            <div className="relative">
              <button
                onClick={() => setShowDecisionPicker(!showDecisionPicker)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-[#141C2B] hover:bg-[#1a253a] border border-[#202B3D] rounded transition-colors"
              >
                <ListFilter className="w-3 h-3 text-[#38BDF8]" />
                <span>Switch Decision</span>
              </button>

              {showDecisionPicker && (
                <div className="absolute right-0 mt-1 w-72 bg-[#0C111B] border border-[#202B3D] rounded-md shadow-xl z-30 p-1 divide-y divide-[#202B3D]">
                  <div className="p-2 text-[10px] uppercase font-semibold text-slate-400">
                    Select Decision to Evaluate
                  </div>
                  <div className="py-1">
                    {AVAILABLE_DECISIONS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          onUpdateDecision(d);
                          setShowDecisionPicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                          d.id === decision.id ? 'bg-[#141C2B] text-[#67E8F9]' : 'text-slate-300 hover:bg-[#101725]'
                        }`}
                      >
                        <div className="font-mono text-[10px] text-slate-400">{d.id}</div>
                        <div className="font-medium truncate">{d.question}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cutover Readiness Indicator */}
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400">Cutover Readiness</div>
              <div className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
                {readinessPct}%
              </div>
            </div>
          </div>
        </div>

        {/* Readiness Progress Bar */}
        <div className="pt-2 border-t border-[#202B3D]/70 flex items-center justify-between text-xs text-slate-400">
          <div className="w-full bg-[#0C111B] h-1.5 rounded-full overflow-hidden mr-3">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${readinessPct}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-[11px] text-slate-300">
            {mitigatedCount} of {scenarios.length} mitigated
          </span>
        </div>
      </div>

      {/* Scenarios Grid */}
      {isLoading ? (
        <div className="p-12 text-center bg-[#0C111B] border border-[#202B3D] rounded-lg">
          <div className="w-6 h-6 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="mt-3 text-xs text-slate-300 font-mono">
            {loadingStep || 'Reconstructing failure patterns from organizational memory…'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {scenarios.map((scen, idx) => {
            const status = scen.mitigationStatus || 'unmitigated';
            return (
              <div
                key={scen.id}
                className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-5 space-y-4"
              >
                {/* Scenario Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#202B3D]/70">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold text-amber-400 mt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {scen.failureMode}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Historical Precedent Proof: {scen.historicalIncidentProof}
                      </div>
                      {scen.affectedArea && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Affected Subsystem: <span className="text-slate-300">{scen.affectedArea}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <div className="text-xs flex items-center gap-1 font-mono">
                      <span className="text-slate-500">Probability:</span>
                      <span className="text-rose-400 font-semibold">{scen.probability}</span>
                    </div>

                    <button
                      onClick={() => onSelectExperience(scen.precedentId)}
                      className="font-mono text-xs text-[#38BDF8] hover:text-[#67E8F9] bg-[#141C2B] px-2 py-0.5 rounded border border-[#202B3D] flex items-center gap-1 transition-colors"
                      title="Inspect Incident Post-Mortem"
                    >
                      <span>{scen.precedentId}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>

                    {/* Interactive Mitigation Status Toggle */}
                    <button
                      onClick={() => handleToggleMitigation(scen.id)}
                      className={`px-2.5 py-0.5 text-xs font-medium rounded border transition-colors flex items-center gap-1 ${
                        status === 'mitigated'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : status === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {status === 'mitigated' && <Check className="w-3 h-3" />}
                      <span>
                        {status === 'mitigated'
                          ? 'Mitigated'
                          : status === 'in_progress'
                          ? 'In Progress'
                          : 'Unmitigated (Click to toggle)'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Scenario Body */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#101725] rounded border border-[#202B3D]/70">
                    <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Early Warning Indicator (Telemetry & Logs)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {scen.earlyWarningIndicator}
                    </p>
                  </div>

                  <div className="p-3 bg-[#141C2B] rounded border border-[#202B3D]/70">
                    <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Required Mitigation Before Production Cutover</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      {scen.requiredMitigationBeforeCutover}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
