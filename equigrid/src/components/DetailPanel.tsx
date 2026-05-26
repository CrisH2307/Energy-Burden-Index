/**
 * DetailPanel — Member 3 owns the full implementation.
 * This is a functional stub that Member 2 provides so the app compiles and runs.
 * Member 3 should replace the body with ScoreBar, ProgramCard, and export briefing.
 */
import React from 'react';
import type { Neighbourhood } from '../types';
import { TIER_COLORS, PROGRAM_COLORS } from '../data/constants';
import { burdenColor } from '../utils/colors';

interface DetailPanelProps {
  neighbourhood: Neighbourhood | null;
  onClose: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ neighbourhood, onClose }) => {
  if (!neighbourhood) return null;

  const nb     = neighbourhood;
  const tier   = TIER_COLORS[nb.tier];
  const prog   = PROGRAM_COLORS[nb.primaryKey];
  const sec    = PROGRAM_COLORS[nb.secondaryKey];
  const ebiHex = burdenColor(nb.ebi);

  return (
    <aside className="w-80 flex flex-col h-full bg-white border-l border-[#E2E8F0] shadow-lg overflow-y-auto sidebar-scroll">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#E2E8F0] flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#0F172A] leading-tight truncate">
              {nb.name}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">Rank #{nb.rank} · ID {nb.id}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* EBI Score */}
        <div className="mt-3 flex items-center gap-3">
          <div
            className="text-2xl font-black font-mono"
            style={{ color: ebiHex }}
          >
            {nb.ebi.toFixed(3)}
          </div>
          <div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: tier.light, color: tier.text }}
            >
              {nb.tier}
            </span>
            <p className="text-[10px] text-[#94A3B8] mt-1">Energy Burden Index</p>
          </div>
        </div>

        {/* EBI bar */}
        <div className="mt-2 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${nb.ebi * 100}%`, backgroundColor: ebiHex }}
          />
        </div>
      </div>

      {/* Sub-scores — Member 3: replace with ScoreBar components */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex-shrink-0">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
          Score Breakdown
        </p>
        <div className="space-y-2.5">
          <ScoreRow label="Income" value={nb.income} weight="35%" color="#DC2626" />
          <ScoreRow label="Renter" value={nb.renter} weight="25%" color="#F97316" />
          <ScoreRow label="Consumption" value={nb.consumption} weight="25%" color="#8B5CF6" />
          <ScoreRow label="Building Age" value={nb.age} weight="15%" color="#14B8A6" />
        </div>
      </div>

      {/* Raw data */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex-shrink-0">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
          Raw Indicators
        </p>
        <div className="grid grid-cols-2 gap-2">
          <DataCard label="Est. kWh/yr" value={nb.est_kwh.toLocaleString()} />
          <DataCard label="Renter %" value={`${(nb.renter_pct * 100).toFixed(1)}%`} />
          <DataCard label="Dwelling Type" value={nb.dwelling} className="col-span-2" />
        </div>
      </div>

      {/* Programs — Member 3: replace with ProgramCard components */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex-shrink-0">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
          Recommended Programs
        </p>
        <div className="space-y-2">
          <ProgramRow
            label="Primary"
            name={nb.primaryName}
            benefit={nb.primaryBenefit}
            eligibility={nb.primaryEligibility}
            color={prog}
          />
          <ProgramRow
            label="Secondary"
            name={nb.secondaryName}
            benefit={nb.secondaryBenefit}
            eligibility={nb.secondaryEligibility}
            color={sec}
          />
        </div>
      </div>

      {/* Impact */}
      <div className="px-4 py-3 flex-shrink-0">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
          Estimated Impact
        </p>
        <div className="grid grid-cols-2 gap-2">
          <DataCard
            label="Eligible HHs"
            value={nb.eligible_households.toLocaleString()}
          />
          <DataCard
            label="Annual Benefit"
            value={`$${(nb.total_annual_benefit / 1_000_000).toFixed(1)}M`}
          />
          <DataCard
            label="Uptake Rate"
            value={nb.uptake_assumption}
            className="col-span-2"
          />
        </div>
      </div>

      {/* Member 3 TODO banner */}
      <div className="mx-4 mb-4 p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-lg flex-shrink-0">
        <p className="text-xs font-semibold text-[#166534] mb-1">👨‍💻 Member 3 — DetailPanel</p>
        <p className="text-[11px] text-[#15803D]">
          Replace stub with ScoreBar, ProgramCard, and export briefing.
          Data is fully available via the <code className="bg-[#DCFCE7] px-1 rounded">neighbourhood</code> prop.
        </p>
      </div>
    </aside>
  );
};

// ─── Utility sub-components (Member 3 can replace or extend) ─────────────────

const ScoreRow: React.FC<{
  label: string;
  value: number;
  weight: string;
  color: string;
}> = ({ label, value, weight, color }) => (
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
    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${value * 100}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const DataCard: React.FC<{
  label: string;
  value: string;
  className?: string;
}> = ({ label, value, className = '' }) => (
  <div className={`bg-[#F8FAFC] rounded-lg px-3 py-2 ${className}`}>
    <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-[#0F172A] mt-0.5 truncate">{value}</p>
  </div>
);

const ProgramRow: React.FC<{
  label: string;
  name: string;
  benefit: number;
  eligibility: string;
  color: { bg: string; light: string; text: string };
}> = ({ label, name, benefit, eligibility, color }) => (
  <div
    className="rounded-lg p-3 border"
    style={{ backgroundColor: color.light, borderColor: color.bg + '40' }}
  >
    <div className="flex items-start justify-between gap-2 mb-1">
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
        style={{ backgroundColor: color.bg, color: '#FFFFFF' }}
      >
        {label}
      </span>
      <span className="text-xs font-bold" style={{ color: color.text }}>
        ${benefit.toLocaleString()}/yr
      </span>
    </div>
    <p className="text-xs font-semibold mb-1" style={{ color: color.text }}>{name}</p>
    <p className="text-[11px] text-[#64748B] leading-snug">{eligibility}</p>
  </div>
);
