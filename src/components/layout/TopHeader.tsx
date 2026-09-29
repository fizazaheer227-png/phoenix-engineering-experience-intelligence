import React, { useState, useEffect } from 'react';
import { Columns, Download, ShieldCheck } from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { checkEngineStatus } from '../../services/intelligenceService';
import { AiEngineStatus } from '../../types/phoenix';

interface TopHeaderProps {
  currentTab: NavigationTab;
  onOpenCompare: () => void;
  onOpenExport: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenCompare,
  onOpenExport,
}) => {
  const [engineStatus, setEngineStatus] = useState<AiEngineStatus | null>(null);

  useEffect(() => {
    checkEngineStatus().then((status) => setEngineStatus(status));
  }, []);
  const getTabLabel = (tab: NavigationTab) => {
    switch (tab) {
      case 'command-center':
        return 'Command Center';
      case 'decisions':
        return 'Decisions';
      case 'experience':
        return 'Experience';
      case 'pre-mortem':
        return 'Pre-Mortem';
      case 'engineering-dna':
        return 'Engineering DNA';
      case 'integrations':
        return 'Integrations';
      case 'settings':
        return 'Settings';
    }
  };

  return (
    <header className="h-14 bg-[#0C111B] border-b border-[#202B3D] px-6 flex items-center justify-between shrink-0">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">NovaStack</span>
        <span className="text-slate-600" aria-hidden="true">/</span>
        <span className="text-slate-400 font-medium">Engineering Memory</span>
        <span className="text-slate-600" aria-hidden="true">/</span>
        <span className="text-slate-100 font-medium">{getTabLabel(currentTab)}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Memory Core & Engine Status (Clean unboxed metadata) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5" title={engineStatus?.statusMessage || 'Memory Engine Active'}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                engineStatus?.hasApiKey ? 'bg-[#7C6CFF]' : 'bg-emerald-400'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {engineStatus?.hasApiKey ? 'Gemini Intelligence Online' : 'Memory Core Active'}
            </span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono text-slate-400 tabular-nums">262 experiences indexed</span>
        </div>

        <div className="h-4 w-px bg-[#202B3D] hidden md:block" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCompare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#101725] border border-[#202B3D] rounded-md hover:text-white hover:bg-[#141C2B] hover:border-slate-600 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#635BFF]"
          >
            <Columns className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Compare Architecture</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#635BFF] rounded-md hover:bg-[#5249ea] transition-colors whitespace-nowrap shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7C6CFF]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Intelligence</span>
          </button>
        </div>
      </div>
    </header>
  );
};
