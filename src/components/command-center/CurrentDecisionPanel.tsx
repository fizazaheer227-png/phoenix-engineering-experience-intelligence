import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  ArrowRight,
  Check,
  ListFilter,
  HelpCircle,
  Cpu,
  Layers,
  Info,
  Scale,
  Compass,
} from 'lucide-react';
import { DecisionContext, DecisionAnalysisResult } from '../../types/phoenix';
import { analyzeDecision } from '../../services/intelligenceService';
import { AVAILABLE_DECISIONS } from '../../data/mockMemory';

interface CurrentDecisionPanelProps {
  decision: DecisionContext;
  onUpdateDecision: (updated: DecisionContext) => void;
  onSelectExperience: (id: string) => void;
  onNavigateToPreMortem: () => void;
  externalAnalysisResult?: DecisionAnalysisResult | null;
  onAnalysisComplete?: (result: DecisionAnalysisResult) => void;
}

export const CurrentDecisionPanel: React.FC<CurrentDecisionPanelProps> = ({
  decision,
  onUpdateDecision,
  onSelectExperience,
  onNavigateToPreMortem,
  externalAnalysisResult,
  onAnalysisComplete,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisResult, setAnalysisResult] = useState<DecisionAnalysisResult | null>(externalAnalysisResult || null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showExplainability, setShowExplainability] = useState(false);

  // Edit fields
  const [questionText, setQuestionText] = useState(decision.question);
  const [scopeText, setScopeText] = useState(decision.scope);
  const [throughputText, setThroughputText] = useState(decision.targetThroughput);
  const [servicesText, setServicesText] = useState(decision.impactedServices.join(', '));
  const [showFullPrecedents, setShowFullPrecedents] = useState(false);

  // Sync when decision changes from outside
  useEffect(() => {
    setQuestionText(decision.question);
    setScopeText(decision.scope);
    setThroughputText(decision.targetThroughput);
    setServicesText(decision.impactedServices.join(', '));
    if (externalAnalysisResult) {
      setAnalysisResult(externalAnalysisResult);
    }
  }, [decision, externalAnalysisResult]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep('Retrieving organizational memory…');

    try {
      const result = await analyzeDecision(
        {
          ...decision,
          question: questionText,
          scope: scopeText,
          targetThroughput: throughputText,
          impactedServices: servicesText.split(',').map((s) => s.trim()).filter(Boolean),
        },
        undefined,
        (step) => setAnalysisStep(step)
      );

      setAnalysisResult(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleSaveEdit = () => {
    const updated: DecisionContext = {
      ...decision,
      question: questionText,
      scope: scopeText,
      targetThroughput: throughputText,
      impactedServices: servicesText.split(',').map((s) => s.trim()).filter(Boolean),
    };
    onUpdateDecision(updated);
    setIsEditing(false);
  };

  const handleSelectPreset = (preset: DecisionContext) => {
    onUpdateDecision(preset);
    setQuestionText(preset.question);
    setScopeText(preset.scope);
    setThroughputText(preset.targetThroughput);
    setServicesText(preset.impactedServices.join(', '));
    setShowPresets(false);
    setIsEditing(false);
    setAnalysisResult(null);
  };

  const isGeminiEngine = analysisResult?.sourceEngine === 'gemini';

  return (
    <div className="bg-[#101725] border border-[#202B3D] rounded-lg p-6 relative shadow-sm">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#202B3D]/70">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-[#67E8F9] tracking-tight">
              {decision.id}
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-xs text-slate-400">Active Organizational RFC</span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-xs text-slate-400">Owner: {decision.submittedBy}</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            What are you deciding?
          </h3>
        </div>

        {/* Preset Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-[#141C2B] hover:bg-[#1a253b] border border-[#202B3D] rounded transition-colors"
          >
            <ListFilter className="w-3 h-3 text-[#38BDF8]" />
            <span>Load Stored Decision</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showPresets && (
            <div className="absolute right-0 mt-1 w-80 bg-[#0C111B] border border-[#202B3D] rounded-md shadow-xl z-30 p-1 divide-y divide-[#202B3D]">
              <div className="p-2 text-[10px] uppercase font-semibold text-slate-400">
                NovaStack Active RFCs
              </div>
              <div className="py-1">
                {AVAILABLE_DECISIONS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                      decision.id === preset.id
                        ? 'bg-[#141C2B] text-[#67E8F9]'
                        : 'text-slate-300 hover:bg-[#101725]'
                    }`}
                  >
                    <div className="font-mono text-[10px] text-slate-400">{preset.id}</div>
                    <div className="font-medium truncate">{preset.question}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decision Question Area */}
      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-3 bg-[#0C111B] p-4 rounded border border-[#635BFF]/50">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Decision Question
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full bg-[#101725] border border-[#202B3D] text-white text-sm font-medium rounded p-2.5 focus:outline-none focus:border-[#635BFF]"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Scope</label>
                <input
                  type="text"
                  value={scopeText}
                  onChange={(e) => setScopeText(e.target.value)}
                  className="w-full bg-[#101725] border border-[#202B3D] text-white p-2 rounded focus:outline-none focus:border-[#635BFF]"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Throughput</label>
                <input
                  type="text"
                  value={throughputText}
                  onChange={(e) => setThroughputText(e.target.value)}
                  className="w-full bg-[#101725] border border-[#202B3D] text-white p-2 rounded focus:outline-none focus:border-[#635BFF]"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Impacted Services (comma separated)</label>
                <input
                  type="text"
                  value={servicesText}
                  onChange={(e) => setServicesText(e.target.value)}
                  className="w-full bg-[#101725] border border-[#202B3D] text-white p-2 rounded focus:outline-none focus:border-[#635BFF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#202B3D]">
              <button
                onClick={() => {
                  setQuestionText(decision.question);
                  setScopeText(decision.scope);
                  setThroughputText(decision.targetThroughput);
                  setServicesText(decision.impactedServices.join(', '));
                  setIsEditing(false);
                }}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="text-xs text-white bg-[#635BFF] hover:bg-[#5249ea] px-4 py-1.5 rounded transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Decision Context</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="group flex items-start justify-between gap-3">
            <p className="text-base font-semibold text-white leading-relaxed">
              "{decision.question}"
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors shrink-0 underline decoration-slate-600 underline-offset-4"
            >
              Edit decision
            </button>
          </div>
        )}
      </div>

      {/* Context Tags (Zero-Pill Discipline: unboxed typographic text metadata) */}
      {!isEditing && (
        <div className="mt-4 pt-3 border-t border-[#202B3D]/60 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 font-medium">Scope:</span>{' '}
            <span className="text-slate-200">{decision.scope}</span>
          </div>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
          <div>
            <span className="text-slate-500 font-medium">Target Throughput:</span>{' '}
            <span className="font-mono text-slate-200 tabular-nums">{decision.targetThroughput}</span>
          </div>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
          <div>
            <span className="text-slate-500 font-medium">Impacted Services:</span>{' '}
            <span className="font-mono text-slate-200">{decision.impactedServices.join(', ')}</span>
          </div>
        </div>
      )}

      {/* Precedents Row */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="text-slate-500 font-medium flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-[#38BDF8]" />
          Precedents:
        </span>
        {decision.precedentIds.map((precId, index) => (
          <React.Fragment key={precId}>
            {index > 0 && <span className="text-slate-600" aria-hidden="true">·</span>}
            <button
              onClick={() => onSelectExperience(precId)}
              className="text-slate-300 hover:text-[#38BDF8] flex items-center gap-1 group transition-colors"
            >
              <span className="font-mono text-slate-400 group-hover:text-[#38BDF8]">{precId}</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-[#38BDF8]" />
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Primary Action Buttons */}
      <div className="mt-5 pt-4 border-t border-[#202B3D] flex flex-wrap items-center gap-3">
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#635BFF] hover:bg-[#5249ea] rounded-md transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CFF] disabled:opacity-60 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAnalyzing ? 'Analyzing with Phoenix...' : 'Analyze with Phoenix'}</span>
        </button>

        <button
          onClick={onNavigateToPreMortem}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-[#141C2B] hover:bg-[#1a253a] border border-[#202B3D] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Run Pre-Mortem</span>
        </button>

        <div className="ml-auto text-[11px] text-slate-500 hidden sm:block">
          Evidence engine ready · {decision.precedentIds.length} direct precedents identified
        </div>
      </div>

      {/* Real-time Analysis Progress Banner */}
      {isAnalyzing && (
        <div className="mt-4 p-3 bg-[#0C111B] border border-[#635BFF]/40 rounded text-xs flex items-center gap-2.5 animate-pulse">
          <div className="w-3.5 h-3.5 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-slate-300 font-mono">{analysisStep}</span>
        </div>
      )}

      {/* Analysis Result Drawer / Expansion */}
      {analysisResult && !isAnalyzing && (
        <div className="mt-5 pt-5 border-t border-[#202B3D] bg-[#0C111B]/80 rounded-md p-4 space-y-4 animate-in fade-in duration-200">
          {/* Engine Provenance Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#202B3D]/70 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isGeminiEngine ? 'bg-[#7C6CFF]' : 'bg-cyan-400'}`} />
              <span className="font-semibold text-slate-200">
                {isGeminiEngine
                  ? `Gemini (${analysisResult.modelUsed || 'Flash'}) · Grounded Reasoning`
                  : 'Local Memory Engine · Deterministic Fallback'}
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono text-xs text-[#67E8F9] tabular-nums">
                Confidence: {analysisResult.confidenceScore}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              {analysisResult.explainability && (
                <button
                  onClick={() => setShowExplainability(!showExplainability)}
                  className="flex items-center gap-1 text-[11px] text-[#38BDF8] hover:underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showExplainability ? 'Hide Explainability' : 'Why does Phoenix think this?'}</span>
                </button>
              )}
              <button
                onClick={() => setAnalysisResult(null)}
                className="text-slate-500 hover:text-slate-300 text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Verdict Summary */}
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {analysisResult.verdictSummary}
          </p>

          {/* Primary Risk Box */}
          <div className="bg-[#141C2B] border border-amber-500/30 rounded p-3 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-300">Primary Risk Signal</div>
              <div className="text-slate-300 mt-0.5 leading-relaxed">
                {analysisResult.primaryRisk}
              </div>
            </div>
          </div>

          {/* Phoenix Reflection: What happened before vs what organization believed vs actual */}
          {analysisResult.reflection && (
            <div className="bg-[#101725] border border-[#202B3D] rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Compass className="w-4 h-4 text-[#38BDF8]" />
                <span>Phoenix Hindsight Reflection</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-[#0C111B] rounded border border-[#202B3D]/70">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                    What The Organization Believed Then:
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {analysisResult.reflection.whatOrganizationBelieved}
                  </p>
                </div>

                <div className="p-2.5 bg-[#0C111B] rounded border border-[#202B3D]/70">
                  <span className="text-[10px] font-semibold uppercase text-emerald-400 block">
                    What Actually Happened In Production:
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {analysisResult.reflection.whatActuallyHappened}
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#141C2B] rounded border border-[#635BFF]/30 text-xs">
                <span className="text-[10px] font-semibold uppercase text-[#7C6CFF] block">
                  Why This History Matters To This Decision Now:
                </span>
                <p className="text-slate-200 mt-1 leading-relaxed font-medium">
                  {analysisResult.reflection.whyHistoryMattersNow}
                </p>
              </div>
            </div>
          )}

          {/* Contradictions & Trade-Offs Considered */}
          {analysisResult.contradictions && analysisResult.contradictions.length > 0 && (
            <div className="p-3 bg-[#101725] rounded border border-[#202B3D] text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Historical Contradictions & Trade-Offs Evaluated</span>
              </div>
              <ul className="space-y-1">
                {analysisResult.contradictions.map((c, i) => (
                  <li key={i} className="text-slate-300 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-amber-400">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Guardrails */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Mandatory Guardrails (Derived from Historical Precedents)
            </div>
            <ul className="space-y-1.5">
              {analysisResult.recommendedGuardrails.map((guardrail, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{guardrail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Precedents Detailed Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-300">
                Grounding Evidence Sources
              </div>
              <button
                onClick={() => setShowFullPrecedents(!showFullPrecedents)}
                className="text-[11px] text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                <span>{showFullPrecedents ? 'Show less' : 'View precedent breakdown'}</span>
                {showFullPrecedents ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {showFullPrecedents && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-2">
                {analysisResult.historicalPrecedents.map((item) => (
                  <div
                    key={item.experienceId}
                    onClick={() => onSelectExperience(item.experienceId)}
                    className="p-2.5 bg-[#101725] border border-[#202B3D] rounded hover:border-[#38BDF8]/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#38BDF8] font-semibold">{item.experienceId}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.similarity}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 mt-1 truncate group-hover:text-white">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-rose-300 mt-1 line-clamp-1">
                      Outcome: {item.historicalOutcome}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {item.takeaway}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Explainability Breakdown ("Why does Phoenix think this?") */}
          {showExplainability && analysisResult.explainability && (
            <div className="mt-4 p-4 bg-[#080C14] border border-[#38BDF8]/40 rounded-lg space-y-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#202B3D]">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <HelpCircle className="w-4 h-4 text-[#38BDF8]" />
                  <span>Explainability Dossier: Why Phoenix Thinks This</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  Grounding Invariant Verified
                </span>
              </div>

              {/* Evidence vs Inference Table */}
              <div>
                <div className="text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                  Historical Fact vs. AI Inference
                </div>
                <div className="space-y-2">
                  {analysisResult.explainability.evidenceVsInference.map((evi, idx) => (
                    <div key={idx} className="p-2.5 bg-[#101725] rounded border border-[#202B3D] grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-mono text-[10px] text-cyan-400 block font-semibold">
                          [HISTORICAL FACT]
                        </span>
                        <p className="text-slate-300 mt-0.5">{evi.historicalFact}</p>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-[#7C6CFF] block font-semibold">
                          [AI INFERENCE]
                        </span>
                        <p className="text-slate-200 mt-0.5">{evi.aiInference}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cited Evidence Excerpts */}
              <div>
                <div className="text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                  Grounding Evidence Excerpts
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {analysisResult.explainability.evidenceRecordsUsed.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => onSelectExperience(rec.id)}
                      className="p-2 bg-[#101725] rounded border border-[#202B3D] cursor-pointer hover:border-[#38BDF8]/50 transition-colors"
                    >
                      <div className="font-mono text-[#38BDF8] font-semibold text-[11px]">
                        {rec.id}
                      </div>
                      <div className="text-[11px] text-slate-200 font-medium truncate mt-0.5">
                        {rec.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        "{rec.groundedExcerpt}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action to proceed to Pre-Mortem */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onNavigateToPreMortem}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-100 bg-[#141C2B] hover:bg-[#1f2b3e] border border-[#635BFF]/40 rounded transition-colors"
            >
              <span>Proceed to Pre-Mortem Simulation</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#67E8F9]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
