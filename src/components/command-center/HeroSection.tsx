import React from 'react';
import { ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const loopSteps = [
    { label: 'Decision', sub: 'Hypothesis & intent' },
    { label: 'Outcome', sub: 'Production reality' },
    { label: 'Experience', sub: 'Captured evidence' },
    { label: 'Reflection', sub: 'Root-cause analysis' },
    { label: 'Lesson', sub: 'Extracted principle' },
    { label: 'Better Next Decision', sub: 'Informed execution', isFinal: true },
  ];

  return (
    <div className="bg-[#0C111B] border border-[#202B3D] rounded-lg p-6 relative overflow-hidden">
      {/* Subtle background structural accent - no excessive glow or generic sparkles */}
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#635BFF]/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight text-white" style={{ textWrap: 'balance' }}>
          Every decision becomes experience.
        </h2>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-2xl">
          Phoenix remembers what your team tried, why you tried it, what happened, and what you learned.
          Continuous organizational recall synthesized from engineering history.
        </p>
      </div>

      {/* Organizational Experience Loop (Refined horizontal progression) */}
      <div className="mt-6 pt-5 border-t border-[#202B3D]/70">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
          The Engineering Memory Loop
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {loopSteps.map((step, idx) => (
            <div
              key={step.label}
              className={`p-3 rounded-md transition-colors ${
                step.isFinal
                  ? 'bg-[#141C2B] border border-[#635BFF]/40 text-white'
                  : 'bg-[#101725] border border-[#202B3D]/60 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400">
                  0{idx + 1}
                </span>
                {!step.isFinal && (
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                )}
              </div>
              <div className={`mt-1.5 text-xs font-semibold ${step.isFinal ? 'text-[#67E8F9]' : 'text-slate-200'}`}>
                {step.label}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {step.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
