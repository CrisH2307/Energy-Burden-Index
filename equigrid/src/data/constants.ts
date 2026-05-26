import type { ProgramKey, Tier } from '../types';

// ─── Tier Colors ──────────────────────────────────────────────────────────────
export const TIER_COLORS: Record<Tier, { bg: string; light: string; text: string }> = {
  Critical: { bg: '#DC2626', light: '#FEE2E2', text: '#7F1D1D' },
  High:     { bg: '#F97316', light: '#FED7AA', text: '#9A3412' },
  Moderate: { bg: '#14B8A6', light: '#CCFBF1', text: '#115E59' },
};

// ─── Program Colors (Decision Mode) ──────────────────────────────────────────
export const PROGRAM_COLORS: Record<ProgramKey, { bg: string; light: string; text: string; name: string }> = {
  EAP:      { bg: '#8B5CF6', light: '#EDE9FE', text: '#5B21B6', name: 'EAP' },
  OESP:     { bg: '#14B8A6', light: '#CCFBF1', text: '#115E59', name: 'OESP' },
  LEAP:     { bg: '#3B82F6', light: '#DBEAFE', text: '#1E40AF', name: 'LEAP' },
  MULTIRES: { bg: '#F97316', light: '#FED7AA', text: '#9A3412', name: 'Multi-Res' },
  SOE_HOME: { bg: '#84CC16', light: '#ECFCCB', text: '#3F6212', name: 'Save on Energy' },
  SOE_THERM:{ bg: '#84CC16', light: '#ECFCCB', text: '#3F6212', name: 'Smart Thermostat' },
};

// ─── Score Weights ─────────────────────────────────────────────────────────────
export const WEIGHTS = {
  income: 0.35,
  renter: 0.25,
  consumption: 0.25,
  age: 0.15,
};

// ─── Map name strings → program keys ─────────────────────────────────────────
export function nameToKey(name: string): ProgramKey {
  if (name.includes('Energy Affordability'))       return 'EAP';
  if (name.includes('Ontario Electricity Support')) return 'OESP';
  if (name.includes('Low-Income Energy Assistance')) return 'LEAP';
  if (name.includes('Multi-Residential') || name.includes('Enbridge')) return 'MULTIRES';
  if (name.includes('Smart Thermostat'))            return 'SOE_THERM';
  if (name.includes('Save on Energy'))              return 'SOE_HOME';
  return 'EAP'; // safe fallback
}
