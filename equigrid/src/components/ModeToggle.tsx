import React from 'react';
import type { ViewMode } from '../types';
import { MODE_LABELS } from '../data/labels';

interface ModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex rounded-xl overflow-hidden border-2 border-[#E2E8F0] bg-[#F8FAFC] p-0.5">
        <button
          type="button"
          onClick={() => onChange('burden')}
          className={`flex-1 py-2.5 px-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
            mode === 'burden'
              ? 'text-white shadow-md'
              : 'text-[#64748B] hover:bg-white hover:text-[#0F172A]'
          }`}
          style={{ backgroundColor: mode === 'burden' ? '#DC2626' : undefined }}
          aria-pressed={mode === 'burden'}
        >
          Who needs help?
        </button>
        <button
          type="button"
          onClick={() => onChange('decision')}
          className={`flex-1 py-2.5 px-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
            mode === 'decision'
              ? 'text-white shadow-md'
              : 'text-[#64748B] hover:bg-white hover:text-[#0F172A]'
          }`}
          style={{ backgroundColor: mode === 'decision' ? '#8B5CF6' : undefined }}
          aria-pressed={mode === 'decision'}
        >
          Which programs?
        </button>
      </div>
      <p className="text-xs text-[#64748B] leading-relaxed">
        {MODE_LABELS[mode].hint}
      </p>
    </div>
  );
};
