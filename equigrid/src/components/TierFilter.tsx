import React from 'react';
import type { Tier } from '../types';
import { TIER_COLORS } from '../data/constants';

interface TierFilterProps {
  activeTiers: Set<Tier>;
  onChange: (tiers: Set<Tier>) => void;
  counts: Record<Tier, number>;
}

const ALL_TIERS: Tier[] = ['Critical', 'High', 'Moderate'];

const TIER_ICONS: Record<Tier, string> = {
  Critical: '🔴',
  High: '🟠',
  Moderate: '🟢',
};

export const TierFilter: React.FC<TierFilterProps> = ({ activeTiers, onChange, counts }) => {
  const toggle = (tier: Tier) => {
    const next = new Set(activeTiers);
    if (next.has(tier)) {
      // Don't allow deselecting all
      if (next.size > 1) next.delete(tier);
    } else {
      next.add(tier);
    }
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
        Filter by Tier
      </p>
      {ALL_TIERS.map((tier) => {
        const active = activeTiers.has(tier);
        const colors = TIER_COLORS[tier];
        return (
          <label
            key={tier}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer border transition-all duration-150 select-none ${
              active
                ? 'border-transparent shadow-sm'
                : 'border-[#E2E8F0] bg-white opacity-60 hover:opacity-80'
            }`}
            style={active ? { backgroundColor: colors.light, borderColor: colors.bg } : {}}
          >
            <input
              type="checkbox"
              checked={active}
              onChange={() => toggle(tier)}
              className="rounded w-4 h-4 accent-[var(--tier-bg)] cursor-pointer"
              style={{ accentColor: colors.bg }}
            />
            <span className="text-sm">
              {TIER_ICONS[tier]} {tier}
            </span>
            <span
              className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: colors.bg, color: '#FFFFFF' }}
            >
              {counts[tier] ?? 0}
            </span>
          </label>
        );
      })}
    </div>
  );
};
