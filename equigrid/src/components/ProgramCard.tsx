import React from 'react';
import type { ProgramKey } from '../types';
import { PROGRAM_COLORS } from '../data/constants';

interface ProgramCardProps {
  programKey: ProgramKey;
  name: string;
  benefit: number;
  eligibility: string;
  eligible: number;
  impact: number;
  isPrimary?: boolean;
}

function formatMoneyShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  programKey,
  name,
  benefit,
  eligibility,
  eligible,
  impact,
  isPrimary = false,
}) => {
  const color = PROGRAM_COLORS[programKey];

  return (
    <div
      className="rounded-lg p-3 border"
      style={{ backgroundColor: color.light, borderColor: color.bg + '50' }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wide"
            style={{ backgroundColor: color.bg, color: '#FFFFFF' }}
          >
            {color.name}
          </span>
          <p className="text-sm font-bold leading-snug" style={{ color: color.text }}>
            {name}
          </p>
        </div>
        {isPrimary && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0"
            style={{ backgroundColor: color.bg, color: '#FFFFFF' }}
          >
            Primary
          </span>
        )}
      </div>

      <p className="text-[11px] text-[#64748B] leading-snug mb-2.5">{eligibility}</p>

      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t" style={{ borderColor: color.bg + '30' }}>
        <Stat label="Per HH/yr" value={`$${benefit.toLocaleString()}`} color={color.text} />
        <Stat label="Eligible HHs" value={eligible.toLocaleString()} color={color.text} />
        <Stat label="Total/yr" value={formatMoneyShort(impact)} color={color.text} />
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div>
    <p className="text-[9px] uppercase tracking-wider text-[#94A3B8]">{label}</p>
    <p className="text-xs font-bold font-mono mt-0.5" style={{ color }}>
      {value}
    </p>
  </div>
);
