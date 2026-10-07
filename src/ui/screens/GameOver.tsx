import { living, type GameState } from "../../engine";

const CAUSE_TEXT: Record<string, string> = {
  starvation: "The food ran out.",
  exhaustion: "The road wore everyone down."
};

export function GameOver({ state, onNewGame }: { state: GameState; onNewGame: () => void }) {
  if (state.phase.kind !== "over") return null;
  const win = state.phase.result === "win";
  const survivors = living(state);
  const cause = state.phase.cause;

  return (
    <section className={`panel card-over ${win ? "win" : "lose"}`} aria-labelledby="over-h">
      <h2 id="over-h">{win ? "You made it to Vermont" : "The trail ends here"}</h2>
      <p className="prose">
        {win
          ? `${survivors.map(m => m.name).join(" and ")} crossed the state line after ${state.day} days and ${state.totalMiles.toLocaleString("en-US")} miles. A volunteer hands you maple syrup and a voter registration form.`
          : `${state.day} days and ${state.totalMiles.toLocaleString("en-US")} miles in. ${cause ? CAUSE_TEXT[cause] ?? `Last seen: ${cause}.` : ""}`}
      </p>
      <dl className="summary">
        <div><dt>Survivors</dt><dd>{survivors.length} of {state.party.length}</dd></div>
        <div><dt>Days</dt><dd>{state.day}</dd></div>
        <div><dt>Events</dt><dd>{state.stats.eventsSeen}</dd></div>
        <div><dt>Skill checks</dt><dd>{state.stats.checksPassed} passed, {state.stats.checksFailed} failed</dd></div>
        <div><dt>Hungry days</dt><dd>{state.stats.foodShortDays}</dd></div>
        <div><dt>Difficulty</dt><dd className="cap">{state.difficulty}</dd></div>
      </dl>
      <button className="btn primary" autoFocus onClick={onNewGame}>Try again</button>
    </section>
  );
}
