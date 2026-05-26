import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { Neighbourhood, Tier, ViewMode, TorontoGeoJSON, TorontoFeature } from '../types';
import {
  burdenColorHex,
  mapNeighbourhoodStyle,
  MAP_STROKE_SELECTED,
} from '../utils/colors';
import { TIER_LABELS } from '../data/labels';
import { MapOverlay, useMapHint, type MapHoverInfo } from './MapOverlay';

import esriConfig from '@arcgis/core/config';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import Polygon from '@arcgis/core/geometry/Polygon';
import type Point from '@arcgis/core/geometry/Point';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';

// Must match installed @arcgis/core major version (package.json: ^5.x)
esriConfig.assetsPath = 'https://js.arcgis.com/5.0/@arcgis/core/assets';

const TORONTO_CENTER: [number, number] = [-79.38, 43.72];
const CITY_ZOOM = 10;

interface MapViewProps {
  data: Neighbourhood[];
  geojson: TorontoGeoJSON | null;
  mode: ViewMode;
  activeTiers: Set<Tier>;
  selectedId: number | null;
  onSelectId: (id: number | null) => void;
  cimdOn: boolean;
}

function buildLookup(data: Neighbourhood[]): globalThis.Map<number, Neighbourhood> {
  const m = new globalThis.Map<number, Neighbourhood>();
  data.forEach((n) => m.set(n.id, n));
  return m;
}

/** Join key: GeoJSON AREA_SHORT_CODE (may be zero-padded) → neighbourhoods id */
function featureToNbId(areaShortCode: string): number {
  return parseInt(areaShortCode, 10);
}

function polygonsFromFeature(feature: TorontoFeature): Polygon[] {
  const sr = { wkid: 4326 };
  const { geometry } = feature;

  if (geometry.type === 'Polygon') {
    return [
      new Polygon({
        rings: geometry.coordinates as number[][][],
        spatialReference: sr,
      }),
    ];
  }

  const parts = geometry.coordinates as number[][][][];
  return parts.map(
    (rings) =>
      new Polygon({
        rings,
        spatialReference: sr,
      }),
  );
}

function findGraphicAtPoint(
  layer: GraphicsLayer,
  mapPoint: Point,
): Graphic | undefined {
  for (const g of layer.graphics.toArray()) {
    const geom = g.geometry as Polygon | undefined;
    if (geom && geometryEngine.contains(geom, mapPoint)) {
      return g;
    }
  }
  return undefined;
}

function buildNeighbourhoodGraphics(
  geojson: TorontoGeoJSON,
  lookup: globalThis.Map<number, Neighbourhood>,
  mode: ViewMode,
  activeTiers: Set<Tier>,
  hoverId: number | null,
): { graphics: Graphic[]; byId: globalThis.Map<number, Graphic[]>; joined: number; skipped: number } {
  const graphics: Graphic[] = [];
  const byId = new globalThis.Map<number, Graphic[]>();
  let joined = 0;
  let skipped = 0;

  for (const feature of geojson.features as TorontoFeature[]) {
    const code = featureToNbId(feature.properties.AREA_SHORT_CODE);
    const nb = lookup.get(code);
    if (!nb) {
      skipped += 1;
      continue;
    }
    joined += 1;

    const isHovered = nb.id === hoverId;
    const { fill, outline, outlineWidth, opacity } = mapNeighbourhoodStyle(
      nb.ebi,
      nb.primaryKey,
      nb.tier,
      mode,
      activeTiers,
      isHovered,
    );

    const [r, g, b] = hexToEsriColor(fill.startsWith('#') ? fill : '#cccccc');
    const symbol = new SimpleFillSymbol({
      color: [r, g, b, Math.round(opacity * 255)],
      outline: new SimpleLineSymbol({
        color: outline,
        width: outlineWidth,
      }),
    });

    const attributes = {
      nbId: nb.id,
      name: nb.name,
      ebi: nb.ebi,
      tier: nb.tier,
      tierLabel: TIER_LABELS[nb.tier].short,
      rank: nb.rank,
      program: nb.primaryName,
    };

    const nbGraphics: Graphic[] = [];
    for (const polygon of polygonsFromFeature(feature)) {
      const graphic = new Graphic({
        geometry: polygon,
        symbol,
        attributes,
      });
      graphics.push(graphic);
      nbGraphics.push(graphic);
    }
    byId.set(nb.id, nbGraphics);
  }

  return { graphics, byId, joined, skipped };
}

function hexToEsriColor(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export const EsriMapView: React.FC<MapViewProps> = ({
  data,
  geojson,
  mode,
  activeTiers,
  selectedId,
  onSelectId,
  cimdOn,
}) => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const layerRef = useRef<GraphicsLayer | null>(null);
  const highlightRef = useRef<GraphicsLayer | null>(null);
  const cimdLayerRef = useRef<{ visible: boolean } | null>(null);
  const onSelectIdRef = useRef(onSelectId);
  const activeTiersRef = useRef(activeTiers);
  const lookupRef = useRef(buildLookup(data));
  const graphicsByIdRef = useRef<globalThis.Map<number, Graphic[]>>(new globalThis.Map());
  const viewReadyRef = useRef(false);

  const [hoverId, setHoverId] = useState<number | null>(null);
  const [hoverScreen, setHoverScreen] = useState<{ x: number; y: number } | null>(null);
  const [showHint, dismissHint] = useMapHint();

  onSelectIdRef.current = onSelectId;
  activeTiersRef.current = activeTiers;
  lookupRef.current = buildLookup(data);

  const activeTierKey = useMemo(
    () => [...activeTiers].sort().join(','),
    [activeTiers],
  );

  const selectedName = useMemo(
    () => data.find((n) => n.id === selectedId)?.name ?? null,
    [data, selectedId],
  );

  const hoverInfo: MapHoverInfo | null = useMemo(() => {
    if (hoverId == null || !hoverScreen) return null;
    const nb = data.find((n) => n.id === hoverId);
    if (!nb || !activeTiers.has(nb.tier)) return null;
    return {
      name: nb.name,
      tier: nb.tier,
      ebi: nb.ebi,
      x: hoverScreen.x,
      y: hoverScreen.y,
    };
  }, [hoverId, hoverScreen, data, activeTiers]);

  // Drop hover/selection when the hovered neighbourhood is filtered off
  useEffect(() => {
    if (hoverId == null) return;
    const hovered = data.find((n) => n.id === hoverId);
    if (hovered && !activeTiers.has(hovered.tier)) {
      setHoverId(null);
      setHoverScreen(null);
    }
  }, [activeTierKey, hoverId, data, activeTiers]);

  // ── Initialise map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current || viewRef.current) return;

    const nbLayer = new GraphicsLayer({
      id: 'neighbourhoods',
      title: 'Neighbourhoods',
    });
    (nbLayer as GraphicsLayer & { popupEnabled: boolean }).popupEnabled = false;

    const highlightLayer = new GraphicsLayer({
      id: 'selection-highlight',
      title: 'Selection',
      listMode: 'hide',
    });
    (highlightLayer as GraphicsLayer & { popupEnabled: boolean }).popupEnabled = false;

    layerRef.current = nbLayer;
    highlightRef.current = highlightLayer;

    const map = new EsriMap({
      basemap: 'gray-vector',
      layers: [nbLayer, highlightLayer],
    });

    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: TORONTO_CENTER,
      zoom: CITY_ZOOM,
      constraints: {
        minZoom: 9,
        maxZoom: 18,
      },
      ui: { components: ['zoom', 'compass'] },
      popupEnabled: false,
    });

    viewRef.current = view;
    viewReadyRef.current = false;

    view.when(() => {
      viewReadyRef.current = true;
      view.closePopup();
    });

    const resolveGraphic = async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event: any,
    ): Promise<Graphic | undefined> => {
      const response = await view.hitTest(event, { include: nbLayer });
      const hit = response.results.find(
        (r) => r.type === 'graphic' && r.graphic.layer === nbLayer,
      );
      const graphic =
        hit?.type === 'graphic'
          ? hit.graphic
          : event.mapPoint
            ? findGraphicAtPoint(nbLayer, event.mapPoint)
            : undefined;

      if (!graphic) return undefined;

      const nbId = graphic.getAttribute('nbId') as number | undefined;
      if (nbId == null) return undefined;

      const nb = lookupRef.current.get(nbId);
      if (!nb || !activeTiersRef.current.has(nb.tier)) return undefined;

      return graphic;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moveHandle = view.on('pointer-move', async (event: any) => {
      if (event.native?.buttons > 0) return;
      const graphic = await resolveGraphic(event);
      const container = view.container as HTMLElement;

      if (graphic) {
        const nbId = graphic.getAttribute('nbId') as number | undefined;
        if (nbId != null) {
          setHoverId(nbId);
          setHoverScreen({ x: event.x, y: event.y });
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoverId(null);
      setHoverScreen(null);
      container.style.cursor = 'default';
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clickHandle = view.on('click', async (event: any) => {
      const graphic = await resolveGraphic(event);
      if (graphic) {
        const nbId = graphic.getAttribute('nbId') as number | undefined;
        if (nbId != null) {
          onSelectIdRef.current(nbId);
          return;
        }
      }
      onSelectIdRef.current(null);
    });

    return () => {
      moveHandle.remove();
      clickHandle.remove();
      view.destroy();
      viewRef.current = null;
      layerRef.current = null;
      highlightRef.current = null;
      viewReadyRef.current = false;
      graphicsByIdRef.current.clear();
    };
  }, []);

  // ── Choropleth graphics (after view is ready) ─────────────────────────────
  useEffect(() => {
    const layer = layerRef.current;
    const view = viewRef.current;
    if (!layer || !view || !geojson || data.length === 0) return;

    let cancelled = false;

    const applyGraphics = () => {
      if (cancelled) return;

      const lookup = buildLookup(data);
      const { graphics, byId, joined, skipped } = buildNeighbourhoodGraphics(
        geojson,
        lookup,
        mode,
        activeTiers,
        hoverId,
      );

      console.log('[MapView] choropleth join:', {
        joined,
        skipped,
        graphics: graphics.length,
        sampleEbi: graphics[0]?.getAttribute('ebi'),
        sampleFill: burdenColorHex(
          (lookup.get(
            graphics[0]?.getAttribute('nbId') as number,
          )?.ebi) ?? 0,
        ),
      });

      layer.removeAll();
      if (graphics.length > 0) {
        layer.addMany(graphics);
      }
      graphicsByIdRef.current = byId;
    };

    if (viewReadyRef.current) {
      applyGraphics();
    } else {
      view.when().then(applyGraphics);
    }

    return () => {
      cancelled = true;
    };
  }, [data, geojson, mode, activeTierKey, hoverId]);

  // ── Selection outline only (never moves camera) ───────────────────────────
  useEffect(() => {
    const highlightLayer = highlightRef.current;
    if (!highlightLayer) return;

    highlightLayer.removeAll();
    if (selectedId == null) return;

    const selected = data.find((n) => n.id === selectedId);
    if (!selected || !activeTiers.has(selected.tier)) return;

    const parts = graphicsByIdRef.current.get(selectedId);
    if (!parts?.length) return;

    const highlightGraphics = parts.map(
      (g) =>
        new Graphic({
          geometry: g.geometry,
          symbol: new SimpleFillSymbol({
            color: [0, 0, 0, 0],
            outline: new SimpleLineSymbol({
              color: MAP_STROKE_SELECTED,
              width: 3,
            }),
          }),
        }),
    );

    highlightLayer.addMany(highlightGraphics);
  }, [selectedId, activeTierKey, data]);

  useEffect(() => {
    if (cimdLayerRef.current) {
      cimdLayerRef.current.visible = cimdOn;
    }
  }, [cimdOn]);

  return (
    <div className="map-shell">
      <div ref={mapDivRef} className="map-canvas" />
      <MapOverlay
        mode={mode}
        hover={hoverInfo}
        selectedName={selectedName}
        showHint={showHint}
        onDismissHint={dismissHint}
      />
    </div>
  );
};
