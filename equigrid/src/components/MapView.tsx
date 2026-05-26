import React, { useEffect, useRef } from 'react';
import type { Neighbourhood, Tier, ViewMode, TorontoGeoJSON, TorontoFeature } from '../types';
import { polygonColors } from '../utils/colors';

// ArcGIS Core imports
import esriConfig from '@arcgis/core/config';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import Polygon from '@arcgis/core/geometry/Polygon';
import PopupTemplate from '@arcgis/core/PopupTemplate';

// Use CDN for ArcGIS assets (avoids bundling 100MB of assets)
esriConfig.assetsPath = 'https://js.arcgis.com/4.29/@arcgis/core/assets';

interface MapViewProps {
  data: Neighbourhood[];
  geojson: TorontoGeoJSON | null;
  mode: ViewMode;
  activeTiers: Set<Tier>;
  selectedId: number | null;
  onSelectId: (id: number | null) => void;
  cimdOn: boolean;
}

// Build a lookup map for fast O(1) joins
function buildLookup(data: Neighbourhood[]): globalThis.Map<number, Neighbourhood> {
  const m = new globalThis.Map<number, Neighbourhood>();
  data.forEach((n) => m.set(n.id, n));
  return m;
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
  const mapDivRef  = useRef<HTMLDivElement>(null);
  const viewRef    = useRef<MapView | null>(null);
  const layerRef   = useRef<GraphicsLayer | null>(null);
  const cimdLayerRef = useRef<any>(null);

  // ── Initialise map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current || viewRef.current) return;

    const nbLayer = new GraphicsLayer({ id: 'neighbourhoods', title: 'Neighbourhoods' });
    layerRef.current = nbLayer;

    const map = new EsriMap({
      basemap: 'gray-vector',
      layers: [nbLayer],
    });

    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: [-79.38, 43.72],
      zoom: 11,
      ui: { components: ['zoom', 'compass'] },
      popup: {
        dockEnabled: true,
        dockOptions: { position: 'bottom-right', breakpoint: false },
      },
    });

    viewRef.current = view;

    // Click handler — identify which neighbourhood was clicked
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    view.on('click', (event: any) => {
      view.hitTest(event).then((response) => {
        const result = response.results.find(
          (r) => r.type === 'graphic' && r.graphic.layer === nbLayer
        );
        if (result && result.type === 'graphic') {
          const nbId: number | undefined = result.graphic.getAttribute('nbId');
          onSelectId(nbId != null ? nbId : null);
        } else {
          onSelectId(null);
        }
      });
    });

    return () => {
      view.destroy();
      viewRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only once

  // ── Render / re-render polygons when data, mode, tiers, selection change ──
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !geojson || data.length === 0) return;

    const lookup = buildLookup(data);
    const graphics: Graphic[] = [];

    for (const feature of geojson.features as TorontoFeature[]) {
      const code = parseInt(feature.properties.AREA_SHORT_CODE, 10);
      const nb   = lookup.get(code);
      if (!nb) continue;

      const { fill, outline, opacity } = polygonColors(
        nb.ebi,
        nb.primaryKey,
        nb.tier,
        mode,
        activeTiers,
      );

      // Highlight selected
      const isSelected = nb.id === selectedId;
      const outlineColor = isSelected ? '#1D4ED8' : outline;
      const outlineWidth = isSelected ? 2.5 : 0.8;

      // Build geometry from GeoJSON
      let polygon: Polygon;
      if (feature.geometry.type === 'Polygon') {
        polygon = new Polygon({
          rings: feature.geometry.coordinates as number[][][],
          spatialReference: { wkid: 4326 },
        });
      } else {
        // MultiPolygon — flatten to single polygon (outer rings only)
        const coords = feature.geometry.coordinates as number[][][][];
        polygon = new Polygon({
          rings: coords.flat(),
          spatialReference: { wkid: 4326 },
        });
      }

      const symbol = new SimpleFillSymbol({
        color: hexToRgba(fill, opacity),
        outline: new SimpleLineSymbol({
          color: outlineColor,
          width: outlineWidth,
        }),
      });

      const graphic = new Graphic({
        geometry: polygon,
        symbol,
        attributes: {
          nbId:       nb.id,
          name:       nb.name,
          ebi:        nb.ebi.toFixed(3),
          tier:       nb.tier,
          rank:       nb.rank,
          program:    nb.primaryName,
        },
        popupTemplate: new PopupTemplate({
          title: '{name}',
          content: [
            {
              type: 'fields',
              fieldInfos: [
                { fieldName: 'rank',    label: 'Rank' },
                { fieldName: 'ebi',     label: 'EBI Score' },
                { fieldName: 'tier',    label: 'Tier' },
                { fieldName: 'program', label: 'Primary Program' },
              ],
            },
          ],
        }),
      });

      graphics.push(graphic);
    }

    layer.removeAll();
    layer.addMany(graphics);
  }, [data, geojson, mode, activeTiers, selectedId]);

  // ── Zoom to selected neighbourhood ───────────────────────────────────────
  useEffect(() => {
    if (!viewRef.current || selectedId == null) return;
    const layer = layerRef.current;
    if (!layer) return;

    const graphic = layer.graphics.find((g) => g.getAttribute('nbId') === selectedId);
    if (graphic?.geometry) {
      viewRef.current.goTo(
        { target: graphic.geometry, zoom: 13 },
        { duration: 600 }
      );
    }
  }, [selectedId]);

  // ── CIMD overlay (stub — Member 4 fills this in) ─────────────────────────
  useEffect(() => {
    // Member 4: replace this stub with a real FeatureLayer from ArcGIS Living Atlas
    // const cimdUrl = 'https://services.arcgis.com/.../...';
    // if (cimdOn && !cimdLayerRef.current) { ... }
    // if (!cimdOn && cimdLayerRef.current) { ... }
    if (cimdLayerRef.current) {
      cimdLayerRef.current.visible = cimdOn;
    }
  }, [cimdOn]);

  return (
    <div
      ref={mapDivRef}
      className="flex-1 h-full"
      style={{ position: 'relative' }}
    />
  );
};

// ─── Helper: convert hex + opacity to [r,g,b,a] array for ArcGIS ─────────────
function hexToRgba(color: string, opacity: number): [number, number, number, number] {
  // Handle rgb(...) format from burdenColor()
  const rgbMatch = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]),
      parseInt(rgbMatch[2]),
      parseInt(rgbMatch[3]),
      Math.round(opacity * 255),
    ];
  }

  // Handle hex format
  const hex = color.replace('#', '');
  const r   = parseInt(hex.slice(0, 2), 16);
  const g   = parseInt(hex.slice(2, 4), 16);
  const b   = parseInt(hex.slice(4, 6), 16);
  return [r, g, b, Math.round(opacity * 255)];
}
