import React from 'react';
import { ArrowUpRight, Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { Experience } from '../../types/phoenix';

interface RecentExperienceSectionProps {
  experiences: Experience[];
  onSelectExperience: (id: string) => void;
  onViewAllExperiences: () => void;
}

export const RecentExperienceSection: React.FC<RecentExperienceSectionProps> = ({
  experiences,
  onSelectExperience,
  onViewAllExperiences,
}) => {
  const getTypeColor = (type: Experience['type']) => {
    switch (type) {
      case 'ADR':
        return 'text-[#38BDF8]';
      case 'EXP':
        return 'text-[#7C6CFF]';
      case 'INC':
        return 'text-rose-400';
      case 'DEC':
        return 'text-emerald-400';
      default:
        return 'text-slate-300';
    }
  };

  const getOutcomeBadge = (outcome: string, type: Experience['type']) => {
    const isNegative = outcome.toLowerCase().includes('late') ||
      outcome.toLowerCase().includes('impact') ||
      outcome.toLowerCase().includes('exceeded') ||
      outcome.toLowerCase().includes('storm');

    const isBenchmark = outcome.toLowerCase().includes('sustained') || outcome.toLowerCase().includes('stabilized');

    return (
      <span className={`text-xs ${isNegative ? 'text-rose-300' : isBenchmark ? 'text-emerald-300' : 'text-slate-300'}`}>
        {outcome}
      </span>
    );
  };

  return (
    <div className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-5 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Recent Experience
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical outcomes, benchmarks, and incident retrospectives indexed in organizational memory.
          </p>
        </div>

        <button
          onClick={onViewAllExperiences}
          className="text-xs font-medium text-[#38BDF8] hover:text-[#67E8F9] flex items-center gap-1 transition-colors"
        >
          <span>View all 262</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Experience List - Desktop high-density tabular table */}
      {experiences.length === 0 ? (
        <div className="py-8 text-center bg-[#101725]/40 rounded border border-[#202B3D]/60 text-xs text-slate-400">
          No historical experiences matched your current query or source filter.
        </div>
      ) : (
        <div className="divide-y divide-[#202B3D]/70 overflow-hidden">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              onClick={() => onSelectExperience(exp.id)}
              className="py-3 px-2 -mx-2 rounded hover:bg-[#101725] transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              {/* Left: ID + Type + Title + System */}
              <div className="flex items-start gap-3 min-w-0 md:w-5/12">
                <span className={`font-mono text-xs font-semibold shrink-0 pt-0.5 ${getTypeColor(exp.type)}`}>
                  {exp.id}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white group-hover:text-[#67E8F9] transition-colors truncate">
                    {exp.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                    <span>{exp.system}</span>
                    <span className="text-slate-600" aria-hidden="true">·</span>
                    <span>{exp.domain}</span>
                  </div>
                </div>
              </div>

              {/* Middle: Outcome & Core Lesson */}
              <div className="min-w-0 md:w-5/12 text-xs">
                <div className="truncate">
                  <span className="text-slate-400 font-medium mr-1.5">Outcome:</span>
                  {getOutcomeBadge(exp.outcome, exp.type)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate leading-tight">
                  <span className="text-slate-400 font-medium mr-1">Lesson:</span>
                  <span className="text-slate-300">{exp.lesson}</span>
                </div>
              </div>

              {/* Right: Date, Team & inspect trigger */}
              <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-slate-400 shrink-0 md:w-2/12">
                <div className="text-right">
                  <div className="font-mono text-[11px] text-slate-400">{exp.date}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[100px]">{exp.team}</div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
