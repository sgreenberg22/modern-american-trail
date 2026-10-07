import type { GameState } from "../../engine";

// Placeholder map: stops plotted by real latitude/longitude on a plain projection.
// Phase 4 replaces this with a proper US map (us-atlas + d3-geo).
const W = 640, H = 300, PAD = 24;
const LON: [number, number] = [-125, -70];
const LAT: [number, number] = [36.5, 48.5];
const x = (lon: number) => PAD + ((lon - LON[0]) / (LON[1] - LON[0])) * (W - 2 * PAD);
const y = (lat: number) => PAD + ((LAT[1] - lat) / (LAT[1] - LAT[0])) * (H - 2 * PAD);

export function RouteMap({ state }: { state: GameState }) {
  const pts = state.stops.map(s => [x(s.lon), y(s.lat)] as const);
  const leg = state.legs[state.stopIndex];
  const f = leg ? state.milesIntoLeg / leg.miles : 0;
  const a = pts[state.stopIndex], b = pts[state.stopIndex + 1] ?? a;
  const here: [number, number] = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const traveled = [...pts.slice(0, state.stopIndex + 1), here];

  return (
    <figure className="map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Route map: ${state.totalMiles} miles traveled`}>
        <polyline points={pts.map(p => p.join(",")).join(" ")} className="route-ahead" />
        <polyline points={traveled.map(p => p.join(",")).join(" ")} className="route-done" />
        {state.stops.map((s, i) => {
          const major = s.kind !== "waypoint";
          return (
            <g key={s.id} className={`stop ${s.kind}${i <= state.stopIndex ? " visited" : ""}`}>
              <circle cx={pts[i][0]} cy={pts[i][1]} r={major ? 5 : 2.5} />
              {(s.kind === "paradise" || s.kind === "goal") && (
                <text x={pts[i][0]} y={pts[i][1] - 9} textAnchor="middle">{s.short}</text>
              )}
            </g>
          );
        })}
        <circle cx={here[0]} cy={here[1]} r={6} className="you" />
      </svg>
    </figure>
  );
}
