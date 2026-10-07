// Content validation. Used by tests and by `npm run validate`.
import { EFFECT_BOUNDS } from "./config";
import { EVENTS } from "./data/events";
import type { Choice, GameEvent, Outcome, Region } from "./types";

export const REGIONS: Region[] = ["northwest", "mountain", "plains", "midwest", "south", "east"];
const TOKENS = new Set(["{stop}", "{leader}", "{member}", "{skilled}"]);
/** Minimum road events that can fire in each region (raised in Phase 3). */
export const MIN_ROAD_EVENTS_PER_REGION = 10;
export const MIN_PARADISE_EVENTS = 5;

export interface ContentReport {
  errors: string[];
  coverage: { region: Region; road: number; paradise: number }[];
  tags: Record<string, number>;
  total: number;
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

    // There must always be a way out: at least one choice with no skill requirement and no cost.
    if (!e.choices.some(c => !c.requires && !c.cost)) errors.push(`${at}: every choice is gated by a skill or a cost`);

    e.choices.forEach((c, i) => {
      const cat = `${at} choice ${i + 1}`;
      checkTokens(c.label, cat, errors);
      validateChoice(c, cat, errors);
      for (const o of allOutcomes(c)) {
        if (o.next) nextTargets.add(o.next);
        for (const f of o.setFlags ?? []) flagsSet.add(f);
      }
    });
  }

  for (const t of nextTargets) if (!ids.has(t)) errors.push(`"next" points to missing event "${t}"`);
  for (const e of events) {
    if (e.where === "chain" && !nextTargets.has(e.id)) errors.push(`event "${e.id}": chain event is never reached by "next"`);
  }
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
  return { errors, coverage, tags, total: events.length };
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
  if (c.requires && c.check && c.requires.skill !== c.check.skill) errors.push(`${at}: requires and check use different skills`);
  if (c.cost?.money !== undefined && c.cost.money <= 0) errors.push(`${at}: cost must be positive`);
  for (const o of allOutcomes(c)) {
    if (!o.text.trim()) errors.push(`${at}: empty outcome text`);
    if (o.weight !== undefined && !(o.weight > 0)) errors.push(`${at}: outcome weight must be > 0`);
    checkTokens(o.text, at, errors);
    for (const [k, v] of Object.entries(o.effects ?? {})) {
      const b = EFFECT_BOUNDS[k as keyof typeof EFFECT_BOUNDS];
      if (!b) errors.push(`${at}: unknown effect "${k}"`);
      else if (typeof v !== "number" || !Number.isFinite(v) || v < b[0] || v > b[1]) errors.push(`${at}: effect ${k}=${v} outside [${b[0]}, ${b[1]}]`);
    }
  }
}

function checkTokens(text: string, at: string, errors: string[]) {
  for (const t of text.match(/\{[a-z]+\}/g) ?? []) if (!TOKENS.has(t)) errors.push(`${at}: unknown token ${t}`);
}
