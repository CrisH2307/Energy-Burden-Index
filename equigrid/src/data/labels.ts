import type { Tier } from '../types';

/** Plain-language labels for non-technical users */
export const TIER_LABELS: Record<Tier, { short: string; description: string }> = {
  Critical: {
    short: 'Urgent',
    description: 'Highest need — prioritize programs here first',
  },
  High: {
    short: 'Elevated',
    description: 'Significant need — include in planning',
  },
  Moderate: {
    short: 'Moderate',
    description: 'Lower relative need compared to other areas',
  },
};

export const MODE_LABELS = {
  burden: {
    title: 'Who needs help most?',
    hint: 'Areas are coloured by urgency: red = urgent, orange = elevated, teal = moderate.',
  },
  decision: {
    title: 'Which programs fit?',
    hint: 'Each colour shows the recommended primary assistance program for that area.',
  },
} as const;
