import type { ProgramKey, Tier } from '../types';
import { PROGRAM_COLORS, TIER_COLORS } from '../data/constants';

/** Choropleth gradient endpoints (map only) */
export const BURDEN_GRADIENT_LOW = '#fff0f0';
export const BURDEN_GRADIENT_HIGH = '#b91c1c';

/** Map stroke colours (map only) */
export const MAP_STROKE_DEFAULT = '#666666';
export const MAP_STROKE_HOVER = '#1a1a1a';
export const MAP_STROKE_SELECTED = '#1e3a5f';

/** Neutral styling for neighbourhoods filtered out of the active tier set */
export const MAP_INACTIVE_FILL = '#E2E8F0';
export const MAP_INACTIVE_OUTLINE = '#CBD5E1';

/**
 * EBI choropleth fill as CSS rgb() — low #fff0f0 → high #b91c1c
 */
export function burdenColor(ebi: number): string {
  const t = Math.max(0, Math.min(1, ebi));
  const low = { r: 0xff, g: 0xf0, b: 0xf0 };
  const high = { r: 0xb9, g: 0x1c, b: 0x1c };

  const r = Math.round(low.r + t * (high.r - low.r));
  const g = Math.round(low.g + t * (high.g - low.g));
  const b = Math.round(low.b + t * (high.b - low.b));

  return `rgb(${r},${g},${b})`;
}

/** Same scale as burdenColor — hex string for ArcGIS symbols */
export function burdenColorHex(ebi: number): string {
  const t = Math.max(0, Math.min(1, ebi));
  const low = { r: 0xff, g: 0xf0, b: 0xf0 };
  const high = { r: 0xb9, g: 0x1c, b: 0x1c };

  const r = Math.round(low.r + t * (high.r - low.r));
  const g = Math.round(low.g + t * (high.g - low.g));
  const b = Math.round(low.b + t * (high.b - low.b));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Score bar fill: low burden = green-ish, high = red */
export function scoreBarColor(value: number): string {
  const t = Math.max(0, Math.min(1, value));
  const low = { r: 0x86, g: 0xef, b: 0xac };
  const high = { r: 0xdc, g: 0x26, b: 0x26 };
  const r = Math.round(low.r + t * (high.r - low.r));
  const g = Math.round(low.g + t * (high.g - low.g));
  const b = Math.round(low.b + t * (high.b - low.b));
  return `rgb(${r},${g},${b})`;
}

export function programColor(key: ProgramKey): string {
  return PROGRAM_COLORS[key]?.bg ?? '#94A3B8';
}

export function tierColor(tier: Tier): { bg: string; text: string; light: string } {
  return TIER_COLORS[tier] ?? { bg: '#94A3B8', text: '#1E293B', light: '#F1F5F9' };
}

/**
 * Main choropleth polygon style. Selection outline is drawn on a separate layer.
 */
export function mapNeighbourhoodStyle(
  ebi: number,
  primaryKey: ProgramKey,
  tier: Tier,
  mode: 'burden' | 'decision',
  activeTiers: Set<Tier>,
  isHovered = false,
): { fill: string; outline: string; outlineWidth: number; opacity: number } {
  const active = activeTiers.has(tier);
  const fill =
    mode === 'burden' ? burdenColorHex(ebi) : programColor(primaryKey);

  if (!active) {
    return {
      fill: MAP_INACTIVE_FILL,
      outline: MAP_INACTIVE_OUTLINE,
      outlineWidth: 1,
      opacity: 0.45,
    };
  }
  if (isHovered) {
    return { fill, outline: MAP_STROKE_HOVER, outlineWidth: 2.5, opacity: 1 };
  }
  return { fill, outline: MAP_STROKE_DEFAULT, outlineWidth: 1.5, opacity: 1 };
}

/** @deprecated use mapNeighbourhoodStyle — kept for any non-map callers */
export function polygonColors(
  ebi: number,
  primaryKey: ProgramKey,
  tier: Tier,
  mode: 'burden' | 'decision',
  activeTiers: Set<Tier>,
  _isSelected = false,
  isHovered = false,
): { fill: string; outline: string; opacity: number; outlineWidth: number } {
  const s = mapNeighbourhoodStyle(ebi, primaryKey, tier, mode, activeTiers, isHovered);
  return s;
}
