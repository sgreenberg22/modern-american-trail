import { useState } from "react";
import {
  cargoCapacity, cargoWeight, ITEMS_BY_ID, living, PACE, RATIONS,
  type Action, type GameState, type ItemDef, type Pace, type Rations
} from "../../engine";

const KIND_ORDER: ItemDef["kind"][] = ["supply", "tool", "trade", "curio"];
const KIND_LABEL: Record<ItemDef["kind"], string> = { supply: "Supplies", tool: "Tools (always working)", trade: "Trade goods", curio: "Keepsakes" };

/** Pace, rations and inventory. Available on the road and at stops. */
export function Controls({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const [using, setUsing] = useState<string | null>(null);
  const manageable = ["road", "town", "landmark"].includes(state.phase.kind);
  if (!manageable) return null;
  const owned = Object.entries(state.items)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => ({ def: ITEMS_BY_ID.get(id)!, n }))
    .filter(x => x.def);

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
      {owned.length === 0 && <p className="muted small">Nothing but food. Paradises sell supplies; the road provides stranger things.</p>}
      {KIND_ORDER.map(kind => {
        const group = owned.filter(x => x.def.kind === kind);
        if (!group.length) return null;
        return (
          <div key={kind}>
            <h4 className="kind-label">{KIND_LABEL[kind]}</h4>
            <ul className="items">
              {group.map(({ def, n }) => (
                <li key={def.id}>
                  <div className="item-body">
                    <strong>{def.name}{n > 1 ? ` ×${n}` : ""}</strong>
                    <span className="muted small">{def.description}</span>
                  </div>
                  {def.use && (def.use.targeted ? (
                    <button className="btn" aria-expanded={using === def.id} onClick={() => setUsing(using === def.id ? null : def.id)}>Use</button>
                  ) : (
                    <button className="btn" onClick={() => dispatch({ type: "useItem", item: def.id })}>Use</button>
                  ))}
                  {using === def.id && (
                    <div className="who" role="group" aria-label={`Use ${def.name} on`}>
                      {living(state).map(m => (
                        <button key={m.id} className="btn" onClick={() => { dispatch({ type: "useItem", item: def.id, member: m.id }); setUsing(null); }}>
                          {m.name} <span className="muted small">{m.health}{m.conditions.length ? ` · ${m.conditions.join(", ")}` : ""}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
