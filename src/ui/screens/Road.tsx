import { useEffect } from "react";
import { daysOfFood, expectedMilesPerDay, milesToNext, nextStop, type Action, type GameState } from "../../engine";

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
  const next = nextStop(state);
  const eta = Math.max(1, Math.ceil(milesToNext(state) / expectedMilesPerDay(state)));
  const food = daysOfFood(state);

  return (
    <section className="panel card-road" aria-labelledby="road-h">
      <h2 id="road-h">{d && d.day === state.day ? `Day ${d.day}` : "On the road"}</h2>
      {d && d.day === state.day ? (
        <p className="prose">
          You drove {d.miles} miles{d.passed.length ? `, past ${d.passed.join(" and ")}` : ""}.
          {d.starving ? " There wasn't enough food to go around." : ""}
          {d.deaths.map(n => ` ${n} did not survive the day.`).join("")}
        </p>
      ) : (
        <p className="prose">The van is packed and the tank is full. Vermont is a long way east.</p>
      )}
      {next && (
        <p className="muted">
          Next: <strong>{next.name}</strong>, about {eta} day{eta === 1 ? "" : "s"} away.
          {food < eta ? <span className="warn"> Food won't last that long.</span> : null}
        </p>
      )}
      <button className="btn primary" autoFocus onClick={() => dispatch({ type: "travel" })}>Drive on</button>
    </section>
  );
}
