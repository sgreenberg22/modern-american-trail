import { useState } from "react";
import {
  cargoCapacity, cargoWeight, ITEM_USES, living, PACE, RATIONS, VAN,
  type Action, type GameState, type ItemId, type Pace, type Rations
} from "../../engine";

/** Pace, rations and inventory. Available on the road and at stops. */
export function Controls({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const [using, setUsing] = useState<ItemId | null>(null);
  const items = (Object.keys(ITEM_USES) as ItemId[]).filter(k => state.items[k] > 0);
  const manageable = ["road", "town", "landmark"].includes(state.phase.kind);
  if (!manageable) return null;

  return (
    <section className="panel" aria-labelledby="controls-h">
      <h2 id="controls-h" className="panel-title">Pace and supplies</h2>

      <div className="control-row">
        <span className="control-label">Pace</span>
        <div className="segmented" role="radiogroup" aria-label="Pace">
          {(Object.keys(PACE) as Pace[]).map(p => (
            <button key={p} role="radio" aria-checked={state.pace === p} className={state.pace === p ? "on" : ""} onClick={() => dispatch({ type: "setPace", pace: p })}>
              {PACE[p].label}
            </button>
          ))}
        </div>
      </div>
      <p className="muted small">{PACE[state.pace].blurb}</p>

      <div className="control-row">
        <span className="control-label">Rations</span>
        <div className="segmented" role="radiogroup" aria-label="Rations">
          {(Object.keys(RATIONS) as Rations[]).map(r => (
            <button key={r} role="radio" aria-checked={state.rations === r} className={state.rations === r ? "on" : ""} onClick={() => dispatch({ type: "setRations", rations: r })}>
              {RATIONS[r].label}
            </button>
          ))}
        </div>
      </div>
      <p className="muted small">{RATIONS[state.rations].blurb}</p>

      <h3 className="sub">Cargo <span className="muted small">{cargoWeight(state)}/{cargoCapacity(state)} lb</span></h3>
      {items.length === 0 ? (
        <p className="muted small">No medkits, parts or books. Paradises sell them.</p>
      ) : (
        <ul className="items">
          {items.map(k => {
            const use = ITEM_USES[k];
            const pointless = k === "parts" && state.van >= 100;
            return (
              <li key={k}>
                <div className="item-body">
                  <strong>{use.name} ×{state.items[k]}</strong>
                  <span className="muted small">{use.description}{k === "parts" ? ` (+${VAN.partsRepair}, more with a mechanic)` : ""}</span>
                </div>
                {use.targeted ? (
                  <button className="btn" aria-expanded={using === k} onClick={() => setUsing(using === k ? null : k)}>Use</button>
                ) : (
                  <button className="btn" disabled={pointless} onClick={() => dispatch({ type: "useItem", item: k })}>Use</button>
                )}
                {using === k && (
                  <div className="who" role="group" aria-label={`Use ${use.name} on`}>
                    {living(state).map(m => (
                      <button key={m.id} className="btn" onClick={() => { dispatch({ type: "useItem", item: k, member: m.id }); setUsing(null); }}>
                        {m.name} <span className="muted small">{m.health}{m.conditions.length ? ` · ${m.conditions.join(", ")}` : ""}</span>
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
