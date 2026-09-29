import React from 'react';
import { Search, X, CornerDownLeft } from 'lucide-react';
import { SourceFilter } from '../../types/phoenix';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: SourceFilter;
  onFilterChange: (filter: SourceFilter) => void;
  resultCount?: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  resultCount,
}) => {
  const filterTabs: { id: SourceFilter; label: string }[] = [
    { id: 'all', label: 'All Sources' },
    { id: 'prs', label: 'GitHub PRs' },
    { id: 'postmortems', label: 'Post-Mortems' },
    { id: 'adrs', label: 'ADRs' },
    { id: 'experiments', label: 'Experiments' },
    { id: 'incidents', label: 'Incidents' },
  ];

  return (
    <div className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-4 space-y-3">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Ask Phoenix about your engineering history…"
          className="w-full bg-[#101725] border border-[#202B3D] text-slate-100 placeholder:text-slate-400 text-sm rounded-md pl-10 pr-24 py-2.5 focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] transition-all"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-[#141C2B] transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-[#141C2B] px-1.5 py-0.5 rounded border border-[#202B3D]">
              <span>Search</span>
              <CornerDownLeft className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
      </div>

      {/* Source Filters - Interactive segmented controls (zero-pill buttons with clean states) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#202B3D]/50 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#141C2B] text-white border border-[#38BDF8]/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101725]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic status/result text */}
        {resultCount !== undefined && (
          <div className="text-[11px] text-slate-400 font-mono pl-1">
            {searchQuery || activeFilter !== 'all' ? (
              <span>
                Matching <strong className="text-slate-200">{resultCount}</strong> historical records
              </span>
            ) : (
              <span>Evidence database synchronized</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
