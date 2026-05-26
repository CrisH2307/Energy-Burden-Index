import React, { useMemo } from 'react';
import type { Neighbourhood, Tier, ViewMode } from '../types';
import { ModeToggle } from './ModeToggle';
import { TierFilter } from './TierFilter';
import { TIER_COLORS, PROGRAM_COLORS } from '../data/constants';
import { burdenColor } from '../utils/colors';

interface SidebarProps {
  data: Neighbourhood[];
  mode: ViewMode;
  onModeChange: (m: ViewMode) => void;
  activeTiers: Set<Tier>;
  onTiersChange: (t: Set<Tier>) => void;
  selectedId: number | null;
  onSelectId: (id: number | null) => void;
  cimdOn: boolean;
  onCimdChange: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  data,
  mode,
  onModeChange,
  activeTiers,
  onTiersChange,
  selectedId,
  onSelectId,
  cimdOn,
  onCimdChange,
}) => {
  // Tier counts
  const tierCounts = useMemo(() => {
    const c: Record<Tier, number> = { Critical: 0, High: 0, Moderate: 0 };
    data.forEach((n) => { c[n.tier] = (c[n.tier] ?? 0) + 1; });
    return c;
  }, [data]);

  // Top 10 by EBI among active tiers
  const top10 = useMemo(() => {
    return data
      .filter((n) => activeTiers.has(n.tier))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10);
  }, [data, activeTiers]);

  return (
    <aside className="w-80 flex flex-col h-full bg-white border-r border-[#E2E8F0] shadow-sm">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-[#E2E8F0] flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⚡</span>
          <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">EquiGrid</h1>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Energy Burden Index — Toronto's 158 Neighbourhoods
        </p>
      </div>

      {/* Controls */}
      <div className="px-4 py-4 space-y-4 border-b border-[#E2E8F0] flex-shrink-0">
        {/* Mode Toggle */}
        <div>
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
            View Mode
          </p>
          <ModeToggle mode={mode} onChange={onModeChange} />
        </div>

        {/* Tier Filter */}
        <TierFilter
          activeTiers={activeTiers}
          onChange={onTiersChange}
          counts={tierCounts}
        />

        {/* CIMD Overlay Toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
          <input
            type="checkbox"
            checked={cimdOn}
            onChange={(e) => onCimdChange(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer"
            style={{ accentColor: '#0284C7' }}
          />
          <span className="text-sm text-[#0F172A]">Show CIMD Validation Overlay</span>
          <span className="ml-auto text-[10px] bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD] px-1.5 py-0.5 rounded">
            M4
          </span>
        </label>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex-shrink-0">
        {mode === 'burden' ? (
          <BurdenLegend />
        ) : (
          <DecisionLegend />
        )}
      </div>

      {/* Top 10 List */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
            Top Neighbourhoods
          </p>
          <div className="space-y-1.5">
            {top10.map((nb) => (
              <NeighbourhoodRow
                key={nb.id}
                nb={nb}
                mode={mode}
                isSelected={nb.id === selectedId}
                onClick={() => onSelectId(nb.id === selectedId ? null : nb.id)}
              />
            ))}
            {top10.length === 0 && (
              <p className="text-sm text-[#94A3B8] italic text-center py-4">
                No neighbourhoods match filters
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#E2E8F0] flex-shrink-0">
        <p className="text-[10px] text-[#94A3B8] text-center">
          EBI = 0.35×Income + 0.25×Renter + 0.25×kWh + 0.15×Age
        </p>
      </div>
    </aside>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const BurdenLegend: React.FC = () => (
  <div>
    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
      Burden Scale
    </p>
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#64748B]">Low</span>
      <div
        className="flex-1 h-3 rounded"
        style={{ background: 'linear-gradient(to right, #FEE2E2, #DC2626, #991B1B)' }}
      />
      <span className="text-xs text-[#64748B]">High</span>
    </div>
  </div>
);

const DecisionLegend: React.FC = () => {
  const programs = [
    { key: 'EAP',      label: 'EAP' },
    { key: 'OESP',     label: 'OESP' },
    { key: 'LEAP',     label: 'LEAP' },
    { key: 'MULTIRES', label: 'Multi-Res' },
    { key: 'SOE_HOME', label: 'Save on Energy' },
  ] as const;

  return (
    <div>
      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
        Primary Program
      </p>
      <div className="flex flex-wrap gap-1.5">
        {programs.map(({ key, label }) => {
          const color = PROGRAM_COLORS[key];
          return (
            <span
              key={key}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: color.light, color: color.text }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color.bg }}
              />
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

interface NeighbourhoodRowProps {
  nb: Neighbourhood;
  mode: ViewMode;
  isSelected: boolean;
  onClick: () => void;
}

const NeighbourhoodRow: React.FC<NeighbourhoodRowProps> = ({ nb, mode, isSelected, onClick }) => {
  const tierColor = TIER_COLORS[nb.tier];
  const ebiColor  = burdenColor(nb.ebi);
  const programColor = PROGRAM_COLORS[nb.primaryKey];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150 ${
        isSelected
          ? 'border-[#DC2626] bg-[#FEF2F2] shadow-sm'
          : 'border-transparent hover:border-[#E2E8F0] hover:bg-[#F8FAFC]'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {/* Rank badge */}
        <span className="text-[11px] font-bold text-[#94A3B8] w-5 text-right flex-shrink-0">
          {nb.rank}
        </span>
        {/* Colour dot */}
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: mode === 'burden' ? ebiColor : programColor.bg }}
        />
        {/* Name */}
        <span className="text-sm font-semibold text-[#0F172A] truncate flex-1">{nb.name}</span>
        {/* EBI score */}
        <span className="text-xs font-mono font-bold text-[#DC2626] flex-shrink-0">
          {nb.ebi.toFixed(3)}
        </span>
      </div>
      <div className="flex items-center gap-1.5 pl-7">
        {/* Tier badge */}
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: tierColor.light, color: tierColor.text }}
        >
          {nb.tier}
        </span>
        {/* Program badge */}
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: programColor.light, color: programColor.text }}
        >
          {programColor.name}
        </span>
        {/* EBI bar */}
        <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden ml-1">
          <div
            className="h-full rounded-full"
            style={{ width: `${nb.ebi * 100}%`, backgroundColor: ebiColor }}
          />
        </div>
      </div>
    </button>
  );
};
