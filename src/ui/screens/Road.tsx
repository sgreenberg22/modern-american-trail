import { useEffect } from "react";
import {
  daysOfFood, expectedMilesPerDay, HEAT, milesToNext, milesToNextGas, nextStop, rangeMiles, WEATHER,
  type Action, type GameState
} from "../../engine";

export function Road({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        dispatch({ type: "travel" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const d = state.lastDay;
  const today = d && d.day === state.day ? d : null;
  const next = nextStop(state);
  const eta = Math.max(1, Math.ceil(milesToNext(state) / expectedMilesPerDay(state)));
  const food = daysOfFood(state);
  const gasShort = rangeMiles(state) < milesToNextGas(state);

  return (
    <section className="panel card-road" aria-labelledby="road-h">
      <h2 id="road-h">{today ? `Day ${today.day}` : "On the road"}</h2>
      {today ? (
        <p className="prose">
          {today.miles} miles{today.weather !== "clear" ? ` through ${WEATHER[today.weather].label.toLowerCase()}` : ""}
          {today.passed.length ? `, past ${today.passed.join(" and ")}` : ""}.
          {today.outOfFuel ? " The tank ran dry and you finished the day on foot." : ""}
          {today.starving ? " There wasn't enough food to go around." : ""}
          {today.newConditions.length ? ` ${today.newConditions.join(" ")}` : ""}
          {today.deaths.map(n => ` ${n} did not survive the day.`).join("")}
        </p>
      ) : (
        <p className="prose">The van is packed. Vermont is a long way east.</p>
      )}
      {next && (
        <p className="muted">
          Next: <strong>{next.name}</strong>, about {eta} day{eta === 1 ? "" : "s"} away.
        </p>
      )}
      <ul className="warnings">
        {food < eta && <li className="warn">Food won't last that long.</li>}
        {gasShort && <li className="warn">Not enough gas to reach the next station ({rangeMiles(state)} mi of range).</li>}
        {state.heat >= HEAT.wanted && <li className="warn">You're wanted. Checkpoints are harder and someone may come looking. Lay low at a landmark or rest in a paradise.</li>}
        {state.van > 0 && state.van < 30 && <li className="warn">The van could break down any day.</li>}
      </ul>
      <button className="btn primary" autoFocus onClick={() => dispatch({ type: "travel" })}>Drive on</button>
    </section>
  );
}
