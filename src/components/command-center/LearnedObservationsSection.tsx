import React, { useState } from 'react';
import { ChevronRight, ChevronDown, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';
import { LEARNED_OBSERVATIONS } from '../../data/mockMemory';
import { LearnedObservation } from '../../types/phoenix';

interface LearnedObservationsSectionProps {
  onSelectExperience: (id: string) => void;
}

export const LearnedObservationsSection: React.FC<LearnedObservationsSectionProps> = ({
  onSelectExperience,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          What Phoenix Has Learned
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Evidence-grounded observations synthesized from NovaStack’s engineering history.
        </p>
      </div>

      {/* 3 Observations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LEARNED_OBSERVATIONS.map((obs) => {
          const isExpanded = expandedId === obs.id;
          const isStrong = obs.signalStrength === 'Strong historical signal';

          return (
            <div
              key={obs.id}
              className={`bg-[#0C111B] border transition-all duration-150 rounded-lg p-4 flex flex-col justify-between ${
                isExpanded ? 'border-[#635BFF]/50 bg-[#101725]' : 'border-[#202B3D] hover:border-slate-600'
              }`}
            >
              <div>
                {/* Header row: ID + Signal status */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#202B3D]/60 text-xs">
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    {obs.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isStrong ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-[11px] font-medium text-slate-300">
                      {obs.signalStrength}
                    </span>
                  </div>
                </div>

                {/* Observation Title */}
                <h4 className="text-sm font-semibold text-white mt-3 leading-snug">
                  {obs.title}
                </h4>

                {/* Evidence Basis (clean unboxed metadata) */}
                <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Based on:</span>
                  <span className="font-mono text-slate-300">{obs.basedOn}</span>
                </div>

                {/* Short Summary */}
                <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-3">
                  {obs.summary}
                </p>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-[#202B3D] space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">Systemic Risk:</span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{obs.keyRisk}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">Recommended Practice:</span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{obs.recommendedPractice}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block text-[11px] mb-1">
                        Supporting Records:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {obs.supportingExperienceIds.map((expId) => (
                          <button
                            key={expId}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectExperience(expId);
                            }}
                            className="font-mono text-xs text-[#38BDF8] hover:text-[#67E8F9] bg-[#141C2B] px-2 py-0.5 rounded border border-[#202B3D] hover:border-[#38BDF8]/40 flex items-center gap-1 transition-colors"
                          >
                            <span>{expId}</span>
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle expansion trigger */}
              <div className="mt-4 pt-2 border-t border-[#202B3D]/40 flex justify-end">
                <button
                  onClick={() => toggleExpand(obs.id)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors py-0.5"
                >
                  <span>{isExpanded ? 'Less evidence' : 'Inspect evidence'}</span>
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
