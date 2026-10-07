// Player bots for the simulation harness. Bots see only what a player sees:
// public state, choice labels, costs and displayed odds; they never peek at RNG.
import {
  applyAction, currentChoices, daysOfFood, expectedMilesPerDay, foodPerDay, living,
  shopPrice, UPGRADES, EVENTS_BY_ID, type Action, type Effects, type GameState, type Outcome
} from "../src/engine";
import { Rng } from "../src/engine/rng";
import { RULES } from "../src/engine/config";

export type BotName = "smart" | "casual" | "random";
export type Bot = (s: GameState, rng: Rng) => Action;

/** Miles from here to the next paradise or the goal. */
function milesToNextTown(s: GameState): number {
  let miles = 0;
  for (let i = s.stopIndex; i < s.legs.length; i++) {
    miles += s.legs[i].miles - (i === s.stopIndex ? s.milesIntoLeg : 0);
    const k = s.stops[i + 1].kind;
    if (k === "paradise" || k === "goal") break;
  }
  return miles;
}

function utility(s: GameState, e: Effects | undefined): number {
  if (!e) return 0;
  const n = living(s).length;
  const lowest = Math.min(...living(s).map(m => m.health));
  const healthWeight = lowest < 40 ? 2 : 1; // health matters more when someone is close to dying
  return (e.health ?? 0) * n * healthWeight + (e.healthOne ?? 0) * healthWeight +
    (e.morale ?? 0) * n * 0.3 + (e.food ?? 0) * 1.2 + (e.money ?? 0) * 0.08 + (e.miles ?? 0) * 0.08 -
    (e.delay ?? 0) * (foodPerDay(s) * 1.2 + 3 * n);
}

function expected(s: GameState, outcomes: Outcome[] | undefined): number {
  if (!outcomes?.length) return 0;
  const total = outcomes.reduce((a, o) => a + (o.weight ?? 1), 0);
  return outcomes.reduce((a, o) => a + ((o.weight ?? 1) / total) * utility(s, o.effects), 0);
}

export const smartBot: Bot = (s) => {
  if (s.phase.kind === "outcome") return { type: "continue" };
  if (s.phase.kind === "road") return { type: "travel" };

  if (s.phase.kind === "event") {
    const ev = EVENTS_BY_ID.get(s.phase.event.eventId)!;
    const views = currentChoices(s).filter(v => v.visible && v.enabled);
    let best = views[0], bestScore = -Infinity;
    for (const v of views) {
      const c = ev.choices[v.index];
      const cost = (c.cost?.money ?? 0) * 0.08 + (c.cost?.food ?? 0) * 1.2;
      const score = c.check
        ? (v.odds! / 100) * expected(s, c.success) + (1 - v.odds! / 100) * expected(s, c.failure) - cost
        : expected(s, c.outcomes) - cost;
      if (score > bestScore) { best = v; bestScore = score; }
    }
    return { type: "choose", choice: best.index };
  }

  if (s.phase.kind === "town") {
    const daysNeeded = milesToNextTown(s) / Math.max(1, expectedMilesPerDay(s));
    const targetFood = (daysNeeded * 1.35 + 4) * foodPerDay(s);
    const rationPrice = shopPrice(s, "rations");
    if (s.food < targetFood && s.money >= rationPrice) return { type: "buy", item: "rations" };

    const lowest = Math.min(...living(s).map(m => m.health));
    const avgMorale = living(s).reduce((a, m) => a + m.morale, 0) / living(s).length;
    const reserve = 2 * rationPrice;
    if (lowest < 55 && s.money >= shopPrice(s, "medkit") + reserve) return { type: "buy", item: "medkit" };
    if (avgMorale < 35 && s.money >= shopPrice(s, "books") + reserve) return { type: "buy", item: "books" };
    for (const id of ["pantry", "vehicle", "comms"]) {
      const up = UPGRADES.find(u => u.id === id)!;
      if (!s.upgrades.includes(id) && s.money >= up.price + 150) return { type: "buyUpgrade", upgrade: id };
    }
    if (lowest < 45 && daysOfFood(s) > daysNeeded + 2 && s.money >= RULES.restCost + reserve) return { type: "rest" };
    return { type: "leaveTown" };
  }
  return { type: "continue" };
};

/** A careless player: random choices, buys a little food at random, never rests. */
export const randomBot: Bot = (s, rng) => {
  if (s.phase.kind === "outcome") return { type: "continue" };
  if (s.phase.kind === "road") return { type: "travel" };
  if (s.phase.kind === "event") {
    const views = currentChoices(s).filter(v => v.visible && v.enabled);
    return { type: "choose", choice: rng.pick(views).index };
  }
  if (s.phase.kind === "town" && rng.chance(0.6) && s.money >= shopPrice(s, "rations")) return { type: "buy", item: "rations" };
  return { type: "leaveTown" };
};

/**
 * A first-time player: usually picks the sensible option, keeps food stocked,
 * but never buys medicine or upgrades and never rests.
 */
export const casualBot: Bot = (s, rng) => {
  if (s.phase.kind === "event") {
    if (rng.chance(0.3)) return randomBot(s, rng);
    return smartBot(s, rng);
  }
  if (s.phase.kind === "town") {
    const daysNeeded = milesToNextTown(s) / Math.max(1, expectedMilesPerDay(s));
    if (s.food < daysNeeded * foodPerDay(s) * 1.2 && s.money >= shopPrice(s, "rations")) return { type: "buy", item: "rations" };
    return { type: "leaveTown" };
  }
  return smartBot(s, rng);
};

export const BOTS: Record<BotName, Bot> = { smart: smartBot, casual: casualBot, random: randomBot };

export interface RunResult { win: boolean; days: number; cause?: string; survivors: number; eventsSeen: number; uniqueEvents: number; starvingDays: number }

export function playRun(start: GameState, bot: Bot, botSeed: number, maxActions = 5000): RunResult {
  let s = start;
  const rng = new Rng(botSeed);
  for (let i = 0; i < maxActions && s.phase.kind !== "over"; i++) {
    const next = applyAction(s, bot(s, rng));
    if (next === s) throw new Error(`Bot made an invalid move in phase ${s.phase.kind} on day ${s.day}`);
    s = next;
  }
  if (s.phase.kind !== "over") throw new Error(`Run did not finish (seed ${s.seed}, day ${s.day})`);
  return {
    win: s.phase.result === "win",
    days: s.day,
    cause: s.phase.kind === "over" ? s.phase.cause : undefined,
    survivors: living(s).length,
    eventsSeen: s.stats.eventsSeen,
    uniqueEvents: s.seenEvents.length,
    starvingDays: s.stats.foodShortDays
  };
}
