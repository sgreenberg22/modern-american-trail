// Between-run progression: unlocks, lifetime stats, Daily Run. Pure functions over
// a small "meta" record that the UI stores separately from the run save.
import { z } from "zod/mini";
import { CHARACTERS, KITS, PARTY_SIZE } from "./data/characters";
import { ENDINGS, UNLOCKS, type UnlockDef } from "./data/endings";
import type { NewGameOptions } from "./engine";
import { hashString, Rng } from "./rng";
import { endingOf, living, score } from "./selectors";
import type { Character, Difficulty, EndingId, GameState } from "./types";

export const META_VERSION = 1;

export interface DailyResult { score: number; ending: EndingId; day: number; survivors: number; share: string }

export interface MetaState {
  version: number;
  unlocks: string[];
  runs: number;
  wins: number;
  lifetimeMiles: number;
  bestScore: Record<Difficulty, number>;
  endingsSeen: EndingId[];
  /** First completed attempt per Daily Run date. */
  daily: Record<string, DailyResult>;
}

export function emptyMeta(): MetaState {
  return { version: META_VERSION, unlocks: [], runs: 0, wins: 0, lifetimeMiles: 0, bestScore: { easy: 0, normal: 0, hard: 0 }, endingsSeen: [], daily: {} };
}

const MetaSchema = z.object({
  version: z.literal(META_VERSION),
  unlocks: z.array(z.string()),
  runs: z.number().check(z.gte(0)),
  wins: z.number().check(z.gte(0)),
  lifetimeMiles: z.number().check(z.gte(0)),
  bestScore: z.object({ easy: z.number(), normal: z.number(), hard: z.number() }),
  endingsSeen: z.array(z.enum(Object.keys(ENDINGS) as [EndingId, ...EndingId[]])),
  daily: z.record(z.string(), z.object({
    score: z.number(), ending: z.enum(Object.keys(ENDINGS) as [EndingId, ...EndingId[]]),
    day: z.number(), survivors: z.number(), share: z.string()
  }))
});

/** Parses stored meta; anything invalid falls back to a fresh record rather than breaking the game. */
export function parseMeta(text: string | null): MetaState {
  if (!text) return emptyMeta();
  try {
    const r = MetaSchema.safeParse(JSON.parse(text));
    return r.success ? (r.data as MetaState) : emptyMeta();
  } catch {
    return emptyMeta();
  }
}

export const isUnlocked = (meta: MetaState, unlock?: string) => !unlock || meta.unlocks.includes(unlock);
export const availableCharacters = (meta: MetaState): Character[] => CHARACTERS.filter(c => isUnlocked(meta, c.unlock));
export const availableKits = (meta: MetaState) => KITS.filter(k => isUnlocked(meta, k.unlock));

/** Which unlock conditions a finished run satisfies. */
function earned(final: GameState, lifetimeMiles: number): string[] {
  const ending = endingOf(final);
  const win = ending?.kind === "win";
  const out: string[] = [];
  if (final.flags.includes("reached-twin-cities")) out.push("reach-twin-cities");
  if (final.flags.includes("reached-chicago")) out.push("reach-chicago");
  if (win) out.push("first-win");
  if (win && final.difficulty !== "easy") out.push("win-normal");
  if (ending?.id === "full-house") out.push("full-house");
  if (final.flags.includes("jailbreak")) out.push("jailbreak");
  if (final.rep.faithful >= 30) out.push("faithful-friend");
  if (lifetimeMiles >= 10000) out.push("long-haul");
  if (final.flags.includes("ran-dry")) out.push("ran-dry");
  return out;
}

/** Records a finished run: stats, best scores, Daily Run result, and any new unlocks. */
export function recordRun(meta: MetaState, final: GameState): { meta: MetaState; newUnlocks: UnlockDef[] } {
  const ending = endingOf(final);
  if (!ending) return { meta, newUnlocks: [] };
  const total = score(final).total;
  const lifetimeMiles = meta.lifetimeMiles + final.totalMiles;
  const next: MetaState = {
    ...meta,
    runs: meta.runs + 1,
    wins: meta.wins + (ending.kind === "win" ? 1 : 0),
    lifetimeMiles,
    bestScore: { ...meta.bestScore, [final.difficulty]: Math.max(meta.bestScore[final.difficulty], total) },
    endingsSeen: meta.endingsSeen.includes(ending.id) ? meta.endingsSeen : [...meta.endingsSeen, ending.id],
    unlocks: [...meta.unlocks],
    daily: { ...meta.daily }
  };
  if (final.daily && !next.daily[final.daily]) {
    next.daily[final.daily] = { score: total, ending: ending.id, day: final.day, survivors: living(final).length, share: shareText(final) };
  }
  const fresh = earned(final, lifetimeMiles).filter(u => !next.unlocks.includes(u));
  next.unlocks.push(...fresh);
  return { meta: next, newUnlocks: UNLOCKS.filter(u => fresh.includes(u.id)) };
}

// ------------------------------------------------------------------ Daily Run

/** The same run for everyone on a given date: seed, party, month and kit all derive from it. */
export function dailyOptions(date: string): Required<Omit<NewGameOptions, "daily">> & { daily: string } {
  const rng = new Rng(hashString(`daily|${date}`));
  const starters = CHARACTERS.filter(c => !c.unlock);
  return {
    seed: `daily-${date}`,
    difficulty: "normal",
    party: rng.shuffle(starters).slice(0, PARTY_SIZE).map(c => c.id),
    kit: "cooler",
    startMonth: rng.int(4, 10),
    daily: date
  };
}

/** A spoiler-free result to paste into a group chat. */
export function shareText(final: GameState): string {
  const ending = endingOf(final);
  const total = score(final).total;
  const fraction = Math.min(1, final.totalMiles / final.legs.reduce((a, l) => a + l.miles, 0));
  const cells = 10;
  const filled = Math.round(fraction * cells);
  const bar = "🟩".repeat(filled) + "⬛".repeat(cells - filled);
  const people = final.party.map(m => (m.alive ? "🧍" : "🪦")).join("");
  const title = final.daily ? `Modern American Trail · Daily ${final.daily}` : `Modern American Trail · ${final.difficulty}`;
  return [
    title,
    `${bar} ${ending?.kind === "win" ? "Vermont" : `${final.totalMiles.toLocaleString("en-US")} mi`}`,
    `${people} Day ${final.day} · ${ending?.title ?? ""}`,
    `Score ${total.toLocaleString("en-US")}`
  ].join("\n");
}
