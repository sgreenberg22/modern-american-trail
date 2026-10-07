import { BedDouble, Briefcase, EyeOff, MessageCircle, Search } from "lucide-react";
import {
  checkOdds, currentStop, factionLabel, HEAT, LANDMARKS, RULES,
  type Action, type GameState, type LandmarkActionId
} from "../../engine";
import { Market } from "../components/Market";

export function Landmark({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const stop = currentStop(state);
  const lm = LANDMARKS[stop.id];
  if (!lm) return null;
  const used = state.landmarkUsed;
  const left = RULES.landmarkActions - used.length;
  const talkOdds = Math.max(
    checkOdds(state, { skill: "persuasion", difficulty: "medium", faction: lm.faction }),
    checkOdds(state, { skill: "negotiation", difficulty: "medium", faction: lm.faction })
  );
  const scavengeOdds = checkOdds(state, { skill: "survival", difficulty: "medium" });

  const actions: { id: LandmarkActionId; icon: typeof Search; label: string; detail: string; disabled?: boolean }[] = [
    { id: "talk", icon: MessageCircle, label: "Talk to locals", detail: `${talkOdds}%: cools heat and earns ${factionLabel(lm.faction)} goodwill, or raises heat if it goes badly.` },
    { id: "scavenge", icon: Search, label: "Scavenge", detail: `${scavengeOdds}%: food and maybe spare parts, or someone gets hurt.` },
    { id: "work", icon: Briefcase, label: "Pick up odd jobs", detail: `A day's work for $${RULES.workPay[0]}–${RULES.workPay[1]} cash. Slightly more visible.` },
    { id: "layLow", icon: EyeOff, label: "Lay low", detail: `Lose a day, cool heat by ${HEAT.layLowCooldown}.` },
    { id: "motel", icon: BedDouble, label: `Motel ($${RULES.motelCost})`, detail: "A night in a real bed cures exhaustion. The clerk photocopies your IDs.", disabled: state.money < RULES.motelCost }
  ];

  return (
    <section className="panel card-landmark" aria-labelledby="lm-h">
      <h2 id="lm-h">{stop.name}</h2>
      <p className="prose">{lm.intro}</p>

      <Market state={state} dispatch={dispatch} title="Gas station" />

      <h3 className="sub">While you're here <span className="muted small">({left} of {RULES.landmarkActions} left)</span></h3>
      <ul className="lm-actions">
        {actions.map(a => {
          const done = used.includes(a.id);
          const Icon = a.icon;
          return (
            <li key={a.id}>
              <button className="choice" disabled={done || left <= 0 || a.disabled} onClick={() => dispatch({ type: "landmark", action: a.id })}>
                <Icon size={18} aria-hidden className="shop-icon" />
                <span className="choice-body">
                  <span>{a.label}{done ? " (done)" : ""}</span>
                  <span className="muted small">{a.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button className="btn primary" onClick={() => dispatch({ type: "leaveTown" })}>Move on</button>
    </section>
  );
}
