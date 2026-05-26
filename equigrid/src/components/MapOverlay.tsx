import React, { useState } from 'react';
import type { Tier, ViewMode } from '../types';
import { PROGRAM_COLORS, TIER_COLORS } from '../data/constants';
import { TIER_LABELS } from '../data/labels';
import { BURDEN_GRADIENT_HIGH, BURDEN_GRADIENT_LOW } from '../utils/colors';

export interface MapHoverInfo {
  name: string;
  tier: Tier;
  ebi: number;
  x: number;
  y: number;
}

interface MapOverlayProps {
  mode: ViewMode;
  hover: MapHoverInfo | null;
  selectedName: string | null;
  showHint: boolean;
  onDismissHint: () => void;
}

export const MapOverlay: React.FC<MapOverlayProps> = ({
  mode,
  hover,
  selectedName,
  showHint,
  onDismissHint,
}) => {
  return (
    <>
      <div className="map-legend" aria-label="Map colour legend">
        {mode === 'burden' ? <BurdenGradientLegend /> : <ProgramLegendItems />}
      </div>

      {showHint && !selectedName && (
        <div className="map-hint" role="status">
          <span className="map-hint-icon" aria-hidden>
            👆
          </span>
          <div className="map-hint-text">
            <strong>Click any neighbourhood</strong> on the map to open details on
            the right.
          </div>
          <button
            type="button"
            className="map-hint-dismiss"
            onClick={onDismissHint}
            aria-label="Dismiss tip"
          >
            Got it
          </button>
        </div>
      )}

      {selectedName && (
        <div className="map-selected-badge" role="status">
          <span className="map-selected-dot" aria-hidden />
          Viewing: <strong>{selectedName}</strong>
        </div>
      )}

      {hover && (
        <div
          className="map-hover-tooltip"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
          role="tooltip"
        >
          <span className="map-hover-name">{hover.name}</span>
          <span className="map-hover-ebi">Need score: {hover.ebi.toFixed(3)}</span>
          <span
            className="map-hover-tier"
            style={{
              backgroundColor: TIER_COLORS[hover.tier].light,
              color: TIER_COLORS[hover.tier].text,
            }}
          >
            {TIER_LABELS[hover.tier].short}
          </span>
          <span className="map-hover-sub">Click for full details</span>
        </div>
      )}
    </>
  );
};

const BurdenGradientLegend: React.FC = () => (
  <div>
    <p className="map-legend-title">Energy Burden Index</p>
    <div
      className="map-gradient-bar"
      style={{
        background: `linear-gradient(to right, ${BURDEN_GRADIENT_LOW}, ${BURDEN_GRADIENT_HIGH})`,
      }}
    />
    <div className="map-gradient-labels">
      <span>Lower</span>
      <span>Higher</span>
    </div>
  </div>
);

const ProgramLegendItems: React.FC = () => {
  const items = [
    { key: 'EAP' as const, label: 'Energy Affordability' },
    { key: 'OESP' as const, label: 'Bill support (OESP)' },
    { key: 'LEAP' as const, label: 'Emergency help (LEAP)' },
    { key: 'MULTIRES' as const, label: 'Multi-unit housing' },
    { key: 'SOE_HOME' as const, label: 'Home upgrades' },
  ];
  return (
    <div>
      <p className="map-legend-title">Recommended program</p>
      <ul className="map-legend-list map-legend-list--compact">
        {items.map(({ key, label }) => (
          <li key={key} className="map-legend-item">
            <span
              className="map-legend-swatch"
              style={{ backgroundColor: PROGRAM_COLORS[key].bg }}
            />
            <span className="map-legend-label">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export function useMapHint(): [boolean, () => void] {
  const [show, setShow] = useState(() => {
    try {
      return sessionStorage.getItem('equigrid-map-hint') !== 'dismissed';
    } catch {
      return true;
    }
  });

  const dismiss = () => {
    setShow(false);
    try {
      sessionStorage.setItem('equigrid-map-hint', 'dismissed');
    } catch {
      /* ignore */
    }
  };

  return [show, dismiss];
}
