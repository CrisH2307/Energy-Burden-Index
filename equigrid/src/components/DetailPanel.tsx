import React from 'react';
import type { Neighbourhood } from '../types';
import { TIER_COLORS, PROGRAM_COLORS } from '../data/constants';
import { burdenColor } from '../utils/colors';
import { exportBriefing } from '../utils/exportBriefing';
import { ScoreBar } from './ScoreBar';
import { ProgramCard } from './ProgramCard';

interface DetailPanelProps {
  neighbourhood: Neighbourhood | null;
  onClose: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ neighbourhood, onClose }) => {
  if (!neighbourhood) {
    return <EmptyState />;
  }

  const nb = neighbourhood;
  const tier = TIER_COLORS[nb.tier];
  const primaryColor = PROGRAM_COLORS[nb.primaryKey];
  const secondaryColor = PROGRAM_COLORS[nb.secondaryKey];
  const ebiHex = burdenColor(nb.ebi);

  // Secondary program impact: same eligible-household pool, scaled by per-HH benefit ratio.
  const secondaryEstimatedImpact = Math.round(
    nb.eligible_households * nb.secondaryBenefit,
  );

  return (
    <aside className="w-80 flex flex-col h-full bg-white border-l border-[#E2E8F0] shadow-lg overflow-y-auto sidebar-scroll flex-shrink-0">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-[#E2E8F0] flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#0F172A] leading-tight truncate">
              {nb.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-bold text-[#475569] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                RANK #{nb.rank}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ backgroundColor: tier.light, color: tier.text }}
              >
                {nb.tier}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close detail panel"
            className="flex-shrink-0 p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* EBI Score */}
        <div className="mt-4">
          <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
            Energy Burden Index
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-black font-mono leading-none"
              style={{ color: ebiHex }}
            >
              {nb.ebi.toFixed(3)}
            </span>
            <span className="text-xs text-[#94A3B8]">/ 1.000</span>
          </div>
          <div className="mt-2 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${nb.ebi * 100}%`, backgroundColor: ebiHex }}
            />
          </div>
        </div>
      </div>

      {/* ── Score Breakdown ───────────────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-[#E2E8F0] flex-shrink-0">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
          Score Breakdown
        </p>
        <div className="space-y-3">
          <ScoreBar label="Income"       value={nb.income}      weight="35%" color="#DC2626" />
          <ScoreBar label="Renter"       value={nb.renter}      weight="25%" color="#F97316" />
          <ScoreBar label="Consumption"  value={nb.consumption} weight="25%" color="#3B82F6" />
          <ScoreBar label="Building Age" value={nb.age}         weight="15%" color="#14B8A6" />
        </div>
      </div>

      {/* ── Key Stats ─────────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-[#E2E8F0] flex-shrink-0">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
          Key Stats
        </p>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Est. kWh/yr" value={nb.est_kwh.toLocaleString()} />
          <StatCard label="Renter %"    value={`${(nb.renter_pct * 100).toFixed(0)}%`} />
          <StatCard label="Dominant"    value={nb.dwelling} />
        </div>
      </div>

      {/* ── Recommended Programs ──────────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-[#E2E8F0] flex-shrink-0">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
          Recommended Programs
        </p>
        <div className="space-y-2.5">
          <ProgramCard
            isPrimary
            name={nb.primaryName}
            benefit={nb.primaryBenefit}
            eligibility={nb.primaryEligibility}
            eligibleHouseholds={nb.eligible_households}
            estimatedAnnualImpact={nb.total_annual_benefit}
            color={primaryColor}
          />
          <ProgramCard
            isPrimary={false}
            name={nb.secondaryName}
            benefit={nb.secondaryBenefit}
            eligibility={nb.secondaryEligibility}
            eligibleHouseholds={nb.eligible_households}
            estimatedAnnualImpact={secondaryEstimatedImpact}
            color={secondaryColor}
          />
        </div>
      </div>

      {/* ── Impact Summary ────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-[#E2E8F0] flex-shrink-0">
        <div className="rounded-lg p-3 border-2" style={{ backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#92400E' }}>
            Projected Impact
          </p>
          <p className="text-sm leading-snug text-[#0F172A]">
            If <span className="font-bold">{nb.uptake_assumption}</span> of eligible households enroll:{' '}
            <span className="font-bold font-mono" style={{ color: '#B45309' }}>
              ${nb.total_annual_benefit.toLocaleString()}
            </span>{' '}
            in annual benefit delivered to{' '}
            <span className="font-bold font-mono" style={{ color: '#B45309' }}>
              {nb.eligible_households.toLocaleString()}
            </span>{' '}
            households.
          </p>
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="px-4 py-4 flex-shrink-0 space-y-2">
        <button
          onClick={() => exportBriefing(nb)}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E293B] active:bg-[#020617] transition-colors flex items-center justify-center gap-2"
        >
          <span>↓</span>
          <span>Export Briefing</span>
        </button>
        <button
          disabled
          title="Coming soon"
          className="w-full px-3 py-2.5 rounded-lg bg-[#F1F5F9] text-[#94A3B8] text-sm font-semibold cursor-not-allowed border border-[#E2E8F0]"
        >
          + Add to Comparison
        </button>
      </div>
    </aside>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-[#F8FAFC] rounded-lg px-2 py-2 border border-[#E2E8F0]">
    <p className="text-[9px] text-[#94A3B8] uppercase tracking-wider truncate">{label}</p>
    <p className="text-xs font-bold text-[#0F172A] mt-0.5 truncate" title={value}>
      {value}
    </p>
  </div>
);

const EmptyState: React.FC = () => (
  <aside className="w-80 flex flex-col h-full bg-white border-l border-[#E2E8F0] shadow-lg flex-shrink-0">
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F1F5F9] flex items-center justify-center">
          <span className="text-3xl">📍</span>
        </div>
        <h3 className="text-sm font-bold text-[#0F172A] mb-2">
          No neighbourhood selected
        </h3>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Click any neighbourhood on the map to see priority details and program recommendations.
        </p>
      </div>
    </div>
    <div className="px-4 py-3 border-t border-[#E2E8F0] flex-shrink-0">
      <p className="text-[10px] text-[#94A3B8] text-center leading-relaxed">
        Detail view shows score breakdown, recommended Ontario programs, and projected annual impact.
      </p>
    </div>
  </aside>
);
