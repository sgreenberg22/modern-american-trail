import { CalendarDays, DollarSign, MapPin, Wheat } from "lucide-react";
import { currentStop, daysOfFood, milesToNext, nextStop, totalRouteMiles, type GameState } from "../../engine";

export function Hud({ state }: { state: GameState }) {
  const total = totalRouteMiles(state);
  const progress = Math.min(100, (state.totalMiles / total) * 100);
  const here = currentStop(state);
  const next = nextStop(state);
  const foodDays = daysOfFood(state);
  const inTown = state.phase.kind === "town";

  return (
    <header className="hud" aria-label="Status">
      <div className="hud-where">
        <MapPin size={16} aria-hidden />
        <div>
          <div className="hud-place">{inTown || !next ? here.name : `Heading to ${next.name}`}</div>
          {!inTown && next && <div className="muted small">{milesToNext(state)} miles to go</div>}
        </div>
      </div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Distance to Vermont">
        <div style={{ width: `${progress}%` }} />
      </div>
      <dl className="hud-stats">
        <div><dt><CalendarDays size={14} aria-hidden /> Day</dt><dd>{state.day}</dd></div>
        <div className={foodDays <= 3 ? "warn" : undefined}>
          <dt><Wheat size={14} aria-hidden /> Food</dt>
          <dd>{Math.floor(state.food)} <span className="muted small">({foodDays === Infinity ? "–" : foodDays}d)</span></dd>
        </div>
        <div><dt><DollarSign size={14} aria-hidden /> Cash</dt><dd>${state.money}</dd></div>
        <div><dt>Miles</dt><dd>{state.totalMiles.toLocaleString("en-US")}<span className="muted small"> / {total.toLocaleString("en-US")}</span></dd></div>
      </dl>
    </header>
  );
}
