// Read-only queries over GameState, shared by the reducer, the UI, the bots and the tests.
import {
  CHECK_BASE, CHECK_MAX, CHECK_MIN, CONDITION_CHECK_PENALTY, DIFFICULTY, HEAT, ITEM_WEIGHT, PACE,
  RATIONS, RULES, SKILLED_BONUS, VAN, WEATHER
} from "./config";
import { ENDINGS } from "./data/endings";
import { EVENTS } from "./data/events";
import {
  ALWAYS_STOCKED, LANDMARK_MARKUP, LANDMARK_STOCK, OPTIONAL_STOCK, OPTIONAL_STOCK_COUNT, PRICE_SPREAD, SHOP_ITEMS
} from "./data/items";
import { Rng, hashString, stableFloat } from "./rng";
import type { Choice, GameEvent, GameState, ItemId, Member, Season, Skill, Stop } from "./types";

export const EVENTS_BY_ID: ReadonlyMap<string, GameEvent> = new Map(EVENTS.map(e => [e.id, e]));

export const living = (s: GameState): Member[] => s.party.filter(m => m.alive);
export const leader = (s: GameState): Member | undefined => living(s)[0];
export const currentStop = (s: GameState): Stop => s.stops[s.stopIndex];
export const nextStop = (s: GameState): Stop | undefined => s.stops[s.stopIndex + 1];

export function milesToNext(s: GameState): number {
  const leg = s.legs[s.stopIndex];
  return leg ? leg.miles - s.milesIntoLeg : 0;
}

/** Miles from here to the next paradise or the goal. */
export function milesToNextTown(s: GameState): number {
  let miles = 0;
  for (let i = s.stopIndex; i < s.legs.length; i++) {
    miles += s.legs[i].miles - (i === s.stopIndex ? s.milesIntoLeg : 0);
    const k = s.stops[i + 1].kind;
    if (k === "paradise" || k === "goal") break;
  }
  return miles;
}

/** Miles to the next place that sells gas (paradise, landmark or goal). */
export function milesToNextGas(s: GameState): number {
  let miles = 0;
  for (let i = s.stopIndex; i < s.legs.length; i++) {
    miles += s.legs[i].miles - (i === s.stopIndex ? s.milesIntoLeg : 0);
    if (s.stops[i + 1].kind !== "waypoint") break;
  }
  return miles;
}

/** The next paradise or the goal. */
export function nextTown(s: GameState): Stop | undefined {
  return s.stops.slice(s.stopIndex + 1).find(st => st.kind === "paradise" || st.kind === "goal");
}

export function totalRouteMiles(s: GameState): number {
  return s.legs.reduce((a, l) => a + l.miles, 0);
}

// ------------------------------------------------------------------ calendar

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function calendar(s: GameState): { month: number; date: number; season: Season; label: string } {
  let month = s.startMonth - 1;
  let date = s.day;
  while (date > MONTH_DAYS[month]) { date -= MONTH_DAYS[month]; month = (month + 1) % 12; }
  const m = month + 1;
  const season: Season = m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "fall" : "winter";
  return { month: m, date, season, label: `${MONTH_NAMES[month].slice(0, 3)} ${date}` };
}

// ------------------------------------------------------------------ party & skills

export function hasLivingSkill(s: GameState, skill: Skill): boolean {
  return living(s).some(m => m.skill === skill);
}

/** Penalty a member brings to a skill check because of their conditions. */
export function conditionPenalty(m: Member): number {
  return m.conditions.reduce((a, c) => a + CONDITION_CHECK_PENALTY[c], 0);
}

/** Living member best placed to use a skill: holds it, with the smallest condition penalty. */
export function skilledMember(s: GameState, skill: Skill | undefined): Member | undefined {
  if (!skill) return undefined;
  return living(s)
    .filter(m => m.skill === skill)
    .sort((a, b) => conditionPenalty(a) - conditionPenalty(b) || b.health - a.health)[0];
}

export function averageHealth(s: GameState): number {
  const l = living(s);
  return l.length ? l.reduce((a, m) => a + m.health, 0) / l.length : 0;
}

export interface OddsBreakdown { total: number; parts: { label: string; value: number }[] }

/** Success chance (0-100) for a skill check, with the reasons, as shown to the player. */
export function checkBreakdown(s: GameState, check: NonNullable<Choice["check"]>, tags: string[] = []): OddsBreakdown {
  const parts: { label: string; value: number }[] = [{ label: `${check.difficulty[0].toUpperCase()}${check.difficulty.slice(1)} check`, value: CHECK_BASE[check.difficulty] }];
  const cfg = DIFFICULTY[s.difficulty];
  if (cfg.checkBonus) parts.push({ label: cfg.label, value: cfg.checkBonus });
  const who = skilledMember(s, check.skill);
  if (who) {
    parts.push({ label: `${who.name}'s skill`, value: SKILLED_BONUS });
    const pen = conditionPenalty(who);
    if (pen) parts.push({ label: `${who.name} is ${who.conditions.join(" and ")}`, value: -pen });
  }
  if (check.faction && s.rep[check.faction]) {
    parts.push({ label: `${factionLabel(check.faction)} reputation`, value: Math.round(s.rep[check.faction] / RULES.repCheckDivisor) });
  }
  if (s.heat >= HEAT.wanted && tags.includes("checkpoint")) parts.push({ label: "Wanted", value: -HEAT.wantedCheckPenalty });
  const raw = parts.reduce((a, p) => a + p.value, 0);
  return { total: Math.max(CHECK_MIN, Math.min(CHECK_MAX, raw)), parts };
}

export function checkOdds(s: GameState, check: NonNullable<Choice["check"]>, tags: string[] = []): number {
  return checkBreakdown(s, check, tags).total;
}

export const factionLabel = (f: keyof GameState["rep"]) => ({ resistance: "Resistance", faithful: "Faithful", militia: "Militia" })[f];

// ------------------------------------------------------------------ travel estimates

export function expectedMilesPerDay(s: GameState): number {
  const cfg = DIFFICULTY[s.difficulty];
  let m = cfg.milesPerDay * PACE[s.pace].miles;
  if (s.upgrades.includes("vehicle")) m += RULES.vehicleMiles;
  if (averageHealth(s) < RULES.lowHealthAvg) m *= RULES.lowHealthSpeed;
  if (s.van <= 0) m *= VAN.wreckedSpeed;
  return Math.round(m);
}

export function foodPerDay(s: GameState): number {
  const cfg = DIFFICULTY[s.difficulty];
  const mult = s.upgrades.includes("pantry") ? RULES.pantryFood : 1;
  return living(s).length * cfg.foodPerPerson * RATIONS[s.rations].food * mult;
}

export function daysOfFood(s: GameState): number {
  const per = foodPerDay(s);
  return per > 0 ? Math.floor(s.food / per) : Infinity;
}

export function fuelPerDay(s: GameState): number {
  return (expectedMilesPerDay(s) / VAN.mpg) * PACE[s.pace].fuel * WEATHER[s.weather].fuel;
}

export function rangeMiles(s: GameState): number {
  return Math.floor((s.fuel / (PACE[s.pace].fuel)) * VAN.mpg);
}

export function fuelCapacity(s: GameState): number {
  return VAN.tank + (s.upgrades.includes("rack") ? RULES.rackFuel : 0);
}

export function cargoCapacity(s: GameState): number {
  return RULES.cargoCapacity + (s.upgrades.includes("rack") ? RULES.rackCapacity : 0);
}

export function cargoWeight(s: GameState): number {
  return Math.round(s.food + (Object.keys(s.items) as ItemId[]).reduce((a, k) => a + s.items[k] * ITEM_WEIGHT[k], 0));
}

// ------------------------------------------------------------------ shops

/** What's for sale where you are: full market in a paradise, a gas station at a landmark. */
export function shopStock(s: GameState): string[] {
  const stop = currentStop(s);
  if (stop.kind === "hostile") return LANDMARK_STOCK;
  if (stop.kind !== "paradise") return [];
  const rng = new Rng(hashString(`${s.seed}|stock|${stop.id}`));
  const optional = rng.shuffle(OPTIONAL_STOCK).slice(0, OPTIONAL_STOCK_COUNT);
  return [...ALWAYS_STOCKED, ...OPTIONAL_STOCK.filter(id => optional.includes(id))];
}

/** Stable per-stop price: same number shown and charged, for the whole run. */
export function shopPrice(s: GameState, itemId: string): number {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return Infinity;
  const stop = currentStop(s);
  const f = stableFloat(s.seed, stop.id, itemId);
  let p = item.basePrice * (PRICE_SPREAD.min + f * (PRICE_SPREAD.max - PRICE_SPREAD.min));
  if (stop.kind === "hostile") p *= LANDMARK_MARKUP;
  else p *= 1 - RULES.resistanceDiscount * Math.max(0, s.rep.resistance) / 100;
  return Math.max(1, Math.round(p));
}

/** Why a purchase isn't possible right now, or null if it is. */
export function cantBuy(s: GameState, itemId: string): string | null {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item || !shopStock(s).includes(itemId)) return "Not sold here";
  if (s.money < shopPrice(s, itemId)) return "Not enough cash";
  if (item.fuel && s.fuel + item.fuel > fuelCapacity(s) + 0.01) return "Tank is full";
  const weight = (item.food ?? 0) + (item.item ? ITEM_WEIGHT[item.item] : 0);
  if (weight && cargoWeight(s) + weight > cargoCapacity(s)) return "Van is full";
  return null;
}

export function garageCost(s: GameState): number {
  return Math.ceil((100 - s.van) * VAN.garagePerPoint);
}

// ------------------------------------------------------------------ choices

export interface ChoiceView {
  index: number;
  label: string;
  /** Hidden when the party lacks a required skill. */
  visible: boolean;
  enabled: boolean;
  reason?: string;
  odds?: number;
  oddsParts?: { label: string; value: number }[];
  skill?: Skill;
  skilledName?: string;
  cost?: Choice["cost"];
}

export function choiceView(s: GameState, choice: Choice, index: number, tags: string[] = []): ChoiceView {
  const skill = choice.check?.skill ?? choice.requires?.skill;
  const view: ChoiceView = {
    index,
    label: choice.label,
    visible: !choice.requires || hasLivingSkill(s, choice.requires.skill),
    enabled: true,
    skill,
    skilledName: skilledMember(s, skill)?.name,
    cost: choice.cost
  };
  if (choice.check) {
    const b = checkBreakdown(s, choice.check, tags);
    view.odds = b.total;
    view.oddsParts = b.parts;
  }
  if (choice.cost?.money && s.money < choice.cost.money) {
    view.enabled = false;
    view.reason = `Need $${choice.cost.money}`;
  } else if (choice.cost?.food && s.food < choice.cost.food) {
    view.enabled = false;
    view.reason = `Need ${choice.cost.food} food`;
  } else if (choice.cost?.fuel && s.fuel < choice.cost.fuel) {
    view.enabled = false;
    view.reason = `Need ${choice.cost.fuel} gal`;
  } else {
    for (const [k, v] of Object.entries(choice.cost?.items ?? {}) as [ItemId, number][]) {
      if (s.items[k] < v) { view.enabled = false; view.reason = `Need ${k === "parts" ? "spare parts" : k}`; }
    }
  }
  return view;
}

/** Choices for the current pending event, or [] if none. */
export function currentChoices(s: GameState): ChoiceView[] {
  if (s.phase.kind !== "event") return [];
  const ev = EVENTS_BY_ID.get(s.phase.event.eventId);
  return ev ? ev.choices.map((c, i) => choiceView(s, c, i, ev.tags)) : [];
}

// ------------------------------------------------------------------ endings & score

export function endingOf(s: GameState) {
  return s.phase.kind === "over" ? ENDINGS[s.phase.ending] : null;
}

export interface ScoreBreakdown { total: number; parts: { label: string; value: number }[] }

export function score(s: GameState): ScoreBreakdown {
  const ending = endingOf(s);
  const parts: { label: string; value: number }[] = [];
  if (!ending) return { total: 0, parts };
  if (ending.kind === "loss") {
    parts.push({ label: "Miles driven", value: Math.round(s.totalMiles / 4) });
  } else {
    parts.push({ label: ending.title, value: ending.score });
    parts.push({ label: "Survivors' health", value: living(s).reduce((a, m) => a + m.health, 0) * 5 });
    parts.push({ label: "Cash left", value: s.money });
    if (ending.kind === "win") parts.push({ label: "Speed bonus", value: Math.max(0, 60 - s.day) * 40 });
  }
  const sub = parts.reduce((a, p) => a + p.value, 0);
  const mult = DIFFICULTY[s.difficulty].scoreMult;
  if (mult !== 1) parts.push({ label: `${DIFFICULTY[s.difficulty].label} ×${mult}`, value: Math.round(sub * (mult - 1)) });
  return { total: Math.round(sub * mult), parts };
}
