import React from 'react';

interface ProgramCardProps {
  isPrimary: boolean;
  name: string;
  benefit: number;
  eligibility: string;
  eligibleHouseholds: number;
  estimatedAnnualImpact: number;
  color: { bg: string; light: string; text: string };
}

function formatMoneyShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  isPrimary,
  name,
  benefit,
  eligibility,
  eligibleHouseholds,
  estimatedAnnualImpact,
  color,
}) => {
  return (
    <div
      className="rounded-lg p-3 border"
      style={{ backgroundColor: color.light, borderColor: color.bg + '40' }}
    >
      {/* Top row: name + HIGH IMPACT pill */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-bold leading-snug flex-1" style={{ color: color.text }}>
          {name}
        </p>
        {isPrimary && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0"
            style={{ backgroundColor: color.bg, color: '#FFFFFF' }}
          >
            High Impact
          </span>
        )}
      </div>

      {/* Eligibility */}
      <p className="text-[11px] italic text-[#64748B] leading-snug mb-2.5">
        {eligibility}
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t" style={{ borderColor: color.bg + '30' }}>
        <Stat label="Per HH/yr" value={`$${benefit.toLocaleString()}`} color={color.text} />
        <Stat label="Eligible HHs" value={eligibleHouseholds.toLocaleString()} color={color.text} />
        <Stat label="Total/yr" value={formatMoneyShort(estimatedAnnualImpact)} color={color.text} />
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
