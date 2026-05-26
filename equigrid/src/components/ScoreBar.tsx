import React from 'react';

interface ScoreBarProps {
  label: string;
  value: number;
  weight: string;
  color: string;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ label, value, weight, color }) => {
  const pct = Math.max(0, Math.min(1, value)) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#0F172A]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#94A3B8]">w={weight}</span>
          <span className="text-xs font-mono font-semibold" style={{ color }}>
            {value.toFixed(3)}
          </span>
        </div>
      </div>
      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};
