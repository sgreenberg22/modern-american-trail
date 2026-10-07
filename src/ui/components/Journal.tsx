import type { GameState } from "../../engine";
import { Deltas } from "../screens/Encounter";

export function Journal({ state, limit = 12 }: { state: GameState; limit?: number }) {
  const entries = state.journal.slice(-limit).reverse();
  return (
    <section className="panel" aria-labelledby="journal-h">
      <h2 id="journal-h" className="panel-title">Journal</h2>
      <ol className="journal">
        {entries.map((j, i) => (
          <li key={state.journal.length - i}>
            <span className="journal-day">Day {j.day}</span>
            <div>
              <strong>{j.title}</strong> <span className="prose-small">{j.text}</span>
              {j.deltas && <Deltas deltas={j.deltas} />}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
