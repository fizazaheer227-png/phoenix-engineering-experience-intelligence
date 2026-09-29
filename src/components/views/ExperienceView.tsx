import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Activity,
  BookmarkPlus,
  Check,
  Compass,
} from 'lucide-react';
import { MOCK_EXPERIENCES } from '../../data/mockMemory';
import { Experience, SourceFilter } from '../../types/phoenix';

interface ExperienceViewProps {
  onSelectExperience: (id: string) => void;
  onPinAsPrecedent?: (experienceId: string) => void;
  pinnedIds?: string[];
}

export const ExperienceView: React.FC<ExperienceViewProps> = ({
  onSelectExperience,
  onPinAsPrecedent,
  pinnedIds = [],
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const availableTags = ['all', 'Kafka', 'RabbitMQ', 'Incident', 'Observability', 'Benchmarking', 'Data Migration', 'Database'];
  const typeFilters = [
    { id: 'all', label: 'All Records' },
    { id: 'ADR', label: 'ADRs' },
    { id: 'EXP', label: 'Experiments' },
    { id: 'INC', label: 'Incidents' },
    { id: 'POST_MORTEM', label: 'Post-Mortems' },
  ];

  const filteredExperiences = MOCK_EXPERIENCES.filter((exp) => {
    if (selectedType !== 'all' && exp.type !== selectedType) return false;
    if (selectedTag !== 'all' && !exp.tags.includes(selectedTag)) return false;
    if (searchTerm.trim()) {
      const searchTerms = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const corpus = [
        exp.id,
        exp.title,
        exp.type,
        exp.system,
        exp.domain,
        exp.expectedOutcome || '',
        exp.outcome,
        exp.lesson,
        exp.reflection || '',
        exp.evidenceSummary || '',
        exp.team,
        exp.date,
        exp.severity || '',
        exp.impactDuration || '',
        ...(exp.tags || []),
        ...(exp.authors || []),
        ...(exp.artifacts?.map((a) => `${a.label} ${a.ref}`) || []),
        ...(exp.keyMetrics?.map((m) => `${m.label} ${m.value}`) || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchTerms.every((term) => corpus.includes(term));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202B3D]">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Organizational Memory</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-300">262 experiences indexed</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Experience Library
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Searchable index of all post-mortems, benchmarks, migration outcomes, and extracted lessons.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-4 space-y-3">
        {/* Source Type Segmented Controls */}
        <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-[#202B3D]/60 text-xs">
          <span className="text-slate-500 font-medium mr-1">Type:</span>
          {typeFilters.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setSelectedType(tf.id)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                selectedType === tf.id
                  ? 'bg-[#141C2B] text-white border border-[#38BDF8]/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Tag Filters & Freeform Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-medium mr-1">Topic:</span>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                  selectedTag === tag
                    ? 'bg-[#141C2B] text-[#67E8F9] border border-[#38BDF8]/30 font-medium'
                    : 'text-slate-400 hover:text-slate-200 bg-[#101725] border border-[#202B3D]/70'
                }`}
              >
                {tag === 'all' ? 'All Topics' : tag}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search experiences & lessons..."
              className="w-full sm:w-64 bg-[#101725] border border-[#202B3D] text-xs text-slate-200 placeholder:text-slate-500 rounded px-3 py-1.5 focus:outline-none focus:border-[#635BFF]"
            />
          </div>
        </div>
      </div>

      {/* Experience Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExperiences.map((exp) => {
          const isIncident = exp.type === 'INC' || exp.type === 'POST_MORTEM';
          const isPinned = pinnedIds.includes(exp.id);

          return (
            <div
              key={exp.id}
              onClick={() => onSelectExperience(exp.id)}
              className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-4 hover:border-slate-500 transition-colors cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#202B3D]/70">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[#38BDF8]">{exp.id}</span>
                    <span className="text-slate-600" aria-hidden="true">·</span>
                    <span className="text-slate-400 font-mono text-[11px]">{exp.type}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{exp.date}</span>
                </div>

                <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-[#67E8F9] transition-colors">
                  {exp.title}
                </h3>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {exp.system} · {exp.team}
                </div>

                {/* Expected vs Actual Outcome Split */}
                <div className="mt-3 space-y-2 text-xs">
                  {exp.expectedOutcome && (
                    <div className="p-2 bg-[#101725] rounded border border-[#202B3D]/60 text-slate-300">
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">
                        Expected Intent:
                      </span>
                      <p className="mt-0.5 text-slate-300 line-clamp-2 leading-relaxed">
                        {exp.expectedOutcome}
                      </p>
                    </div>
                  )}

                  <div className="p-2 bg-[#141C2B] rounded border border-[#202B3D] text-slate-200">
                    <span className="text-slate-400 font-medium block text-[10px] uppercase flex items-center gap-1">
                      {isIncident ? (
                        <TrendingDown className="w-3 h-3 text-rose-400" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      )}
                      <span>Actual Outcome:</span>
                    </span>
                    <p className={`mt-0.5 font-medium ${isIncident ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {exp.outcome}
                    </p>
                  </div>
                </div>

                {/* Extracted Lesson */}
                <div className="mt-3 p-2.5 bg-[#101725] border border-[#635BFF]/30 rounded text-xs">
                  <div className="flex items-center gap-1 text-[#7C6CFF] text-[10px] font-semibold uppercase">
                    <Activity className="w-3 h-3" />
                    <span>Lesson Learned</span>
                  </div>
                  <p className="text-slate-200 mt-1 leading-relaxed font-medium">
                    "{exp.lesson}"
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-[#202B3D]/50 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  {onPinAsPrecedent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPinAsPrecedent(exp.id);
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                        isPinned
                          ? 'text-emerald-400 font-medium bg-emerald-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-[#141C2B]'
                      }`}
                    >
                      {isPinned ? <Check className="w-3 h-3 text-emerald-400" /> : <BookmarkPlus className="w-3 h-3" />}
                      <span>{isPinned ? 'Pinned' : 'Pin to Decision'}</span>
                    </button>
                  )}
                </div>

                <span className="flex items-center gap-1 text-[#38BDF8] group-hover:underline text-xs">
                  Inspect Record <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
