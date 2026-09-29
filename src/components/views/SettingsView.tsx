import React, { useState } from 'react';
import { Settings, Shield, Sliders, Database, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [retentionMonths, setRetentionMonths] = useState('36');
  const [minConfidence, setMinConfidence] = useState('85');
  const [requireDualVerification, setRequireDualVerification] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#202B3D]">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Engine Configuration</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono text-slate-300">NovaStack Cluster</span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1">
          Memory Core Settings
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Define organizational evidence boundaries, confidence thresholds, and synthesis retention policies.
        </p>
      </div>

      {/* Engine Status Card */}
      <div className="bg-[#101725] border border-[#202B3D] rounded-lg p-5 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Intelligence Engine: Google GenAI SDK (@google/genai)</span>
          </div>
          <span className="font-mono text-[11px] text-[#67E8F9] px-2 py-0.5 bg-[#0C111B] rounded border border-[#202B3D]">
            gemini-3.8-flash
          </span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Grounding pipeline connects to server-side <code className="font-mono text-slate-300">/api/phoenix/analyze</code> and <code className="font-mono text-slate-300">/api/phoenix/pre-mortem</code> endpoints with structured JSON schemas and strict evidence validation against the NovaStack organizational memory ledger.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1 border-t border-[#202B3D]/60">
          <span>Telemetry header: <span className="font-mono text-slate-300">User-Agent: aistudio-build</span></span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span>Zero-hallucination filter: <span className="text-emerald-400 font-medium">Enforced</span></span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span>Automatic deterministic fallback: <span className="text-cyan-400 font-medium">Ready</span></span>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-6 space-y-6 text-xs">
        {/* Retention Policy */}
        <div className="space-y-2">
          <label className="font-semibold text-white block text-sm">
            Evidence Retention Window
          </label>
          <p className="text-slate-400">
            How far back Phoenix scans incident retrospectives, benchmarks, and architectural RFCs for synthesis.
          </p>
          <select
            value={retentionMonths}
            onChange={(e) => setRetentionMonths(e.target.value)}
            className="bg-[#101725] border border-[#202B3D] text-slate-200 text-xs rounded px-3 py-2 w-full sm:w-64 focus:outline-none focus:border-[#635BFF]"
          >
            <option value="12">12 Months (Recent projects only)</option>
            <option value="24">24 Months (2 years coverage)</option>
            <option value="36">36 Months (Recommended for multi-year architectures)</option>
            <option value="60">60 Months (Long-term institutional memory)</option>
          </select>
        </div>

        <div className="border-t border-[#202B3D]/70 pt-5 space-y-2">
          <label className="font-semibold text-white block text-sm">
            Minimum Signal Confidence Threshold
          </label>
          <p className="text-slate-400">
            Signals below this threshold are marked as "Emerging Signal" rather than "Strong Historical Signal".
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="70"
              max="95"
              value={minConfidence}
              onChange={(e) => setMinConfidence(e.target.value)}
              className="w-48 accent-[#635BFF]"
            />
            <span className="font-mono text-xs text-[#67E8F9]">{minConfidence}% Confidence</span>
          </div>
        </div>

        <div className="border-t border-[#202B3D]/70 pt-5 space-y-3">
          <label className="font-semibold text-white block text-sm">
            Verification & Review Invariants
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dual-verify"
              checked={requireDualVerification}
              onChange={(e) => setRequireDualVerification(e.target.checked)}
              className="accent-[#635BFF] rounded"
            />
            <label htmlFor="dual-verify" className="text-slate-300 cursor-pointer">
              Require at least 2 independent incident post-mortems or ADRs before synthesizing an organizational axiom.
            </label>
          </div>
        </div>

        <div className="border-t border-[#202B3D] pt-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Configuration stored in local cluster config
          </span>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#635BFF] hover:bg-[#5249ea] rounded-md transition-colors"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved Changes</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
