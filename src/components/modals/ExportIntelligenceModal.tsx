import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { CURRENT_DECISION, LEARNED_OBSERVATIONS, MOCK_EXPERIENCES } from '../../data/mockMemory';
import { DecisionContext, Experience } from '../../types/phoenix';

interface ExportIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision?: DecisionContext;
}

export const ExportIntelligenceModal: React.FC<ExportIntelligenceModalProps> = ({
  isOpen,
  onClose,
  decision = CURRENT_DECISION,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'markdown' | 'json'>('markdown');

  const precedentRecords = decision.precedentIds
    .map((id) => MOCK_EXPERIENCES.find((e) => e.id === id))
    .filter(Boolean) as Experience[];

  const markdownContent = `# Phoenix Engineering Experience Intelligence Brief
Organization: NovaStack Core Platform
Generated: ${new Date().toISOString().split('T')[0]}
Active RFC: ${decision.id} - ${decision.question}

## Current Decision Context
- Scope: ${decision.scope}
- Target Throughput: ${decision.targetThroughput}
- Impacted Services: ${decision.impactedServices.join(', ')}
- Proposed Tech: ${decision.proposedTech}
- Current Tech: ${decision.currentTech}
- Submitted By: ${decision.submittedBy}

## Grounding Precedents & Empirical Evidence
${precedentRecords.length > 0 ? precedentRecords.map((exp, i) => `${i + 1}. ${exp.id}: ${exp.title}
   - Outcome: ${exp.outcome}
   - Lesson: ${exp.lesson}
   - Root Cause Reflection: ${exp.reflection || exp.evidenceSummary.slice(0, 120)}...`).join('\n\n') : 'No specific precedents pinned yet.'}

## Organizational Axioms & Learned Signals
${LEARNED_OBSERVATIONS.map((obs) => `- ${obs.id}. ${obs.title} (${obs.signalStrength}): ${obs.summary}`).join('\n')}

---
Verified by Phoenix Engineering Experience Intelligence Engine.
`;

  const jsonContent = JSON.stringify(
    {
      app: 'Phoenix Engineering Experience Intelligence',
      organization: 'NovaStack',
      generatedAt: new Date().toISOString(),
      activeDecision: decision,
      pinnedPrecedents: precedentRecords,
      observations: LEARNED_OBSERVATIONS,
      indexedExperiencesCount: MOCK_EXPERIENCES.length,
    },
    null,
    2
  );

  const activeContent = format === 'markdown' ? markdownContent : jsonContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeContent], {
      type: format === 'markdown' ? 'text/markdown' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phoenix-intelligence-${decision.id.toLowerCase()}.${format === 'markdown' ? 'md' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0C111B] border border-[#202B3D] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#202B3D] flex items-start justify-between bg-[#101725]">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[#67E8F9] font-semibold">{decision.id}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">Intelligence Dossier Export</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Export Organizational Intelligence
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#141C2B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="px-6 py-3 border-b border-[#202B3D]/70 bg-[#0C111B] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFormat('markdown')}
              className={`px-3 py-1 font-medium rounded transition-colors ${
                format === 'markdown'
                  ? 'bg-[#141C2B] text-white border border-[#635BFF]/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Markdown Brief (.md)
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`px-3 py-1 font-medium rounded transition-colors ${
                format === 'json'
                  ? 'bg-[#141C2B] text-white border border-[#635BFF]/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Structured JSON (.json)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-200 bg-[#141C2B] border border-[#202B3D] rounded hover:text-white hover:bg-[#1a253a] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-[#635BFF] rounded hover:bg-[#5249ea] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Preview Code View */}
        <div className="p-4 bg-[#070A0F] overflow-y-auto flex-1 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap select-all border-b border-[#202B3D]">
          {activeContent}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#101725] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#141C2B] border border-[#202B3D] rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
