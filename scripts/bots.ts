// Player bots for the simulation harness. Bots see only what a player sees:
// public state, choice labels, costs and displayed odds; they never peek at RNG.
import {
  applyAction, cantBuy, checkOdds, itemCount, currentChoices, currentStop, DIFFICULTY, EVENTS_BY_ID, expectedMilesPerDay,
  foodPerDay, garageCost, LANDMARKS, living, milesToNextGas, milesToNextTown, PACE, RATIONS, RULES,
  shopPrice, UPGRADES, VAN, type Action, type Effects, type GameState, type Outcome, type Rations
} from "../src/engine";
import { Rng } from "../src/engine/rng";

export type BotName = "smart" | "casual" | "random";
export type Bot = (s: GameState, rng: Rng) => Action;

const daysToTown = (s: GameState) => milesToNextTown(s) / Math.max(1, expectedMilesPerDay(s));
const gasToReach = (s: GameState, miles: number) => (miles / VAN.mpg) * PACE[s.pace].fuel * 1.15;

function rationsThatLast(s: GameState, days: number): Rations {
  const base = living(s).length * DIFFICULTY[s.difficulty].foodPerPerson * (s.upgrades.includes("pantry") ? RULES.pantryFood : 1);
  for (const r of ["filling", "meager", "bare"] as Rations[]) if (s.food >= base * RATIONS[r].food * days) return r;
  return "bare";
}

/** Item use and pace/ration management that happens between drives. */
function manage(s: GameState): Action | null {
  const alive = living(s);
  const hurt = [...alive].sort((a, b) => a.health - b.health)[0];
  const injured = alive.find(m => m.conditions.includes("injured"));
  const sick = alive.find(m => m.conditions.includes("sick"));
  if (itemCount(s, "medkit") > 0 && (injured || hurt.health < 45)) return { type: "useItem", item: "medkit", member: (injured ?? hurt).id };
  if (itemCount(s, "antibiotics") > 0 && sick) return { type: "useItem", item: "antibiotics", member: sick.id };
  if (itemCount(s, "parts") > 0 && s.van < 45) return { type: "useItem", item: "parts" };
  if (itemCount(s, "books") > 0 && alive.reduce((a, m) => a + m.morale, 0) / alive.length < 35) return { type: "useItem", item: "books" };

  const rations = rationsThatLast(s, daysToTown(s) * 1.1);
  if (rations !== s.rations) return { type: "setRations", rations };
  const healthy = alive.every(m => m.health > 65 && !m.conditions.includes("exhausted"));
  // Judge against hurried fuel use whatever the current pace, or the decision flip-flops.
  const hurriedGas = (milesToNextGas(s) / VAN.mpg) * PACE.hurried.fuel * 1.15;
  const pace = healthy && s.van > 50 && s.fuel > hurriedGas * 1.3 ? "hurried" : "steady";
  if (pace !== s.pace) return { type: "setPace", pace };
  return null;
}

function utility(s: GameState, o: Outcome): number {
  if (o.ending === "detained") return -100000;
  const e: Effects = o.effects ?? {};
  const n = living(s).length;
  const lowest = Math.min(...living(s).map(m => m.health));
  const hw = lowest < 40 ? 2 : 1; // health matters more when someone is close to dying
  return (e.health ?? 0) * n * hw + (e.healthOne ?? 0) * hw +
    (e.morale ?? 0) * n * 0.3 + (e.food ?? 0) * 1.2 + (e.money ?? 0) * 0.08 + (e.miles ?? 0) * 0.08 +
    (e.fuel ?? 0) * 3 + (e.van ?? 0) * 0.6 - (e.heat ?? 0) * (0.4 + s.heat / 60) +
    Object.values(e.rep ?? {}).reduce((a, v) => a + (v ?? 0) * 0.1, 0) +
    (e.items?.medkit ?? 0) * 15 + (e.items?.parts ?? 0) * 20 + (e.items?.antibiotics ?? 0) * 10 +
    (e.condition ? -20 : 0) + (e.cure ? 15 : 0) -
    (e.delay ?? 0) * (foodPerDay(s) * 1.2 + 3 * n);
}

function expected(s: GameState, outcomes: Outcome[] | undefined): number {
  if (!outcomes?.length) return 0;
  const total = outcomes.reduce((a, o) => a + (o.weight ?? 1), 0);
  return outcomes.reduce((a, o) => a + ((o.weight ?? 1) / total) * utility(s, o), 0);
}

function bestChoice(s: GameState): Action {
  const ev = EVENTS_BY_ID.get((s.phase as { event: { eventId: string } }).event.eventId)!;
  const views = currentChoices(s).filter(v => v.visible && v.enabled);
  let best = views[0], bestScore = -Infinity;
  for (const v of views) {
    const c = ev.choices[v.index];
    const cost = (c.cost?.money ?? 0) * 0.08 + (c.cost?.food ?? 0) * 1.2 + (c.cost?.fuel ?? 0) * 3 + (c.cost?.items?.parts ?? 0) * 20;
    const score = c.check
      ? (v.odds! / 100) * expected(s, c.success) + (1 - v.odds! / 100) * expected(s, c.failure) - cost
      : expected(s, c.outcomes) - cost;
    if (score > bestScore) { best = v; bestScore = score; }
  }
  return { type: "choose", choice: best.index };
}

/** Food and gas needed to reach the next resupply, with margin. */
function needs(s: GameState) {
  const days = daysToTown(s);
  return {
    food: (days * 1.3 + 2) * living(s).length * DIFFICULTY[s.difficulty].foodPerPerson * (s.upgrades.includes("pantry") ? RULES.pantryFood : 1),
    gas: gasToReach(s, milesToNextGas(s)) * 1.25 + 2
  };
}

/** Rough cost of food and gas for the rest of the trip, at typical prices. */
function tripCost(s: GameState): number {
  const remaining = s.legs.reduce((a, l) => a + l.miles, 0) - s.totalMiles;
  const days = remaining / Math.max(1, expectedMilesPerDay(s));
  const foodDay = living(s).length * DIFFICULTY[s.difficulty].foodPerPerson * (s.upgrades.includes("pantry") ? RULES.pantryFood : 1);
  return days * foodDay * (45 / 20) + (remaining / VAN.mpg) * (17 / 5);
}

function tryBuy(s: GameState, item: string): Action | null {
  return cantBuy(s, item) ? null : { type: "buy", item };
}

export const smartBot: Bot = (s) => {
  if (s.phase.kind === "outcome") return { type: "continue" };
  if (s.phase.kind === "event") return bestChoice(s);
  const m = manage(s);
  if (m) return m;
  if (s.phase.kind === "road") return { type: "travel" };

  const need = needs(s);
  const reserve = 2 * shopPrice(s, "rations") + 2 * shopPrice(s, "gas");

  if (s.phase.kind === "town") {
    if (s.fuel < need.gas) { const a = tryBuy(s, "gas"); if (a) return a; }
    if (s.food < need.food) { const a = tryBuy(s, "rations"); if (a) return a; }
    if (s.van < 70 && s.money >= garageCost(s) + reserve) return { type: "repair" };
    const alive = living(s);
    const lowest = Math.min(...alive.map(p => p.health));
    const nextLegCost = need.food * (45 / 20) + need.gas * (17 / 5);
    if (itemCount(s, "medkit") < 1 && s.money >= shopPrice(s, "medkit") + nextLegCost * 1.5) { const a = tryBuy(s, "medkit"); if (a) return a; }
    if (alive.some(p => p.conditions.includes("sick")) && itemCount(s, "antibiotics") < 1) { const a = tryBuy(s, "antibiotics"); if (a) return a; }
    for (const id of ["pantry", "vehicle", "rack", "comms"]) {
      const up = UPGRADES.find(u => u.id === id)!;
      if (!s.upgrades.includes(id) && s.money >= up.price + tripCost(s) * 0.6) return { type: "buyUpgrade", upgrade: id };
    }
    if ((lowest < 50 || alive.some(p => p.conditions.includes("exhausted")) || s.heat > 50) && s.money >= RULES.restCost + reserve && s.food > need.food) return { type: "rest" };
    // Top up gas while here; it's cheaper than at landmarks.
    if (s.fuel < need.gas * 1.6) { const a = tryBuy(s, "gas"); if (a) return a; }
    return { type: "leaveTown" };
  }

  if (s.phase.kind === "landmark") {
    if (s.fuel < need.gas) { const a = tryBuy(s, "gas"); if (a) return a; }
    if (s.food < need.food * 0.6) { const a = tryBuy(s, "rations"); if (a) return a; }
    const lm = LANDMARKS[currentStop(s).id];
    const used = s.landmarkUsed;
    if (used.length < RULES.landmarkActions) {
      const broke = s.money < (need.gas - s.fuel) * shopPrice(s, "gas") / 5 + need.food * 0.3 * (45 / 20);
      if (broke && !used.includes("work")) return { type: "landmark", action: "work" };
      if (s.heat >= 45 && !used.includes("layLow")) return { type: "landmark", action: "layLow" };
      if (s.food < need.food && !used.includes("scavenge") && checkOdds(s, { skill: "survival", difficulty: "medium" }) >= 50) return { type: "landmark", action: "scavenge" };
      const talkOdds = Math.max(checkOdds(s, { skill: "persuasion", difficulty: "medium", faction: lm.faction }), checkOdds(s, { skill: "negotiation", difficulty: "medium", faction: lm.faction }));
      if (s.heat >= 20 && talkOdds >= 60 && !used.includes("talk")) return { type: "landmark", action: "talk" };
      if (living(s).some(p => p.conditions.includes("exhausted")) && s.money >= RULES.motelCost + reserve && s.heat < 50 && !used.includes("motel")) return { type: "landmark", action: "motel" };
    }
    return { type: "leaveTown" };
  }
  return { type: "continue" };
};

/** A careless player: random choices and settings, buys a little food and gas, never rests. */
export const randomBot: Bot = (s, rng) => {
  if (s.phase.kind === "outcome") return { type: "continue" };
  if (s.phase.kind === "road") return { type: "travel" };
  if (s.phase.kind === "event") {
    const views = currentChoices(s).filter(v => v.visible && v.enabled);
    return { type: "choose", choice: rng.pick(views).index };
  }
  if (s.phase.kind === "town" || s.phase.kind === "landmark") {
    if (s.day === 1 && s.pace === "steady" && rng.chance(0.5)) return { type: "setPace", pace: rng.pick(["hurried", "grueling"] as const) };
    if (rng.chance(0.6)) { const a = tryBuy(s, rng.pick(["rations", "gas"])); if (a) return a; }
  }
  return { type: "leaveTown" };
};

/**
 * A first-time player: usually picks the sensible option, keeps food and gas
 * stocked, uses a medkit when someone's in trouble, but never tweaks pace or
 * rations, never repairs until the van is nearly dead, and skips landmark actions.
 */
export const casualBot: Bot = (s, rng) => {
  if (s.phase.kind === "outcome") return { type: "continue" };
  if (s.phase.kind === "event") return rng.chance(0.3) ? randomBot(s, rng) : bestChoice(s);
  const hurt = [...living(s)].sort((a, b) => a.health - b.health)[0];
  if (itemCount(s, "medkit") > 0 && hurt.health < 30) return { type: "useItem", item: "medkit", member: hurt.id };
  if (itemCount(s, "parts") > 0 && s.van < 25) return { type: "useItem", item: "parts" };
  if (s.phase.kind === "road") return { type: "travel" };
  const need = needs(s);
  if (s.fuel < need.gas * 0.9) { const a = tryBuy(s, "gas"); if (a) return a; }
  if (s.phase.kind === "town" && s.food < need.food * 0.9) { const a = tryBuy(s, "rations"); if (a) return a; }
  if (s.phase.kind === "town" && s.van < 25 && s.money >= garageCost(s)) return { type: "repair" };
  return { type: "leaveTown" };
};

export const BOTS: Record<BotName, Bot> = { smart: smartBot, casual: casualBot, random: randomBot };

export interface RunResult {
  win: boolean; ending: string; days: number; cause?: string; survivors: number; eventsSeen: number;
  uniqueEvents: number; starvingDays: number; dryDays: number; arrests: number;
}

export function playRun(start: GameState, bot: Bot, botSeed: number, maxActions = 8000): RunResult {
  let s = start;
  const rng = new Rng(botSeed);
  for (let i = 0; i < maxActions && s.phase.kind !== "over"; i++) {
    const action = bot(s, rng);
    const next = applyAction(s, action);
    if (next === s) throw new Error(`Bot made an invalid move (${JSON.stringify(action)}) in phase ${s.phase.kind} on day ${s.day}, seed ${s.seed}`);
    s = next;
  }
  if (s.phase.kind !== "over") throw new Error(`Run did not finish (seed ${s.seed}, day ${s.day})`);
  const ending = s.phase.ending;
  return {
    win: ending === "full-house" || ending === "vermont" || ending === "lone-survivor",
    ending,
    days: s.day,
    cause: s.phase.cause,
    survivors: living(s).length,
    eventsSeen: s.stats.eventsSeen,
    uniqueEvents: s.seenEvents.length,
    starvingDays: s.stats.foodShortDays,
    dryDays: s.stats.dryDays,
    arrests: s.stats.arrests
  };
}
