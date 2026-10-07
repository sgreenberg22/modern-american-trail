// Small helpers shared by the reducer modules.
import { ENDINGS } from "./data/endings";
import { currentStop, living } from "./selectors";
import type { EndingId, GameState, JournalEntry } from "./types";

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const round1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Copies everything a step can mutate. Stops, legs, journal entries and phase
 * objects are treated as immutable once created, so they're shared, not cloned.
 */
export function cloneForStep(s: GameState): GameState {
  return {
    ...s,
    party: s.party.map(m => ({ ...m, conditions: [...m.conditions] })),
    items: { ...s.items },
    rep: { ...s.rep },
    upgrades: [...s.upgrades],
    flags: [...s.flags],
    seenEvents: [...s.seenEvents],
    landmarkUsed: [...s.landmarkUsed],
    journal: [...s.journal],
    stats: { ...s.stats }
  };
}

export function log(s: GameState, entry: Omit<JournalEntry, "day">) {
  s.journal.push({ day: s.day, ...entry });
}

export function setFlag(s: GameState, flag: string) {
  if (!s.flags.includes(flag)) s.flags.push(flag);
}

export function addHeat(s: GameState, amount: number) {
  s.heat = clamp(s.heat + amount, 0, 100);
  s.stats.maxHeat = Math.max(s.stats.maxHeat, s.heat);
}

/** Marks anyone at 0 health as dead. Returns the names. */
export function markDeaths(s: GameState, cause: (memberId: string) => string): string[] {
  const out: string[] = [];
  for (const m of s.party) {
    if (m.alive && m.health <= 0) {
      m.alive = false;
      m.causeOfDeath = cause(m.id);
      m.diedOnDay = s.day;
      out.push(m.name);
    }
  }
  return out;
}

export function fillEndingText(s: GameState, ending: EndingId): string {
  const names = living(s).map(m => m.name);
  const survivors = names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return ENDINGS[ending].text
    .replaceAll("{survivors}", survivors || "No one")
    .replaceAll("{city}", currentStop(s).short)
    .replaceAll("{days}", String(s.day))
    .replaceAll("{miles}", s.totalMiles.toLocaleString("en-US"));
}

export function finish(s: GameState, ending: EndingId, cause?: string) {
  s.phase = { kind: "over", ending, cause };
  log(s, { title: ENDINGS[ending].title, text: fillEndingText(s, ending) });
}

/** If everyone is dead, ends the run with the ending that matches how. */
export function checkWipe(s: GameState): boolean {
  if (living(s).length > 0) return false;
  const last = [...s.party].sort((a, b) => (b.diedOnDay ?? 0) - (a.diedOnDay ?? 0))[0];
  const cause = last?.causeOfDeath;
  const ending: EndingId = cause === "starvation" ? "starved" : cause === "the road" || cause === "sickness" || cause === "injuries" ? "worn-down" : "lost";
  finish(s, ending, cause);
  return true;
}

/** Goal reached: which win depends on who made it. */
export function finishAtGoal(s: GameState) {
  const alive = living(s).length;
  finish(s, alive === s.party.length ? "full-house" : alive === 1 ? "lone-survivor" : "vermont");
}
