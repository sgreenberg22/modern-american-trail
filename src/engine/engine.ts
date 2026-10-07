// The reducer. applyAction(state, action) is pure: it copies the input, applies
// the action to the copy, and returns it. Invalid actions return the input unchanged.
import { DIFFICULTY } from "./config";
import { CHARACTERS, KITS, PARTY_SIZE } from "./data/characters";
import { buildRoute } from "./data/route";
import { travel } from "./day";
import { choose } from "./encounter";
import { hashString, Rng } from "./rng";
import { fuelCapacity } from "./selectors";
import { buy, buyUpgrade, landmarkAction, repair, rest, settle, useItem } from "./town";
import type { Action, Difficulty, GameState, ItemId, Member } from "./types";
import { clamp, cloneForStep, log } from "./util";

export const STATE_VERSION = 4;

// ------------------------------------------------------------------ new game

export interface NewGameOptions {
  seed: string;
  difficulty?: Difficulty;
  /** Character ids; defaults to a seeded random party of starting characters. */
  party?: string[];
  kit?: string;
  /** Departure month 1-12; defaults to a seeded month between April and September. */
  startMonth?: number;
  daily?: string | null;
}

export function newGame({ seed, difficulty = "normal", party, kit = "cooler", startMonth, daily = null }: NewGameOptions): GameState {
  const rng = new Rng(hashString(seed));
  const cfg = DIFFICULTY[difficulty];
  const { stops, legs } = buildRoute(rng);

  const chosen = party?.length
    ? party.map(id => CHARACTERS.find(c => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c).slice(0, PARTY_SIZE)
    : rng.shuffle(CHARACTERS.filter(c => !c.unlock)).slice(0, PARTY_SIZE);
  const month = startMonth ?? rng.int(4, 9);
  const startKit = KITS.find(k => k.id === kit) ?? KITS[0];

  const items: Record<ItemId, number> = { medkit: 0, antibiotics: 0, parts: 0, books: 0 };
  const rep = { resistance: 0, faithful: 0, militia: 0 };
  let money = cfg.startMoney + (startKit.money ?? 0);
  let food = cfg.startFood + (startKit.food ?? 0);
  let fuel = cfg.startFuel + (startKit.fuel ?? 0);
  let morale = 75;
  for (const c of chosen) {
    money += c.kit.money ?? 0;
    food += c.kit.food ?? 0;
    fuel += c.kit.fuel ?? 0;
    morale += c.kit.morale ?? 0;
    for (const [k, v] of Object.entries(c.kit.items ?? {}) as [ItemId, number][]) items[k] += v;
    for (const [f, v] of Object.entries(c.kit.rep ?? {}) as [keyof typeof rep, number][]) rep[f] += v;
  }
  for (const [k, v] of Object.entries(startKit.items ?? {}) as [ItemId, number][]) items[k] += v;

  const members: Member[] = chosen.map(c => ({
    id: c.id, name: c.name, profession: c.profession, skill: c.skill,
    health: 100, morale: clamp(morale, 0, 100), alive: true, conditions: []
  }));

  const s: GameState = {
    version: STATE_VERSION,
    seed,
    rng: rng.state,
    difficulty,
    daily,
    day: 1,
    startMonth: month,
    weather: "clear",
    stops,
    legs,
    stopIndex: 0,
    milesIntoLeg: 0,
    totalMiles: 0,
    pace: "steady",
    rations: "filling",
    food,
    money,
    fuel: 0,
    van: 100,
    items,
    heat: 0,
    rep,
    party: members,
    upgrades: [...(startKit.upgrades ?? [])],
    flags: [],
    seenEvents: [],
    queuedEvent: null,
    landmarkUsed: [],
    journal: [],
    lastDay: null,
    // Start in town so the first decision is how to provision.
    phase: { kind: "town" },
    stats: { eventsSeen: 0, checksPassed: 0, checksFailed: 0, foodShortDays: 0, dryDays: 0, maxHeat: 0, arrests: 0 }
  };
  s.fuel = Math.min(fuel, fuelCapacity(s));
  log(s, {
    title: "The Escape Begins",
    text: `${members.map(m => `${m.name} the ${m.profession}`).join(", ")} load the van in ${stops[0].name}. Vermont is ${legs.reduce((a, l) => a + l.miles, 0).toLocaleString("en-US")} miles east.`
  });
  return s;
}

// ------------------------------------------------------------------ reducer

export function applyAction(state: GameState, action: Action): GameState {
  if (state.phase.kind === "over") return state;
  const s = cloneForStep(state);
  const rng = new Rng(s.rng);
  const ok = step(s, action, rng);
  if (!ok) return state;
  s.rng = rng.state;
  return s;
}

function step(s: GameState, a: Action, rng: Rng): boolean {
  const phase = s.phase.kind;
  const atStop = phase === "town" || phase === "landmark";
  const canManage = phase === "road" || atStop;
  switch (a.type) {
    case "travel": return phase === "road" && travel(s, rng);
    case "choose": return phase === "event" && choose(s, a.choice, rng);
    case "continue":
      if (s.phase.kind !== "outcome") return false;
      s.phase = { kind: s.phase.then };
      return true;
    case "setPace":
      if (!canManage || s.pace === a.pace) return false;
      s.pace = a.pace;
      return true;
    case "setRations":
      if (!canManage || s.rations === a.rations) return false;
      s.rations = a.rations;
      return true;
    case "useItem": return canManage && useItem(s, a.item, a.member);
    case "buy": return atStop && buy(s, a.item);
    case "buyUpgrade": return phase === "town" && buyUpgrade(s, a.upgrade);
    case "repair": return phase === "town" && repair(s);
    case "rest": return phase === "town" && rest(s, rng);
    case "settle": return phase === "town" && settle(s);
    case "landmark": return phase === "landmark" && landmarkAction(s, a.action, rng);
    case "leaveTown":
      if (!atStop) return false;
      s.phase = { kind: "road" };
      return true;
  }
}

