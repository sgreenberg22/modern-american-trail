// Versioned, validated saves. Only GameState is ever saved: UI flags (open modals,
// loading spinners) live in React and can't leak into a save.
import { z } from "zod/mini";
import { STATE_VERSION } from "./engine";
import { EVENTS_BY_ID } from "./selectors";
import type { GameState } from "./types";

const SKILLS = ["hacking", "persuasion", "survival", "mechanical", "medical", "negotiation", "intimidation", "stealth"] as const;
const REGIONS = ["northwest", "mountain", "plains", "midwest", "south", "east"] as const;
const num = () => z.number().check(z.refine(Number.isFinite, "must be finite"));
const nonneg = () => num().check(z.gte(0));

const Delta = z.object({ label: z.string(), value: num(), unit: z.optional(z.enum(["$", "mi", "%", "days"])) });
const AfterEvent = z.enum(["road", "town"]);

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
  z.object({ kind: z.literal("over"), result: z.enum(["win", "dead"]), cause: z.optional(z.string()) })
]);

const GameStateSchema = z.object({
  version: z.literal(STATE_VERSION),
  seed: z.string().check(z.maxLength(200)),
  rng: z.number().check(z.int(), z.gte(0), z.lte(0xffffffff)),
  difficulty: z.enum(["easy", "normal", "hard"]),
  day: z.number().check(z.int(), z.gte(1), z.lte(10000)),
  stops: z.array(z.object({
    id: z.string(), name: z.string(), short: z.string(), kind: z.enum(["paradise", "hostile", "waypoint", "goal"]),
    region: z.enum(REGIONS), lat: num(), lon: num()
  })).check(z.minLength(2)),
  legs: z.array(z.object({ from: z.number().check(z.int()), to: z.number().check(z.int()), miles: nonneg() })),
  stopIndex: z.number().check(z.int(), z.gte(0)),
  milesIntoLeg: nonneg(),
  totalMiles: nonneg(),
  food: nonneg(),
  money: nonneg(),
  party: z.array(z.object({
    id: z.string(), name: z.string(), profession: z.string(), skill: z.enum(SKILLS),
    health: num().check(z.gte(0), z.lte(100)), morale: num().check(z.gte(0), z.lte(100)),
    alive: z.boolean(), causeOfDeath: z.optional(z.string()), diedOnDay: z.optional(z.number())
  })).check(z.minLength(1), z.maxLength(8)),
  upgrades: z.array(z.string()),
  flags: z.array(z.string()),
  seenEvents: z.array(z.string()),
  queuedEvent: z.nullable(z.string()),
  journal: z.array(z.object({ day: num(), title: z.string(), text: z.string(), deltas: z.optional(z.array(Delta)) })),
  lastDay: z.nullable(z.object({
    day: num(), miles: num(), foodEaten: num(), starving: z.boolean(),
    passed: z.array(z.string()), arrived: z.nullable(z.string()), deaths: z.array(z.string())
  })),
  phase: Phase,
  stats: z.object({ eventsSeen: nonneg(), checksPassed: nonneg(), checksFailed: nonneg(), foodShortDays: nonneg() })
});

const Envelope = z.object({ format: z.literal("modern-american-trail"), version: z.number(), state: z.unknown() });

/**
 * Migrations from version N to N+1. Version 3 is the first engine-based format;
 * saves from the pre-rebuild game (v2) don't map onto it and are rejected.
 */
const MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {};

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
  if (s.queuedEvent && !EVENTS_BY_ID.has(s.queuedEvent)) s.queuedEvent = null;
  return { ok: true, state: s };
}
