// Banter and vignettes: text that makes quiet days feel like travel.
import { BANTER, type BanterLine, type BanterWhen } from "./data/banter";
import { CHECKPOINT_VIGNETTES, CITY_VIGNETTES } from "./data/vignettes";
import type { Rng } from "./rng";
import { daysOfFood, living, totalRouteMiles } from "./selectors";
import type { GameState, Member, Stop } from "./types";

/** Chance of a line of banter on a day with no event. */
export const BANTER_CHANCE = 0.65;

function fits(s: GameState, speaker: Member, w: BanterWhen | undefined): boolean {
  if (!w) return true;
  const alive = living(s);
  if (w.lowFood && daysOfFood(s) >= 3) return false;
  if (w.lowGas && s.fuel >= 5) return false;
  if (w.lowMorale && speaker.morale >= 35) return false;
  if (w.goodMood && alive.reduce((a, m) => a + m.morale, 0) / alive.length <= 70) return false;
  if (w.hurt && speaker.health >= 40 && speaker.conditions.length === 0) return false;
  if (w.wanted && s.heat < 60) return false;
  if (w.grief && alive.length === s.party.length) return false;
  if (w.nearGoal && s.totalMiles / totalRouteMiles(s) <= 0.85) return false;
  if (w.badVan && s.van >= 40) return false;
  if (w.weather && !w.weather.includes(s.weather)) return false;
  if (w.regions && !w.regions.includes((s.stops[s.stopIndex + 1] ?? s.stops[s.stopIndex]).region)) return false;
  if (w.with && !alive.some(m => m.id === w.with && m.id !== speaker.id)) return false;
  return true;
}

/** Picks a line of chatter that fits the moment, or null. Marks it seen. */
export function pickBanter(s: GameState, rng: Rng): { name: string; text: string } | null {
  const alive = living(s);
  const options: { speaker: Member; line: BanterLine }[] = [];
  for (const m of alive) {
    for (const line of BANTER[m.id] ?? []) {
      if (!fits(s, m, line.when)) continue;
      if (line.text.includes("{other}") && alive.length < 2) continue;
      options.push({ speaker: m, line });
    }
  }
  const fresh = options.filter(o => !s.seenBanter.includes(o.line.id));
  const pool = fresh.length ? fresh : options;
  if (!pool.length) return null;
  // Situational lines are the interesting ones; favor them when they apply.
  const pick = rng.weighted(pool, o => (o.line.when ? 3 : 1));
  if (!s.seenBanter.includes(pick.line.id)) s.seenBanter.push(pick.line.id);
  const others = alive.filter(m => m.id !== pick.speaker.id);
  const other = pick.line.when?.with ? others.find(m => m.id === pick.line.when!.with) : others.length ? rng.pick(others) : undefined;
  return { name: pick.speaker.name, text: pick.line.text.replaceAll("{other}", other?.name ?? "someone") };
}

/** First time you pass a checkpoint: its scene. */
export function checkpointVignette(s: GameState, passed: Stop[], rng: Rng): { title: string; text: string } | null {
  const stop = [...passed].reverse().find(p => CHECKPOINT_VIGNETTES[p.name] && !s.seenVignettes.includes(p.name));
  if (!stop) return null;
  s.seenVignettes.push(stop.name);
  const who = living(s).length ? rng.pick(living(s)).name : "Someone";
  return { title: stop.name, text: CHECKPOINT_VIGNETTES[stop.name].replaceAll("{member}", who) };
}

export function cityVignette(stopId: string): string | null {
  return CITY_VIGNETTES[stopId] ?? null;
}
