import React from 'react';
import { scoreBarColor } from '../utils/colors';

interface ScoreBarProps {
  label: string;
  value: number;
  weight: number;
  rawLabel?: string;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  label,
  value,
  weight,
  rawLabel,
}) => {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const barColor = scoreBarColor(value);
  const weightPct = `${Math.round(weight * 100)}%`;

  return (
    <div>
      <div className="flex justify-between items-center mb-1 gap-2">
        <span className="text-xs text-[#0F172A] font-medium">{label}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-[#94A3B8]">w={weightPct}</span>
          <span className="text-xs font-mono font-semibold text-[#0F172A]">
            {value.toFixed(3)}
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#E2E8F0]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      {rawLabel && (
        <p className="text-[10px] text-[#64748B] mt-1">{rawLabel}</p>
      )}
    </div>
  );
};
