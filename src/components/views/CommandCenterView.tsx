import React, { useState, useMemo } from 'react';
import { HeroSection } from '../command-center/HeroSection';
import { SummaryMetrics } from '../command-center/SummaryMetrics';
import { SearchFilterBar } from '../command-center/SearchFilterBar';
import { CurrentDecisionPanel } from '../command-center/CurrentDecisionPanel';
import { LearnedObservationsSection } from '../command-center/LearnedObservationsSection';
import { RecentExperienceSection } from '../command-center/RecentExperienceSection';
import { MOCK_EXPERIENCES } from '../../data/mockMemory';
import { SourceFilter, Experience, DecisionContext, DecisionAnalysisResult } from '../../types/phoenix';

interface CommandCenterViewProps {
  activeDecision: DecisionContext;
  onUpdateDecision: (d: DecisionContext) => void;
  onSelectExperience: (id: string) => void;
  onNavigateToPreMortem: () => void;
  onViewAllExperiences: () => void;
  externalAnalysisResult?: DecisionAnalysisResult | null;
  onAnalysisComplete?: (result: DecisionAnalysisResult) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  activeDecision,
  onUpdateDecision,
  onSelectExperience,
  onNavigateToPreMortem,
  onViewAllExperiences,
  externalAnalysisResult,
  onAnalysisComplete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SourceFilter>('all');

  // Filter experiences live based on search & source filters
  const filteredExperiences = useMemo(() => {
    return MOCK_EXPERIENCES.filter((exp) => {
      // Source filter
      if (activeFilter === 'prs' && exp.type !== 'PR') return false;
      if (activeFilter === 'postmortems' && exp.type !== 'POST_MORTEM' && exp.type !== 'INC') return false;
      if (activeFilter === 'adrs' && exp.type !== 'ADR') return false;
      if (activeFilter === 'experiments' && exp.type !== 'EXP') return false;
      if (activeFilter === 'incidents' && exp.type !== 'INC') return false;

      // Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const searchCorpus = [
          exp.id,
          exp.title,
          exp.system,
          exp.domain,
          exp.expectedOutcome || '',
          exp.outcome,
          exp.reflection || '',
          exp.lesson,
          exp.evidenceSummary,
          ...exp.tags,
        ].join(' ').toLowerCase();

        return searchCorpus.includes(query);
      }

      return true;
    });
  }, [searchQuery, activeFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Main Hero */}
      <HeroSection />

      {/* 2. Summary Metrics */}
      <SummaryMetrics />

      {/* 3. Search / Ask Phoenix Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        resultCount={filteredExperiences.length}
      />

      {/* 4. Current Decision Primary Panel */}
      <CurrentDecisionPanel
        decision={activeDecision}
        onUpdateDecision={onUpdateDecision}
        onSelectExperience={onSelectExperience}
        onNavigateToPreMortem={onNavigateToPreMortem}
        externalAnalysisResult={externalAnalysisResult}
        onAnalysisComplete={onAnalysisComplete}
      />

      {/* 5. What Phoenix Has Learned */}
      <LearnedObservationsSection onSelectExperience={onSelectExperience} />

      {/* 6. Recent Experience List */}
      <RecentExperienceSection
        experiences={filteredExperiences.slice(0, 6)}
        onSelectExperience={onSelectExperience}
        onViewAllExperiences={onViewAllExperiences}
      />
    </div>
  );
};
