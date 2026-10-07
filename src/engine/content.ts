// Content validation. Used by tests and by `npm run validate`.
import { EFFECT_BOUNDS, WEATHER } from "./config";
import { CONTENT_ENDINGS } from "./data/endings";
import { ITEMS as ITEMS_LIST } from "./data/items";
import { MAJOR_STOPS } from "./data/route";
const MAJOR_STOP_IDS = MAJOR_STOPS.map(s => s.id);
import { EVENTS } from "./data/events";
import type { Choice, GameEvent, Outcome, Region } from "./types";

export const REGIONS: Region[] = ["northwest", "mountain", "plains", "midwest", "south", "east"];
const TOKENS = new Set(["{stop}", "{leader}", "{member}", "{skilled}"]);
/** Events the engine starts directly (not via "next"), so they need no incoming link. */
export const ENGINE_EVENTS = ["arrest", "breakdown", "on-fumes"];
const FACTIONS = ["resistance", "faithful", "militia"];
const ITEMS = ITEMS_LIST.map(i => i.id);
const CONDITIONS = ["injured", "sick", "exhausted"];
/** Phase 3 content targets. The validator fails below the minimums; the report shows progress to targets. */
export const MIN_ROAD_EVENTS_PER_REGION = 10;
export const MIN_PARADISE_EVENTS = 5;
export const TARGETS = { standalone: 250, chains: 12, chainBeats: [3, 6] as [number, number] };

export interface ContentReport {
  errors: string[];
  coverage: { region: Region; road: number; paradise: number }[];
  tags: Record<string, number>;
  total: number;
  /** Events that can fire on their own (road or paradise), not chain beats. */
  standalone: number;
  /** Quest chains: a road/paradise start followed by "next" beats, with their lengths. */
  chains: { start: string; beats: number }[];
}

export function validateContent(events: GameEvent[] = EVENTS): ContentReport {
  const errors: string[] = [];
  const ids = new Set<string>();
  const nextTargets = new Set<string>();
  const flagsSet = new Set<string>();
  const flagsRead = new Set<string>();

  for (const e of events) {
    const at = `event "${e.id}"`;
    if (ids.has(e.id)) errors.push(`${at}: duplicate id`);
    ids.add(e.id);
    if (!e.title.trim() || !e.text.trim()) errors.push(`${at}: empty title or text`);
    if (!e.choices.length) errors.push(`${at}: no choices`);
    if (e.choices.length > 4) errors.push(`${at}: more than 4 choices`);
    for (const r of e.regions ?? []) if (!REGIONS.includes(r)) errors.push(`${at}: unknown region "${r}"`);
    checkTokens(e.text, at, errors);
    for (const f of [...(e.conditions?.flags ?? []), ...(e.conditions?.notFlags ?? [])]) flagsRead.add(f);
    for (const w of e.conditions?.weather ?? []) if (!(w in WEATHER)) errors.push(`${at}: unknown weather "${w}"`);
    for (const st of e.conditions?.stops ?? []) if (!MAJOR_STOP_IDS.includes(st)) errors.push(`${at}: unknown stop "${st}"`);
    if (e.conditions?.item && !ITEMS.includes(e.conditions.item)) errors.push(`${at}: unknown item "${e.conditions.item}"`);

    // There must always be a way out: at least one choice with no skill requirement and no cost.
    if (!e.choices.some(c => !c.requires && !c.cost)) errors.push(`${at}: every choice is gated by a skill or a cost`);

    e.choices.forEach((c, i) => {
      const cat = `${at} choice ${i + 1}`;
      if (/\{[a-z]+\}/.test(c.label)) errors.push(`${cat}: choice labels can't use tokens (they aren't filled in)`);
      validateChoice(c, cat, errors);
      for (const o of allOutcomes(c)) {
        if (o.next) nextTargets.add(o.next);
        for (const f of o.setFlags ?? []) flagsSet.add(f);
      }
    });
  }

  for (const t of nextTargets) if (!ids.has(t)) errors.push(`"next" points to missing event "${t}"`);
  for (const e of events) {
    if (e.where === "chain" && !nextTargets.has(e.id) && !ENGINE_EVENTS.includes(e.id)) errors.push(`event "${e.id}": chain event is never reached by "next"`);
  }
  for (const id of ENGINE_EVENTS) if (!ids.has(id)) errors.push(`engine event "${id}" is missing`);
  for (const f of flagsRead) if (!flagsSet.has(f)) errors.push(`flag "${f}" is checked but never set`);

  const coverage = REGIONS.map(region => ({
    region,
    road: events.filter(e => e.where === "road" && (!e.regions || e.regions.includes(region))).length,
    paradise: events.filter(e => e.where === "paradise" && (!e.regions || e.regions.includes(region))).length
  }));
  for (const c of coverage) {
    if (c.road < MIN_ROAD_EVENTS_PER_REGION) errors.push(`region "${c.region}": only ${c.road} road events (need ${MIN_ROAD_EVENTS_PER_REGION})`);
  }
  const paradiseRegions: Region[] = ["northwest", "midwest", "east"];
  for (const r of paradiseRegions) {
    const n = coverage.find(c => c.region === r)!.paradise;
    if (n < MIN_PARADISE_EVENTS) errors.push(`region "${r}": only ${n} paradise events (need ${MIN_PARADISE_EVENTS})`);
  }

  const tags: Record<string, number> = {};
  for (const e of events) for (const t of e.tags) tags[t] = (tags[t] ?? 0) + 1;
  // Quest chains: walk "next" links (and flag-gated paradise payoffs) from each starting beat.
  const byId = new Map(events.map(e => [e.id, e]));
  const nextOf = (e: GameEvent) => [...new Set(e.choices.flatMap(c => allOutcomes(c)).map(o => o.next).filter((x): x is string => !!x))];
  const isChainStart = (e: GameEvent) => e.where !== "chain" && nextOf(e).length > 0 && !events.some(o => nextOf(o).includes(e.id));
  const chains = events.filter(isChainStart).map(start => {
    const seen = new Set<string>([start.id]);
    let frontier = nextOf(start);
    let depth = 1;
    while (frontier.length) {
      depth++;
      const nxt: string[] = [];
      for (const id of frontier) {
        if (seen.has(id)) continue;
        seen.add(id);
        const e = byId.get(id);
        if (e) nxt.push(...nextOf(e));
      }
      frontier = nxt.filter(id => !seen.has(id));
    }
    // A flag-gated payoff (e.g. a delivery at a paradise) counts as a final beat.
    const flags = new Set(start.choices.flatMap(c => allOutcomes(c)).flatMap(o => o.setFlags ?? []));
    const payoff = events.some(e => e.where === "paradise" && e.conditions?.flags?.some(f => flags.has(f)));
    return { start: start.id, beats: depth + (payoff ? 1 : 0) };
  });
  for (const c of chains) {
    if (c.beats < TARGETS.chainBeats[0] || c.beats > TARGETS.chainBeats[1]) errors.push(`chain "${c.start}" has ${c.beats} beats (want ${TARGETS.chainBeats[0]}-${TARGETS.chainBeats[1]})`);
  }
  const standalone = events.filter(e => e.where !== "chain" && !events.some(o => nextOf(o).includes(e.id))).length;

  return { errors, coverage, tags, total: events.length, standalone, chains };
}

function allOutcomes(c: Choice): Outcome[] {
  return [...(c.outcomes ?? []), ...(c.success ?? []), ...(c.failure ?? [])];
}

function validateChoice(c: Choice, at: string, errors: string[]) {
  if (c.check) {
    if (!c.success?.length || !c.failure?.length) errors.push(`${at}: skill check needs both success and failure outcomes`);
    if (c.outcomes?.length) errors.push(`${at}: skill check should not also have plain outcomes`);
  } else {
    if (!c.outcomes?.length) errors.push(`${at}: no outcomes`);
    if (c.success || c.failure) errors.push(`${at}: success/failure without a check`);
  }
  if (c.requires?.skill && c.check && c.requires.skill !== c.check.skill) errors.push(`${at}: requires and check use different skills`);
  if (c.requires?.item && !ITEMS.includes(c.requires.item)) errors.push(`${at}: requires unknown item "${c.requires.item}"`);
  if (c.cost?.money !== undefined && c.cost.money <= 0) errors.push(`${at}: cost must be positive`);
  for (const k of Object.keys(c.cost?.items ?? {})) if (!ITEMS.includes(k)) errors.push(`${at}: unknown item cost "${k}"`);
  if (c.check?.faction && !FACTIONS.includes(c.check.faction)) errors.push(`${at}: unknown faction "${c.check.faction}"`);
  for (const o of allOutcomes(c)) {
    if (!o.text.trim()) errors.push(`${at}: empty outcome text`);
    if (o.weight !== undefined && !(o.weight > 0)) errors.push(`${at}: outcome weight must be > 0`);
    checkTokens(o.text, at, errors);
    if (o.ending && !CONTENT_ENDINGS.includes(o.ending)) errors.push(`${at}: content may not trigger ending "${o.ending}"`);
    for (const [k, v] of Object.entries(o.effects ?? {})) {
      if (k === "condition" || k === "cure") {
        if (!CONDITIONS.includes(v as string)) errors.push(`${at}: unknown condition "${v}"`);
        continue;
      }
      const b = EFFECT_BOUNDS[k as keyof typeof EFFECT_BOUNDS];
      if (!b) { errors.push(`${at}: unknown effect "${k}"`); continue; }
      if (k === "rep" || k === "items") {
        const keys = k === "rep" ? FACTIONS : ITEMS;
        for (const [kk, vv] of Object.entries(v as Record<string, number>)) {
          if (!keys.includes(kk)) errors.push(`${at}: unknown ${k} key "${kk}"`);
          else if (!Number.isFinite(vv) || vv < b[0] || vv > b[1]) errors.push(`${at}: ${k}.${kk}=${vv} outside [${b[0]}, ${b[1]}]`);
        }
        continue;
      }
      if (typeof v !== "number" || !Number.isFinite(v) || v < b[0] || v > b[1]) errors.push(`${at}: effect ${k}=${v} outside [${b[0]}, ${b[1]}]`);
    }
  }
}

function checkTokens(text: string, at: string, errors: string[]) {
  for (const t of text.match(/\{[a-z]+\}/g) ?? []) if (!TOKENS.has(t)) errors.push(`${at}: unknown token ${t}`);
}
