import { useEffect } from "react";
import { currentChoices, type Action, type Delta, type GameState } from "../../engine";
import { skillLabel } from "../components/Party";

export function Deltas({ deltas }: { deltas: Delta[] }) {
  if (!deltas.length) return null;
  return (
    <ul className="deltas" aria-label="Effects">
      {deltas.map((d, i) => {
        // Heat going up is bad; days lost and ground lost are always bad.
        const good = d.unit === "days" || d.label === "Lost ground" ? false : d.label === "Heat" ? d.value < 0 : d.value > 0;
        const sign = d.value > 0 ? "+" : "−";
        const abs = Math.abs(d.value);
        if (d.unit === "tag") return <li key={i} className={good ? "good" : "bad"}>{d.label}</li>;
        const shown = d.unit === "$" ? `${sign}$${abs}` : d.unit === "days" ? `${abs} day${abs === 1 ? "" : "s"}` : `${sign}${abs}${d.unit === "mi" ? " mi" : d.unit === "gal" ? " gal" : ""}`;
        return <li key={i} className={good ? "good" : "bad"}>{d.label} {shown}</li>;
      })}
    </ul>
  );
}

export function EventCard({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const choices = currentChoices(state).filter(c => c.visible);

  // Number keys pick a choice.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      const c = choices[n - 1];
      if (c?.enabled) dispatch({ type: "choose", choice: c.index });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices, dispatch]);

  if (state.phase.kind !== "event") return null;
  const ev = state.phase.event;
  return (
    <section className="panel card-event" aria-labelledby="event-h">
      <h2 id="event-h">{ev.title}</h2>
      <p className="prose">{ev.text}</p>
      <ol className="choices">
        {choices.map((c, i) => (
          <li key={c.index}>
            <button className="choice" disabled={!c.enabled} onClick={() => dispatch({ type: "choose", choice: c.index })}>
              <span className="choice-key" aria-hidden>{i + 1}</span>
              <span className="choice-body">
                <span>{c.label}</span>
                <span className="choice-meta">
                  {c.odds !== undefined && c.skill && (
                    <span className={`odds ${c.odds >= 60 ? "good" : c.odds >= 40 ? "mid" : "bad"}`}>
                      {skillLabel(c.skill)}{c.skilledName ? ` (${c.skilledName})` : ""}: {c.odds}%
                    </span>
                  )}
                  {c.odds === undefined && c.skilledName && <span className="odds good">{skillLabel(c.skill!)} ({c.skilledName})</span>}
                  {c.cost?.money && <span className="cost">${c.cost.money}</span>}
                  {c.cost?.food && <span className="cost">{c.cost.food} food</span>}
                  {c.cost?.fuel && <span className="cost">{c.cost.fuel} gal</span>}
                  {c.cost?.items?.parts && <span className="cost">Spare parts</span>}
                  {!c.enabled && c.reason && <span className="muted">{c.reason}</span>}
                </span>
                {c.oddsParts && c.oddsParts.length > 1 && (
                  <span className="odds-why">
                    {c.oddsParts.map((p, k) => `${k === 0 ? "" : p.value >= 0 ? " + " : " − "}${k === 0 ? `${p.label} ${p.value}` : `${p.label} ${Math.abs(p.value)}`}`).join("")}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function OutcomeCard({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); dispatch({ type: "continue" }); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  if (state.phase.kind !== "outcome") return null;
  const o = state.phase.outcome;
  return (
    <section className={`panel card-outcome${o.deaths.length ? " severe" : ""}`} aria-live="polite">
      <h2>
        {o.title}
        {o.success !== undefined && <span className={`pill ${o.success ? "good" : "bad"}`}>{o.success ? "Success" : "Failed"}</span>}
      </h2>
      <p className="prose">{o.text}</p>
      <Deltas deltas={o.deltas} />
      {o.deaths.map(d => <p key={d} className="death">{d} did not make it.</p>)}
      <button className="btn primary" autoFocus onClick={() => dispatch({ type: "continue" })}>Continue</button>
    </section>
  );
}
