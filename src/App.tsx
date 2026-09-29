import React, { useState } from 'react';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { CommandCenterView } from './components/views/CommandCenterView';
import { DecisionsView } from './components/views/DecisionsView';
import { ExperienceView } from './components/views/ExperienceView';
import { PreMortemView } from './components/views/PreMortemView';
import { EngineeringDnaView } from './components/views/EngineeringDnaView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { SettingsView } from './components/views/SettingsView';
import { ExperienceDetailModal } from './components/modals/ExperienceDetailModal';
import { CompareArchitectureModal } from './components/modals/CompareArchitectureModal';
import { ExportIntelligenceModal } from './components/modals/ExportIntelligenceModal';
import { CURRENT_DECISION, MOCK_EXPERIENCES } from './data/mockMemory';
import { DecisionContext, DecisionAnalysisResult } from './types/phoenix';
import { Check } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('command-center');
  const [activeDecision, setActiveDecision] = useState<DecisionContext>(CURRENT_DECISION);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DecisionAnalysisResult | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleUpdateDecision = (updated: DecisionContext) => {
    setActiveDecision(updated);
    showToast(`Active decision updated: ${updated.id}`);
  };

  const handlePinAsPrecedent = (experienceId: string) => {
    if (activeDecision.precedentIds.includes(experienceId)) {
      setActiveDecision({
        ...activeDecision,
        precedentIds: activeDecision.precedentIds.filter((id) => id !== experienceId),
      });
      showToast(`Unpinned ${experienceId} from ${activeDecision.id}`);
    } else {
      setActiveDecision({
        ...activeDecision,
        precedentIds: [...activeDecision.precedentIds, experienceId],
      });
      showToast(`Pinned ${experienceId} as precedent to ${activeDecision.id}`);
    }
  };

  const activeExperience = selectedExperienceId
    ? MOCK_EXPERIENCES.find((exp) => exp.id === selectedExperienceId) || null
    : null;

  const renderActiveView = () => {
    switch (currentTab) {
      case 'command-center':
        return (
          <CommandCenterView
            activeDecision={activeDecision}
            onUpdateDecision={handleUpdateDecision}
            onSelectExperience={(id) => setSelectedExperienceId(id)}
            onNavigateToPreMortem={() => setCurrentTab('pre-mortem')}
            onViewAllExperiences={() => setCurrentTab('experience')}
            externalAnalysisResult={analysisResult}
            onAnalysisComplete={(res) => setAnalysisResult(res)}
          />
        );
      case 'decisions':
        return (
          <DecisionsView
            activeDecision={activeDecision}
            onSetActiveDecision={handleUpdateDecision}
            onSelectExperience={(id) => setSelectedExperienceId(id)}
            onNavigateToCommandCenter={() => setCurrentTab('command-center')}
            onNavigateToPreMortem={() => setCurrentTab('pre-mortem')}
          />
        );
      case 'experience':
        return (
          <ExperienceView
            onSelectExperience={(id) => setSelectedExperienceId(id)}
            onPinAsPrecedent={handlePinAsPrecedent}
            pinnedIds={activeDecision.precedentIds}
          />
        );
      case 'pre-mortem':
        return (
          <PreMortemView
            decision={activeDecision}
            onUpdateDecision={handleUpdateDecision}
            onSelectExperience={(id) => setSelectedExperienceId(id)}
            onNavigateToCommandCenter={() => setCurrentTab('command-center')}
            onOpenExport={() => setIsExportOpen(true)}
          />
        );
      case 'engineering-dna':
        return (
          <EngineeringDnaView
            onSelectExperience={(id) => setSelectedExperienceId(id)}
          />
        );
      case 'integrations':
        return <IntegrationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070A0F] text-slate-200">
      {/* 1. Persistent Left Sidebar with client-side zero-reload routing */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Toast Feedback Notification */}
        {toastMessage && (
          <div className="absolute top-16 right-6 z-40 bg-[#101725] border border-[#635BFF]/60 text-slate-100 px-3.5 py-2 rounded-md shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 2. Top Header Bar */}
        <TopHeader
          currentTab={currentTab}
          onOpenCompare={() => setIsCompareOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
        />

        {/* 3. Main Viewport Canvas */}
        <main className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
          <div className="max-w-[1440px] mx-auto w-full">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Detail & Action Modals */}
      <ExperienceDetailModal
        experience={activeExperience}
        onClose={() => setSelectedExperienceId(null)}
        onPinAsPrecedent={handlePinAsPrecedent}
        isPinned={activeExperience ? activeDecision.precedentIds.includes(activeExperience.id) : false}
      />

      <CompareArchitectureModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectExperience={(id) => {
          setIsCompareOpen(false);
          setSelectedExperienceId(id);
        }}
      />

      <ExportIntelligenceModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        decision={activeDecision}
      />
    </div>
  );
}
