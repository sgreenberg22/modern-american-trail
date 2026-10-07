import { CalendarDays, Car, CloudRain, DollarSign, Fuel, MapPin, Siren, Wheat } from "lucide-react";
import {
  calendar, currentStop, daysOfFood, HEAT, milesToNext, nextStop, rangeMiles, totalRouteMiles, WEATHER, type GameState
} from "../../engine";

export function Hud({ state }: { state: GameState }) {
  const total = totalRouteMiles(state);
  const progress = Math.min(100, (state.totalMiles / total) * 100);
  const here = currentStop(state);
  const next = nextStop(state);
  const foodDays = daysOfFood(state);
  // Arrival events and their outcomes happen at the stop, not on the road toward the next one.
  const ph = state.phase;
  const atStop = ph.kind === "town" || ph.kind === "landmark" || ((ph.kind === "event" || ph.kind === "outcome") && ph.then !== "road");
  const cal = calendar(state);
  const wanted = state.heat >= HEAT.wanted;

  return (
    <header className="hud" aria-label="Status">
      <div className="hud-where">
        <MapPin size={16} aria-hidden />
        <div>
          <div className="hud-place">{atStop || !next ? here.name : `Heading to ${next.name}`}</div>
          <div className="muted small">
            {cal.label} · <CloudRain size={12} aria-hidden /> {WEATHER[state.weather].label}
            {!atStop && next ? ` · ${milesToNext(state)} mi to go` : ""}
          </div>
        </div>
      </div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Distance to Vermont">
        <div style={{ width: `${progress}%` }} />
      </div>
      <dl className="hud-stats">
        <div><dt><CalendarDays size={14} aria-hidden /> Day</dt><dd>{state.day}</dd></div>
        <div className={foodDays <= 3 ? "warn" : undefined}>
          <dt><Wheat size={14} aria-hidden /> Food</dt>
          <dd>{Math.floor(state.food)} <span className="muted small">({foodDays === Infinity ? "–" : `${foodDays}d`})</span></dd>
        </div>
        <div><dt><DollarSign size={14} aria-hidden /> Cash</dt><dd>${state.money}</dd></div>
        <div className={state.fuel < 5 ? "warn" : undefined}>
          <dt><Fuel size={14} aria-hidden /> Gas</dt>
          <dd>{state.fuel.toFixed(0)} gal</dd>
          <span className="muted small hud-sub">{rangeMiles(state)} mi range</span>
        </div>
        <div className={state.van < 30 ? "warn" : undefined}><dt><Car size={14} aria-hidden /> Van</dt><dd>{state.van}%</dd></div>
        <div className={wanted ? "warn" : undefined}>
          <dt><Siren size={14} aria-hidden /> Heat{wanted ? " · Wanted" : ""}</dt>
          <dd>
            <div className="heat" role="meter" aria-label="Heat" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(state.heat)}>
              <div style={{ width: `${state.heat}%` }} />
              <span className="mark" style={{ left: `${HEAT.wanted}%` }} title="Wanted" />
            </div>
          </dd>
        </div>
      </dl>
    </header>
  );
}
