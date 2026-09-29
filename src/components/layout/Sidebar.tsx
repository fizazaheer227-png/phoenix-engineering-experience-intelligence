import React from 'react';
import {
  Compass,
  GitBranch,
  Layers,
  ShieldAlert,
  Dna,
  Cpu,
  Settings,
  ChevronRight,
} from 'lucide-react';

export type NavigationTab =
  | 'command-center'
  | 'decisions'
  | 'experience'
  | 'pre-mortem'
  | 'engineering-dna'
  | 'integrations'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const coreNavItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'command-center', label: 'Command Center', icon: Compass },
    { id: 'decisions', label: 'Decisions', icon: GitBranch },
    { id: 'experience', label: 'Experience', icon: Layers },
    { id: 'pre-mortem', label: 'Pre-Mortem', icon: ShieldAlert },
    { id: 'engineering-dna', label: 'Engineering DNA', icon: Dna },
  ];

  const workspaceNavItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'integrations', label: 'Integrations', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0C111B] border-r border-[#202B3D] flex flex-col shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-[#202B3D]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#141C2B] border border-[#635BFF]/40 flex items-center justify-center shadow-sm">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-tr from-[#635BFF] to-[#38BDF8]" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white leading-none">
              Phoenix
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 font-normal tracking-wide">
              Engineering Experience Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core Platform */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Core Platform
          </div>
          <nav className="space-y-0.5">
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors duration-150 group text-left ${
                    isActive
                      ? 'bg-[#141C2B] text-white border border-[#202B3D]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#101725]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-[#67E8F9]'
                          : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#635BFF] shadow-sm" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workspace */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          <nav className="space-y-0.5">
            {workspaceNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors duration-150 group text-left ${
                    isActive
                      ? 'bg-[#141C2B] text-white border border-[#202B3D]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#101725]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-[#67E8F9]'
                          : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#202B3D] bg-[#0C111B]">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-[#101725] transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded bg-[#141C2B] border border-[#202B3D] flex items-center justify-center font-mono text-xs font-medium text-[#38BDF8] shrink-0">
            AV
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate group-hover:text-slate-100">
              Alex Vance
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Principal Staff Engineer
            </div>
            <div className="text-[10px] text-slate-400 truncate font-mono">
              NovaStack
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
};
