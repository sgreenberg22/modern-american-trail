// Versioned, validated saves. Only GameState is ever saved: UI flags (open modals,
// loading spinners) live in React and can't leak into a save.
import { z } from "zod/mini";
import { STATE_VERSION } from "./engine";
import { ITEMS_BY_ID } from "./data/items";
import { EVENTS_BY_ID } from "./selectors";
import type { GameState } from "./types";

const SKILLS = ["hacking", "persuasion", "survival", "mechanical", "medical", "negotiation", "intimidation", "stealth"] as const;
const REGIONS = ["northwest", "mountain", "plains", "midwest", "south", "east"] as const;
const num = () => z.number().check(z.refine(Number.isFinite, "must be finite"));
const nonneg = () => num().check(z.gte(0));

const Delta = z.object({ label: z.string(), value: num(), unit: z.optional(z.enum(["$", "mi", "%", "days", "gal", "tag"])) });
const AfterEvent = z.enum(["road", "town", "landmark"]);
const ENDING_IDS = ["full-house", "vermont", "lone-survivor", "settled", "detained", "starved", "worn-down", "lost"] as const;
const WEATHERS = ["clear", "rain", "storm", "heat", "snow", "fog"] as const;
const CONDITIONS = ["injured", "sick", "exhausted"] as const;
const LANDMARK_ACTIONS = ["talk", "scavenge", "layLow", "motel", "work"] as const;
const count = () => z.number().check(z.int(), z.gte(0), z.lte(99));
const rep = () => num().check(z.gte(-100), z.lte(100));

const Phase = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("road") }),
  z.object({
    kind: z.literal("event"),
    then: AfterEvent,
    event: z.object({ eventId: z.string(), title: z.string(), text: z.string(), memberId: z.string(), stopName: z.string() })
  }),
  z.object({
    kind: z.literal("outcome"),
    then: AfterEvent,
    outcome: z.object({
      title: z.string(), text: z.string(), deltas: z.array(Delta),
      success: z.optional(z.boolean()), deaths: z.array(z.string())
    })
  }),
  z.object({ kind: z.literal("town") }),
  z.object({ kind: z.literal("landmark") }),
  z.object({ kind: z.literal("over"), ending: z.enum(ENDING_IDS), cause: z.optional(z.string()) })
]);

const GameStateSchema = z.object({
  version: z.literal(STATE_VERSION),
  seed: z.string().check(z.maxLength(200)),
  rng: z.number().check(z.int(), z.gte(0), z.lte(0xffffffff)),
  difficulty: z.enum(["easy", "normal", "hard"]),
  daily: z.nullable(z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/))),
  day: z.number().check(z.int(), z.gte(1), z.lte(10000)),
  startMonth: z.number().check(z.int(), z.gte(1), z.lte(12)),
  weather: z.enum(WEATHERS),
  stops: z.array(z.object({
    id: z.string(), name: z.string(), short: z.string(), kind: z.enum(["paradise", "hostile", "waypoint", "goal"]),
    region: z.enum(REGIONS), lat: num(), lon: num()
  })).check(z.minLength(2)),
  legs: z.array(z.object({ from: z.number().check(z.int()), to: z.number().check(z.int()), miles: nonneg() })),
  stopIndex: z.number().check(z.int(), z.gte(0)),
  milesIntoLeg: nonneg(),
  totalMiles: nonneg(),
  pace: z.enum(["steady", "hurried", "grueling"]),
  rations: z.enum(["filling", "meager", "bare"]),
  food: nonneg(),
  money: nonneg(),
  fuel: nonneg().check(z.lte(100)),
  van: num().check(z.gte(0), z.lte(100)),
  items: z.record(z.string(), count()),
  heat: num().check(z.gte(0), z.lte(100)),
  rep: z.object({ resistance: rep(), faithful: rep(), militia: rep() }),
  party: z.array(z.object({
    id: z.string(), name: z.string(), profession: z.string(), skill: z.enum(SKILLS),
    health: num().check(z.gte(0), z.lte(100)), morale: num().check(z.gte(0), z.lte(100)),
    alive: z.boolean(), conditions: z.array(z.enum(CONDITIONS)), causeOfDeath: z.optional(z.string()), diedOnDay: z.optional(z.number())
  })).check(z.minLength(1), z.maxLength(8)),
  upgrades: z.array(z.string()),
  flags: z.array(z.string()),
  seenEvents: z.array(z.string()),
  queuedEvent: z.nullable(z.string()),
  queuedDay: z.nullable(z.number().check(z.int(), z.gte(0))),
  landmarkUsed: z.array(z.enum(LANDMARK_ACTIONS)),
  seenBanter: z.array(z.string()),
  seenVignettes: z.array(z.string()),
  journal: z.array(z.object({ day: num(), title: z.string(), text: z.string(), deltas: z.optional(z.array(Delta)) })),
  lastDay: z.nullable(z.object({
    day: num(), miles: num(), foodEaten: num(), fuelUsed: num(), weather: z.enum(WEATHERS), starving: z.boolean(), outOfFuel: z.boolean(),
    passed: z.array(z.string()), arrived: z.nullable(z.string()), deaths: z.array(z.string()), newConditions: z.array(z.string()),
    banter: z.nullable(z.object({ name: z.string(), text: z.string() })),
    vignette: z.nullable(z.object({ title: z.string(), text: z.string() }))
  })),
  phase: Phase,
  stats: z.object({
    eventsSeen: nonneg(), checksPassed: nonneg(), checksFailed: nonneg(), foodShortDays: nonneg(),
    dryDays: nonneg(), maxHeat: nonneg(), arrests: nonneg()
  })
});

const Envelope = z.object({ format: z.literal("modern-american-trail"), version: z.number(), state: z.unknown() });

/**
 * Migrations from version N to N+1. Version 3 is the first engine-based format;
 * saves from the pre-rebuild game (v2) don't map onto it and are rejected.
 */
const MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {
  // v3 -> v4 (Phase 2): vehicle, pace/rations, items, heat, reputation, conditions, calendar, endings.
  3: (raw) => {
    const party = (raw.party as Record<string, unknown>[] | undefined)?.map(m => ({ ...m, conditions: [] as string[] })) as Record<string, unknown>[] | undefined;
    const phase = raw.phase as { kind: string; result?: string; cause?: string } | undefined;
    let nextPhase: unknown = phase;
    if (phase?.kind === "over") {
      const alive = party?.filter(m => m.alive).length ?? 0;
      const ending = phase.result === "win"
        ? (alive === party?.length ? "full-house" : alive === 1 ? "lone-survivor" : "vermont")
        : phase.cause === "starvation" ? "starved" : phase.cause === "exhaustion" ? "worn-down" : "lost";
      nextPhase = { kind: "over", ending, cause: phase.cause };
    }
    const stats = (raw.stats ?? {}) as Record<string, unknown>;
    return {
      ...raw,
      daily: null,
      startMonth: 6,
      weather: "clear",
      pace: "steady",
      rations: "filling",
      fuel: 20,
      van: 100,
      items: { medkit: 0, antibiotics: 0, parts: 0, books: 0 },
      heat: 0,
      rep: { resistance: 0, faithful: 0, militia: 0 },
      party,
      landmarkUsed: [],
      lastDay: null,
      phase: nextPhase,
      stats: { ...stats, dryDays: 0, maxHeat: 0, arrests: 0 }
    };
  },
  // v4 -> v5 (Phase 3): data-driven items (sparse record), banter and vignettes.
  4: (raw) => {
    const items = Object.fromEntries(Object.entries((raw.items ?? {}) as Record<string, number>).filter(([, n]) => n > 0));
    const lastDay = raw.lastDay ? { ...(raw.lastDay as object), banter: null, vignette: null } : null;
    return { ...raw, items, lastDay, seenBanter: [], seenVignettes: [], queuedDay: raw.queuedEvent ? 0 : null };
  }
};

export function serialize(state: GameState): string {
  return JSON.stringify({ format: "modern-american-trail", version: STATE_VERSION, state });
}

export type LoadResult = { ok: true; state: GameState } | { ok: false; error: string };

export function deserialize(text: string): LoadResult {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return { ok: false, error: "That file isn't valid JSON." }; }

  const env = Envelope.safeParse(raw);
  if (!env.success) {
    const legacy = raw && typeof raw === "object" && ("_meta" in raw || "locations" in raw);
    return { ok: false, error: legacy ? "This save is from the old version of the game and can't be loaded." : "That isn't a Modern American Trail save." };
  }

  let version = env.data.version;
  let state = env.data.state as Record<string, unknown>;
  if (version > STATE_VERSION) return { ok: false, error: "This save is from a newer version of the game." };
  while (version < STATE_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) return { ok: false, error: "This save is from the old version of the game and can't be loaded." };
    state = { ...migrate(state), version: version + 1 };
    version += 1;
  }

  const parsed = GameStateSchema.safeParse(state);
  if (!parsed.success) return { ok: false, error: "This save file is damaged or was edited." };
  const s = parsed.data as GameState;

  // Cross-field checks the schema can't express.
  if (s.legs.length !== s.stops.length - 1 || s.stopIndex >= s.stops.length) return { ok: false, error: "This save file is damaged or was edited." };
  if (s.stopIndex < s.legs.length && s.milesIntoLeg > s.legs[s.stopIndex].miles) return { ok: false, error: "This save file is damaged or was edited." };
  if (s.phase.kind === "event" && !EVENTS_BY_ID.has(s.phase.event.eventId)) return { ok: false, error: "This save refers to an event that no longer exists." };
  if (s.queuedEvent && !EVENTS_BY_ID.has(s.queuedEvent)) { s.queuedEvent = null; s.queuedDay = null; }
  // Drop items that no longer exist rather than failing the whole load.
  s.items = Object.fromEntries(Object.entries(s.items).filter(([k, n]) => ITEMS_BY_ID.has(k) && n > 0));
  return { ok: true, state: s };
}
