import React from 'react';
import { SUMMARY_METRICS } from '../../data/mockMemory';

export const SummaryMetrics: React.FC = () => {
  const metricItems = [
    {
      label: 'Experiences Retained',
      value: SUMMARY_METRICS.experiencesRetained,
      note: 'Across all teams & repos',
      highlightColor: 'text-[#38BDF8]',
    },
    {
      label: 'Decisions',
      value: SUMMARY_METRICS.decisions,
      note: 'ADRs & RFC outcomes',
      highlightColor: 'text-slate-100',
    },
    {
      label: 'Experiments',
      value: SUMMARY_METRICS.experiments,
      note: 'Benchmarks & spikes',
      highlightColor: 'text-slate-100',
    },
    {
      label: 'Incidents',
      value: SUMMARY_METRICS.incidents,
      note: 'Production retrospectives',
      highlightColor: 'text-rose-400',
    },
    {
      label: 'Learned Observations',
      value: SUMMARY_METRICS.learnedObservations,
      note: 'Extracted organizational signals',
      highlightColor: 'text-[#7C6CFF]',
    },
  ];

  return (
    <div className="bg-[#0C111B] border border-[#202B3D] rounded-lg px-6 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#202B3D]">
        {metricItems.map((item, index) => (
          <div
            key={item.label}
            className={`py-2 md:py-0 ${index === 0 ? 'md:pr-5' : 'md:px-5'} first:pt-0 last:pb-0`}
          >
            <div className="text-[11px] font-medium text-slate-400">
              {item.label}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-semibold tracking-tight font-mono tabular-nums ${item.highlightColor}`}>
                {item.value}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {item.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
