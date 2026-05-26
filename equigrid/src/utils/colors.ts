import type { ProgramKey, Tier } from '../types';
import { PROGRAM_COLORS, TIER_COLORS } from '../data/constants';

/**
 * Burden Mode: interpolate red gradient between low (#FEE2E2) and high (#991B1B)
 * ebi is [0, 1]
 */
export function burdenColor(ebi: number): string {
  // Clamp to [0,1]
  const t = Math.max(0, Math.min(1, ebi));

  // Colour stops: 0 → #FEE2E2 (light pink), 1 → #991B1B (dark red)
  const low  = { r: 0xFE, g: 0xE2, b: 0xE2 };
  const high = { r: 0x99, g: 0x1B, b: 0x1B };

  const r = Math.round(low.r + t * (high.r - low.r));
  const g = Math.round(low.g + t * (high.g - low.g));
  const b = Math.round(low.b + t * (high.b - low.b));

  return `rgb(${r},${g},${b})`;
}

/**
 * Decision Mode: discrete colour by primary program key
 */
export function programColor(key: ProgramKey): string {
  return PROGRAM_COLORS[key]?.bg ?? '#94A3B8';
}

/**
 * Tier badge colour
 */
export function tierColor(tier: Tier): { bg: string; text: string; light: string } {
  return TIER_COLORS[tier] ?? { bg: '#94A3B8', text: '#1E293B', light: '#F1F5F9' };
}

/**
 * Returns [fill, outline] for a polygon given mode + tier filter state
 */
export function polygonColors(
  ebi: number,
  primaryKey: ProgramKey,
  tier: Tier,
  mode: 'burden' | 'decision',
  activeTiers: Set<Tier>,
): { fill: string; outline: string; opacity: number } {
  const active = activeTiers.has(tier);
  const fill   = mode === 'burden' ? burdenColor(ebi) : programColor(primaryKey);
  return {
    fill,
    outline: '#FFFFFF',
    opacity: active ? 0.85 : 0.2,
  };
}
