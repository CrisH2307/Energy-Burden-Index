import React, { useMemo } from 'react';
import type { Neighbourhood, Tier, ViewMode } from '../types';
import { ModeToggle } from './ModeToggle';
import { TierFilter } from './TierFilter';
import { TIER_COLORS, PROGRAM_COLORS } from '../data/constants';
import { TIER_LABELS } from '../data/labels';

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
          Find where Toronto households need energy help most — click the map to start.
        </p>
      </div>

      {/* How to use */}
      <div className="mx-4 mt-3 px-3 py-2.5 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] flex-shrink-0">
        <p className="text-xs text-[#0369A1] leading-relaxed">
          <strong className="font-semibold">How to use:</strong> Pick colours below, then click any area on the map. Details appear on the right.
        </p>
      </div>

      {/* Controls */}
      <div className="px-4 py-4 space-y-4 border-b border-[#E2E8F0] flex-shrink-0">
        <ModeToggle mode={mode} onChange={onModeChange} />

        {/* Tier Filter */}
        <TierFilter
          activeTiers={activeTiers}
          onChange={onTiersChange}
          counts={tierCounts}
        />

        <details className="group">
          <summary className="text-xs font-medium text-[#64748B] cursor-pointer hover:text-[#0F172A] list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▸</span>
            Advanced: compare with StatCan deprivation map
          </summary>
          <label className="flex items-center gap-2.5 cursor-pointer select-none py-2 mt-1">
            <input
              type="checkbox"
              checked={cimdOn}
              onChange={(e) => onCimdChange(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: '#0284C7' }}
            />
            <span className="text-sm text-[#0F172A]">Show official deprivation overlay</span>
          </label>
        </details>
      </div>

      {/* Top 10 List */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
            Highest-need areas
          </p>
          <p className="text-[11px] text-[#94A3B8] mb-3">Tap a name to jump there on the map</p>
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
        <p className="text-[10px] text-[#94A3B8] text-center leading-relaxed">
          Red areas = urgent need · Orange = elevated · Teal = moderate
        </p>
      </div>
    </aside>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NeighbourhoodRowProps {
  nb: Neighbourhood;
  mode: ViewMode;
  isSelected: boolean;
  onClick: () => void;
}

const NeighbourhoodRow: React.FC<NeighbourhoodRowProps> = ({ nb, mode, isSelected, onClick }) => {
  const tierStyle = TIER_COLORS[nb.tier];
  const dotColor =
    mode === 'burden' ? tierStyle.bg : PROGRAM_COLORS[nb.primaryKey].bg;
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
          style={{ backgroundColor: dotColor }}
        />
        {/* Name */}
        <span className="text-sm font-semibold text-[#0F172A] truncate flex-1">{nb.name}</span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: tierStyle.light, color: tierStyle.text }}
        >
          {TIER_LABELS[nb.tier].short}
        </span>
      </div>
      <div className="flex items-center gap-1.5 pl-7">
        {/* Program badge */}
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: programColor.light, color: programColor.text }}
        >
          {programColor.name}
        </span>
        <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden ml-1">
          <div
            className="h-full rounded-full"
            style={{ width: `${nb.ebi * 100}%`, backgroundColor: tierStyle.bg }}
          />
        </div>
      </div>
    </button>
  );
};
