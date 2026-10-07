import { useState } from "react";
import { BedDouble, Home, Wrench } from "lucide-react";
import {
  cityVignette, currentStop, expectedMilesPerDay, foodPerDay, garageCost, living, milesToNextTown, nextTown, RULES, UPGRADES, VAN,
  type Action, type GameState
} from "../../engine";
import { Market } from "../components/Market";

export function Town({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const [confirmSettle, setConfirmSettle] = useState(false);
  const here = currentStop(state);
  const next = nextTown(state);
  const days = Math.ceil(milesToNextTown(state) / expectedMilesPerDay(state));
  const foodNeeded = Math.ceil(days * foodPerDay(state));
  const gasNeeded = Math.ceil((milesToNextTown(state) / VAN.mpg));
  const lowest = Math.min(...living(state).map(m => m.health));
  const tired = living(state).some(m => m.conditions.length > 0);
  const repairCost = garageCost(state);

  return (
    <section className="panel card-town" aria-labelledby="town-h">
      <h2 id="town-h">{here.name}</h2>
      {cityVignette(here.id) && <p className="prose vignette-text">{cityVignette(here.id)}</p>}
      <p className="prose">
        A safe stop. {next ? <>The next one is <strong>{next.name}</strong>, roughly {days} days of driving.
        You'll eat about <strong>{foodNeeded} food</strong> (you have {Math.floor(state.food)}) and burn about <strong>{gasNeeded} gallons</strong>, with landmark gas stations along the way.</> : null}
      </p>

      <Market state={state} dispatch={dispatch} />

      <h3 className="sub"><Wrench size={16} aria-hidden /> Garage</h3>
      <div className="shop-row">
        <span>Van condition <strong>{state.van}%</strong></span>
        <button className="btn" disabled={state.van >= 100 || state.money < repairCost} onClick={() => dispatch({ type: "repair" })}>
          {state.van >= 100 ? "No repairs needed" : `Full repair $${repairCost}`}
        </button>
      </div>

      <h3 className="sub">Upgrades</h3>
      <ul className="shop">
        {UPGRADES.map(u => {
          const owned = state.upgrades.includes(u.id);
          return (
            <li key={u.id}>
              <div className="shop-body">
                <strong>{u.name}</strong>
                <span className="muted small">{u.description}</span>
              </div>
              <button className="btn" disabled={owned || state.money < u.price} onClick={() => dispatch({ type: "buyUpgrade", upgrade: u.id })}>
                {owned ? "Owned" : `$${u.price}`}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="town-actions">
        <button className="btn" disabled={state.money < RULES.restCost} onClick={() => dispatch({ type: "rest" })}>
          <BedDouble size={16} aria-hidden /> Rest a day (${RULES.restCost})
          <span className="muted small"> +{RULES.restHealth} health, cools heat{lowest < 50 || tired ? ", recommended" : ""}</span>
        </button>
        <button className="btn primary" onClick={() => dispatch({ type: "leaveTown" })}>Hit the road</button>
      </div>

      {state.stopIndex > 0 && (
        <div className="settle">
          {confirmSettle ? (
            <>
              <p className="small">Stay in {here.short} for good? The run ends here with a partial score.</p>
              <button className="btn" onClick={() => dispatch({ type: "settle" })}><Home size={16} aria-hidden /> Yes, put down roots</button>
              <button className="btn link" onClick={() => setConfirmSettle(false)}>Keep going</button>
            </>
          ) : (
            <button className="btn link" onClick={() => setConfirmSettle(true)}>Stay here for good…</button>
          )}
        </div>
      )}
    </section>
  );
}
