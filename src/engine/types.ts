// Core types for the pure game engine. Nothing in src/engine imports React or
// touches Math.random, Date, or the DOM.

export type Difficulty = "easy" | "normal" | "hard";
export type Skill =
  | "hacking" | "persuasion" | "survival" | "mechanical"
  | "medical" | "negotiation" | "intimidation" | "stealth";
export type Region = "northwest" | "mountain" | "plains" | "midwest" | "south" | "east";
export type StopKind = "paradise" | "hostile" | "waypoint" | "goal";
export type Pace = "steady" | "hurried" | "grueling";
export type Rations = "filling" | "meager" | "bare";
export type Weather = "clear" | "rain" | "storm" | "heat" | "snow" | "fog";
export type Season = "spring" | "summer" | "fall" | "winter";
export type Condition = "injured" | "sick" | "exhausted";
export type Faction = "resistance" | "faithful" | "militia";
/** Inventory item id; see data/items.ts. */
export type ItemId = string;
export type EndingId =
  | "full-house" | "vermont" | "lone-survivor" | "settled"
  | "detained" | "starved" | "worn-down" | "lost";

// ---------------------------------------------------------------- content

/** Numeric effects. "each" fields apply to every living party member. */
export interface Effects {
  food?: number;
  money?: number;
  fuel?: number;
  /** Van condition. */
  van?: number;
  miles?: number;        // negative = lose ground within the current leg
  delay?: number;        // days lost in place (food is still eaten)
  health?: number;       // each living member
  healthOne?: number;    // the event's {member}
  morale?: number;       // each living member
  heat?: number;
  rep?: Partial<Record<Faction, number>>;
  items?: Partial<Record<ItemId, number>>;
  /** Gives the event's {member} a condition. */
  condition?: Condition;
  /** Clears a condition from everyone. */
  cure?: Condition;
}

export interface Outcome {
  weight?: number;
  text: string;
  effects?: Effects;
  setFlags?: string[];
  clearFlags?: string[];
  /** Event id that fires on the next travel day (quest chains). */
  next?: string;
  /** Ends the run with an authored ending. Only endings in CONTENT_ENDINGS are allowed. */
  ending?: EndingId;
}

export type CheckDifficulty = "easy" | "medium" | "hard";

export interface Choice {
  label: string;
  /** Only offered if a living member has this skill and/or you carry this item. */
  requires?: { skill?: Skill; item?: ItemId };
  /** Costs paid up front; the choice is disabled if you can't afford it. */
  cost?: { money?: number; food?: number; fuel?: number; items?: Partial<Record<ItemId, number>> };
  /** If present, roll against the check and use success/failure outcomes. */
  check?: { skill: Skill; difficulty: CheckDifficulty; faction?: Faction };
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
  minHeat?: number;
  maxHeat?: number;
  minRep?: Partial<Record<Faction, number>>;
  maxRep?: Partial<Record<Faction, number>>;
  weather?: Weather[];
  seasons?: Season[];
  maxVan?: number;
  maxFuel?: number;
  /** Only at these stops (stop ids), e.g. a scene specific to Chicago. */
  stops?: string[];
  /** Carrying this item. */
  item?: ItemId;
}

export interface GameEvent {
  id: string;
  title: string;
  /** Where it can fire: on the road, on arrival at a paradise, or only via `next`/the engine. */
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
  kit: { money?: number; food?: number; morale?: number; fuel?: number; items?: Partial<Record<ItemId, number>>; rep?: Partial<Record<Faction, number>> };
  /** Unlock id required before this character can be picked; undefined = available from the start. */
  unlock?: string;
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
  conditions: Condition[];
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
  /** "tag" deltas are shown as a label only (e.g. "Sam injured"); value sign marks good/bad. */
  unit?: "$" | "mi" | "%" | "days" | "gal" | "tag";
}

export interface PendingEvent {
  eventId: string;
  /** Rendered text (tokens filled in). */
  title: string;
  text: string;
  /** Member referred to as {member}; also the target of `healthOne` and `condition`. */
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

export type AfterEvent = "road" | "town" | "landmark";

export type Phase =
  | { kind: "road" }
  | { kind: "event"; event: PendingEvent; then: AfterEvent }
  | { kind: "outcome"; outcome: OutcomeView; then: AfterEvent }
  | { kind: "town" }
  | { kind: "landmark" }
  | { kind: "over"; ending: EndingId; cause?: string };

/** What happened on the most recent travel day, for the UI's day summary. */
export interface DaySummary {
  day: number;
  miles: number;
  foodEaten: number;
  fuelUsed: number;
  weather: Weather;
  starving: boolean;
  outOfFuel: boolean;
  passed: string[];
  arrived: string | null;
  deaths: string[];
  newConditions: string[];
  /** A line of party chatter on a quiet day. */
  banter: { name: string; text: string } | null;
  /** A short scene for a stop seen for the first time today. */
  vignette: { title: string; text: string } | null;
}

export interface GameState {
  version: number;
  seed: string;
  rng: number;
  difficulty: Difficulty;
  /** Daily Run date (YYYY-MM-DD), if this is a Daily Run. */
  daily: string | null;
  day: number;
  /** Month the run departed, 1-12. */
  startMonth: number;
  weather: Weather;
  stops: Stop[];
  legs: Leg[];
  /** Index of the stop you're at or last passed. */
  stopIndex: number;
  milesIntoLeg: number;
  totalMiles: number;
  pace: Pace;
  rations: Rations;
  food: number;
  money: number;
  fuel: number;
  van: number;
  items: Record<ItemId, number>;
  heat: number;
  rep: Record<Faction, number>;
  party: Member[];
  upgrades: string[];
  flags: string[];
  seenEvents: string[];
  queuedEvent: string | null;
  /** Landmark actions already taken at the current landmark. */
  landmarkUsed: LandmarkActionId[];
  /** Banter line ids already used this run. */
  seenBanter: string[];
  /** Stops (by name) whose vignette has been shown this run. */
  seenVignettes: string[];
  journal: JournalEntry[];
  lastDay: DaySummary | null;
  phase: Phase;
  stats: {
    eventsSeen: number; checksPassed: number; checksFailed: number; foodShortDays: number;
    dryDays: number; maxHeat: number; arrests: number;
  };
}

// ---------------------------------------------------------------- actions

export type Action =
  | { type: "travel" }
  | { type: "choose"; choice: number }
  | { type: "continue" }
  | { type: "setPace"; pace: Pace }
  | { type: "setRations"; rations: Rations }
  | { type: "useItem"; item: ItemId; member?: string }
  | { type: "buy"; item: string }
  | { type: "sell"; item: ItemId }
  | { type: "buyUpgrade"; upgrade: string }
  | { type: "repair" }
  | { type: "rest" }
  | { type: "settle" }
  | { type: "landmark"; action: LandmarkActionId }
  | { type: "leaveTown" };

export type LandmarkActionId = "talk" | "scavenge" | "layLow" | "motel" | "work";
