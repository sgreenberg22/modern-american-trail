// Read-only queries over GameState, shared by the reducer, the UI and the sim.
import { CHECK_BASE, CHECK_MAX, CHECK_MIN, DIFFICULTY, RULES, SKILLED_BONUS } from "./config";
import { EVENTS } from "./data/events";
import { PRICE_SPREAD, SHOP_ITEMS } from "./data/items";
import { stableFloat } from "./rng";
import type { Choice, GameEvent, GameState, Member, Skill, Stop } from "./types";

export const EVENTS_BY_ID: ReadonlyMap<string, GameEvent> = new Map(EVENTS.map(e => [e.id, e]));

export const living = (s: GameState): Member[] => s.party.filter(m => m.alive);
export const leader = (s: GameState): Member | undefined => living(s)[0];
export const currentStop = (s: GameState): Stop => s.stops[s.stopIndex];
export const nextStop = (s: GameState): Stop | undefined => s.stops[s.stopIndex + 1];

export function milesToNext(s: GameState): number {
  const leg = s.legs[s.stopIndex];
  return leg ? leg.miles - s.milesIntoLeg : 0;
}

export function totalRouteMiles(s: GameState): number {
  return s.legs.reduce((a, l) => a + l.miles, 0);
}

export function hasLivingSkill(s: GameState, skill: Skill): boolean {
  return living(s).some(m => m.skill === skill);
}

/** Living member best placed to use a skill (healthiest holder), if any. */
export function skilledMember(s: GameState, skill: Skill | undefined): Member | undefined {
  if (!skill) return undefined;
  return living(s)
    .filter(m => m.skill === skill)
    .sort((a, b) => b.health - a.health)[0];
}

export function averageHealth(s: GameState): number {
  const l = living(s);
  return l.length ? l.reduce((a, m) => a + m.health, 0) / l.length : 0;
}

export function expectedMilesPerDay(s: GameState): number {
  const cfg = DIFFICULTY[s.difficulty];
  let m = cfg.milesPerDay + (s.upgrades.includes("vehicle") ? RULES.vehicleMiles : 0);
  if (averageHealth(s) < RULES.lowHealthAvg) m *= RULES.lowHealthSpeed;
  return Math.round(m);
}

export function foodPerDay(s: GameState): number {
  const cfg = DIFFICULTY[s.difficulty];
  const mult = s.upgrades.includes("pantry") ? RULES.pantryFood : 1;
  return living(s).length * cfg.foodPerPerson * mult;
}

export function daysOfFood(s: GameState): number {
  const per = foodPerDay(s);
  return per > 0 ? Math.floor(s.food / per) : Infinity;
}

/** Stable per-stop price: same number shown and charged, for the whole run. */
export function shopPrice(s: GameState, itemId: string): number {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return Infinity;
  const f = stableFloat(s.seed, currentStop(s).id, itemId);
  return Math.round(item.basePrice * (PRICE_SPREAD.min + f * (PRICE_SPREAD.max - PRICE_SPREAD.min)));
}

/** Success chance (0-100) for a skill check, as shown to the player. */
export function checkOdds(s: GameState, check: NonNullable<Choice["check"]>): number {
  const cfg = DIFFICULTY[s.difficulty];
  const p = CHECK_BASE[check.difficulty] + cfg.checkBonus + (hasLivingSkill(s, check.skill) ? SKILLED_BONUS : 0);
  return Math.max(CHECK_MIN, Math.min(CHECK_MAX, p));
}

export interface ChoiceView {
  index: number;
  label: string;
  /** Hidden when the party lacks a required skill. */
  visible: boolean;
  enabled: boolean;
  reason?: string;
  odds?: number;
  skill?: Skill;
  skilledName?: string;
  cost?: Choice["cost"];
}

export function choiceView(s: GameState, choice: Choice, index: number): ChoiceView {
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
  if (choice.check) view.odds = checkOdds(s, choice.check);
  if (choice.cost?.money && s.money < choice.cost.money) {
    view.enabled = false;
    view.reason = `Need $${choice.cost.money}`;
  } else if (choice.cost?.food && s.food < choice.cost.food) {
    view.enabled = false;
    view.reason = `Need ${choice.cost.food} food`;
  }
  return view;
}

/** Choices for the current pending event, or [] if none. */
export function currentChoices(s: GameState): ChoiceView[] {
  if (s.phase.kind !== "event") return [];
  const ev = EVENTS_BY_ID.get(s.phase.event.eventId);
  return ev ? ev.choices.map((c, i) => choiceView(s, c, i)) : [];
}
