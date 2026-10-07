// Core types for the pure game engine. Nothing in src/engine imports React or
// touches Math.random, Date, or the DOM.

export type Difficulty = "easy" | "normal" | "hard";
export type Skill =
  | "hacking" | "persuasion" | "survival" | "mechanical"
  | "medical" | "negotiation" | "intimidation" | "stealth";
export type Region = "northwest" | "mountain" | "plains" | "midwest" | "south" | "east";
export type StopKind = "paradise" | "hostile" | "waypoint" | "goal";

// ---------------------------------------------------------------- content

/** Numeric effects. "each" fields apply to every living party member. */
export interface Effects {
  food?: number;
  money?: number;
  miles?: number;        // negative = lose ground within the current leg
  delay?: number;        // days lost in place (food is still eaten)
  health?: number;       // each living member
  healthOne?: number;    // one random living member
  morale?: number;       // each living member
}

export interface Outcome {
  weight?: number;
  text: string;
  effects?: Effects;
  setFlags?: string[];
  clearFlags?: string[];
  /** Event id that fires on the next travel day (quest chains). */
  next?: string;
}

export type CheckDifficulty = "easy" | "medium" | "hard";

export interface Choice {
  label: string;
  /** Only offered if a living member has this skill. */
  requires?: { skill: Skill };
  /** Costs paid up front; the choice is disabled if you can't afford it. */
  cost?: { money?: number; food?: number };
  /** If present, roll against the check and use success/failure outcomes. */
  check?: { skill: Skill; difficulty: CheckDifficulty };
  outcomes?: Outcome[];
  success?: Outcome[];
  failure?: Outcome[];
}

export interface EventConditions {
  minDay?: number;
  maxDay?: number;
  flags?: string[];
  notFlags?: string[];
  /** Any living member has at least one of these skills. */
  anySkill?: Skill[];
  /** Party food at or below this. */
  maxFood?: number;
  /** Lowest living member health at or below this. */
  maxLowestHealth?: number;
}

export interface GameEvent {
  id: string;
  title: string;
  /** Where it can fire: on the road, on arrival at a paradise, or only via `next`. */
  where: "road" | "paradise" | "chain";
  regions?: Region[];
  tags: string[];
  weight?: number;
  conditions?: EventConditions;
  text: string;
  choices: Choice[];
}

export interface Stop {
  id: string;
  name: string;
  /** Plain place name for maps and tight spaces. */
  short: string;
  kind: StopKind;
  region: Region;
  lat: number;
  lon: number;
}

export interface Character {
  id: string;
  name: string;
  profession: string;
  skill: Skill;
  blurb: string;
  kit: { money?: number; food?: number; morale?: number };
}

// ---------------------------------------------------------------- state

export interface Member {
  id: string;           // character id
  name: string;
  profession: string;
  skill: Skill;
  health: number;       // 0-100
  morale: number;       // 0-100
  alive: boolean;
  causeOfDeath?: string;
  diedOnDay?: number;
}

export interface Leg {
  from: number;  // stop index
  to: number;
  miles: number;
}

export interface JournalEntry {
  day: number;
  title: string;
  text: string;
  deltas?: Delta[];
}

export interface Delta {
  label: string;
  value: number;
  unit?: "$" | "mi" | "%" | "days";
}

export interface PendingEvent {
  eventId: string;
  /** Rendered text (tokens filled in). */
  title: string;
  text: string;
  /** Member referred to as {member}; also the target of `healthOne`. */
  memberId: string;
  stopName: string;
}

export interface OutcomeView {
  title: string;
  text: string;
  deltas: Delta[];
  success?: boolean;
  deaths: string[];
}

export type AfterEvent = "road" | "town";

export type Phase =
  | { kind: "road" }
  | { kind: "event"; event: PendingEvent; then: AfterEvent }
  | { kind: "outcome"; outcome: OutcomeView; then: AfterEvent }
  | { kind: "town" }
  | { kind: "over"; result: "win" | "dead"; cause?: string };

/** What happened on the most recent travel day, for the UI's day summary. */
export interface DaySummary {
  day: number;
  miles: number;
  foodEaten: number;
  starving: boolean;
  passed: string[];
  arrived: string | null;
  deaths: string[];
}

export interface GameState {
  version: number;
  seed: string;
  rng: number;
  difficulty: Difficulty;
  day: number;
  stops: Stop[];
  legs: Leg[];
  /** Index of the stop you're at or last passed. */
  stopIndex: number;
  milesIntoLeg: number;
  totalMiles: number;
  food: number;
  money: number;
  party: Member[];
  upgrades: string[];
  flags: string[];
  seenEvents: string[];
  queuedEvent: string | null;
  journal: JournalEntry[];
  lastDay: DaySummary | null;
  phase: Phase;
  stats: { eventsSeen: number; checksPassed: number; checksFailed: number; foodShortDays: number };
}

// ---------------------------------------------------------------- actions

export type Action =
  | { type: "travel" }
  | { type: "choose"; choice: number }
  | { type: "continue" }
  | { type: "buy"; item: string }
  | { type: "buyUpgrade"; upgrade: string }
  | { type: "rest" }
  | { type: "leaveTown" };
