import React, { useState } from 'react';
import {
  X,
  FileText,
  Activity,
  BookmarkPlus,
  Check,
  Copy,
  Compass,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Experience } from '../../types/phoenix';

interface ExperienceDetailModalProps {
  experience: Experience | null;
  onClose: () => void;
  onPinAsPrecedent?: (experienceId: string) => void;
  isPinned?: boolean;
}

export const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({
  experience,
  onClose,
  onPinAsPrecedent,
  isPinned = false,
}) => {
  if (!experience) return null;

  const [copied, setCopied] = useState(false);
  const isIncident = experience.type === 'INC' || experience.type === 'POST_MORTEM';

  const handleCopyRef = () => {
    navigator.clipboard.writeText(`${experience.id}: ${experience.title}\nOutcome: ${experience.outcome}\nLesson: ${experience.lesson}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-[#0C111B] border border-[#202B3D] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#202B3D] flex items-start justify-between gap-4 bg-[#101725]">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-semibold text-[#38BDF8]">
                {experience.id}
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400 font-medium">{experience.type} Record</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">{experience.system}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {experience.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRef}
              className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-[#141C2B] transition-colors"
              title="Copy Reference"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-[#141C2B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#101725] rounded border border-[#202B3D]/70">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Domain</div>
              <div className="text-slate-200 mt-0.5 truncate">{experience.domain}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Recorded Date</div>
              <div className="text-slate-200 mt-0.5 font-mono">{experience.date}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Team</div>
              <div className="text-slate-200 mt-0.5 truncate">{experience.team}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Authors</div>
              <div className="text-slate-200 mt-0.5 truncate">{experience.authors.join(', ')}</div>
            </div>
          </div>

          {/* Complete Engineering Experience Progression */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              The Experience Progression
            </div>

            {/* Expected vs Actual Outcome Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded bg-[#101725] border border-[#202B3D]">
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Initial Intent / Expected Outcome</span>
                </div>
                <div className="mt-1 text-slate-300 leading-relaxed">
                  {experience.expectedOutcome || 'Standard architectural rollout assumed to complete on regular sprint cadence.'}
                </div>
              </div>

              <div className="p-3 rounded bg-[#141C2B] border border-[#202B3D]">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  {isIncident ? (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Production Reality / Actual Outcome</span>
                </div>
                <div className={`mt-1 font-semibold ${isIncident ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {experience.outcome}
                </div>
              </div>
            </div>

            {/* Reflection / Root Cause */}
            {experience.reflection && (
              <div className="p-3 rounded bg-[#101725] border border-[#202B3D]">
                <div className="text-[11px] font-semibold text-amber-300 mb-1">
                  Organizational Reflection & Root Cause Analysis
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {experience.reflection}
                </p>
              </div>
            )}

            {/* Extracted Organizational Lesson */}
            <div className="p-3.5 rounded bg-[#101725] border border-[#635BFF]/40">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#7C6CFF]">
                <Activity className="w-3.5 h-3.5" />
                <span>Extracted Organizational Lesson</span>
              </div>
              <p className="mt-1.5 text-sm text-white leading-relaxed font-semibold">
                "{experience.lesson}"
              </p>
            </div>
          </div>

          {/* Detailed Evidence Summary */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide text-[11px]">
              Evidence Summary
            </h4>
            <div className="p-3 bg-[#101725] border border-[#202B3D]/70 rounded leading-relaxed text-slate-300">
              {experience.evidenceSummary}
            </div>
          </div>

          {/* Telemetry & Key Metrics */}
          {experience.keyMetrics && experience.keyMetrics.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wide text-[11px]">
                Recorded Metrics & Telemetry
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {experience.keyMetrics.map((metric, i) => (
                  <div key={i} className="p-2.5 bg-[#101725] border border-[#202B3D] rounded">
                    <div className="text-[10px] text-slate-400">{metric.label}</div>
                    <div className="font-mono text-sm font-semibold text-[#67E8F9] mt-0.5 tabular-nums">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artifacts & Grounding Docs */}
          {experience.artifacts && experience.artifacts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wide text-[11px]">
                Grounding Artifacts & References
              </h4>
              <div className="space-y-1.5">
                {experience.artifacts.map((art, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-[#101725] border border-[#202B3D] rounded text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-200 font-medium">{art.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">{art.ref}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#202B3D] bg-[#101725] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onPinAsPrecedent && (
              <button
                onClick={() => onPinAsPrecedent(experience.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isPinned
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#141C2B] text-slate-200 border border-[#202B3D] hover:text-white hover:bg-[#1b263b]'
                }`}
              >
                {isPinned ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pinned to Active Decision</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Pin as Precedent to Active Decision</span>
                  </>
                )}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-200 bg-[#141C2B] hover:bg-[#1f2c42] border border-[#202B3D] rounded transition-colors"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
};
