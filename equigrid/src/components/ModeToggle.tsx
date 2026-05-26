import React from 'react';
import type { ViewMode } from '../types';

interface ModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
  return (
    <div className="flex rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC]">
      <button
        onClick={() => onChange('burden')}
        className={`flex-1 py-2 px-3 text-sm font-medium transition-all duration-150 ${
          mode === 'burden'
            ? 'bg-accent text-white shadow-sm'
            : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
        }`}
        style={{ backgroundColor: mode === 'burden' ? '#DC2626' : undefined }}
      >
        🔴 Burden Mode
      </button>
      <button
        onClick={() => onChange('decision')}
        className={`flex-1 py-2 px-3 text-sm font-medium transition-all duration-150 ${
          mode === 'decision'
            ? 'bg-[#8B5CF6] text-white shadow-sm'
            : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
        }`}
      >
        🟣 Decision Mode
      </button>
    </div>
  );
};
