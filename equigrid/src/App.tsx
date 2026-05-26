import { useState, useMemo } from 'react';
import type { Tier, ViewMode } from './types';
import { useNeighbourhoods } from './hooks/useNeighbourhoods';
import { Sidebar } from './components/Sidebar';
import { EsriMapView } from './components/MapView';
import { DetailPanel } from './components/DetailPanel';

function App() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, geojson, loading, error } = useNeighbourhoods();

  // ── State ─────────────────────────────────────────────────────────────────
  const [mode, setMode]             = useState<ViewMode>('burden');
  const [activeTiers, setActiveTiers] = useState<Set<Tier>>(
    new Set(['Critical', 'High', 'Moderate'])
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [cimdOn, setCimdOn]         = useState(false);

  // ── Selected neighbourhood ─────────────────────────────────────────────────
  const selectedNb = useMemo(
    () => data.find((n) => n.id === selectedId) ?? null,
    [data, selectedId]
  );

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚡</div>
          <p className="text-sm text-[#64748B]">Loading neighbourhood data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#FAFAFA]">
        <div className="text-center max-w-md px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-sm font-semibold text-[#DC2626] mb-2">Failed to load data</p>
          <p className="text-xs text-[#64748B] font-mono bg-[#FEF2F2] px-3 py-2 rounded">{error}</p>
          <p className="text-xs text-[#94A3B8] mt-3">
            Make sure <code>public/data/neighbourhoods.json</code> and{' '}
            <code>public/data/toronto_neighbourhoods.geojson</code> exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left sidebar */}
      <Sidebar
        data={data}
        mode={mode}
        onModeChange={setMode}
        activeTiers={activeTiers}
        onTiersChange={setActiveTiers}
        selectedId={selectedId}
        onSelectId={setSelectedId}
        cimdOn={cimdOn}
        onCimdChange={setCimdOn}
      />

      {/* Map (fills remaining space) */}
      <main className="flex-1 relative h-full">
        <EsriMapView
          data={data}
          geojson={geojson}
          mode={mode}
          activeTiers={activeTiers}
          selectedId={selectedId}
          onSelectId={setSelectedId}
          cimdOn={cimdOn}
        />
      </main>

      {/* Right detail panel (always mounted; shows empty state when nothing selected) */}
      <DetailPanel
        neighbourhood={selectedNb}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

export default App;
