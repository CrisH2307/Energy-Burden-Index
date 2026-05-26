import React from 'react';
import type { Tier } from '../types';
import { TIER_COLORS } from '../data/constants';
import { TIER_LABELS } from '../data/labels';

interface TierFilterProps {
  activeTiers: Set<Tier>;
  onChange: (tiers: Set<Tier>) => void;
  counts: Record<Tier, number>;
}

const ALL_TIERS: Tier[] = ['Critical', 'High', 'Moderate'];

export const TierFilter: React.FC<TierFilterProps> = ({ activeTiers, onChange, counts }) => {
  const toggle = (tier: Tier) => {
    const next = new Set(activeTiers);
    if (next.has(tier)) {
      if (next.size > 1) next.delete(tier);
    } else {
      next.add(tier);
    }
    onChange(next);
  };

  const showOnly = (tier: Tier) => onChange(new Set([tier]));
  const showAll = () => onChange(new Set(ALL_TIERS));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
          Show on map
        </p>
        <button
          type="button"
          onClick={showAll}
          className="text-xs font-medium text-[#0284C7] hover:underline"
        >
          Show all
        </button>
      </div>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => showOnly('Critical')}
          className="flex-1 text-[11px] font-semibold py-1.5 rounded-md border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
        >
          Urgent only
        </button>
      </div>

      {ALL_TIERS.map((tier) => {
        const active = activeTiers.has(tier);
        const colors = TIER_COLORS[tier];
        const label = TIER_LABELS[tier];

        return (
          <button
            key={tier}
            type="button"
            onClick={() => toggle(tier)}
            aria-pressed={active}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all duration-150 ${
              active
                ? 'shadow-sm scale-[1.01]'
                : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9]'
            }`}
            style={
              active
                ? {
                    backgroundColor: colors.light,
                    borderColor: colors.bg,
                  }
                : undefined
            }
          >
            <span
              className={`w-5 h-5 rounded-md flex-shrink-0 border-2 shadow-sm ${
                active ? 'border-white' : 'border-[#E2E8F0]'
              }`}
              style={{ backgroundColor: active ? colors.bg : '#CBD5E1' }}
              aria-hidden
            />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-[#0F172A]">
                {label.short}
              </span>
              <span className="block text-[11px] text-[#64748B] leading-snug truncate">
                {label.description}
              </span>
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors.bg, color: '#fff' }}
            >
              {counts[tier] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
};
