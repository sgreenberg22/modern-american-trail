// Events: choosing which fires, rendering text, resolving choices, applying effects.
import { DIFFICULTY, RULES } from "./config";
import { endOfDay } from "./day";
import { EVENTS } from "./data/events";
import type { Rng } from "./rng";
import {
  calendar, checkOdds, choiceView, EVENTS_BY_ID, fuelCapacity, hasLivingSkill, leader, living, skilledMember
} from "./selectors";
import type { AfterEvent, Delta, Effects, EventConditions, Faction, GameEvent, GameState, ItemId, Outcome, Stop } from "./types";
import { addHeat, checkWipe, clamp, finish, log, markDeaths, round1, setFlag } from "./util";

export function conditionsMet(s: GameState, c: EventConditions | undefined): boolean {
  if (!c) return true;
  if (c.minDay !== undefined && s.day < c.minDay) return false;
  if (c.maxDay !== undefined && s.day > c.maxDay) return false;
  if (c.flags && !c.flags.every(f => s.flags.includes(f))) return false;
  if (c.notFlags && c.notFlags.some(f => s.flags.includes(f))) return false;
  if (c.anySkill && !c.anySkill.some(k => hasLivingSkill(s, k))) return false;
  if (c.maxFood !== undefined && s.food > c.maxFood) return false;
  if (c.maxLowestHealth !== undefined && Math.min(...living(s).map(m => m.health)) > c.maxLowestHealth) return false;
  if (c.minHeat !== undefined && s.heat < c.minHeat) return false;
  if (c.maxHeat !== undefined && s.heat > c.maxHeat) return false;
  for (const [f, v] of Object.entries(c.minRep ?? {}) as [Faction, number][]) if (s.rep[f] < v) return false;
  for (const [f, v] of Object.entries(c.maxRep ?? {}) as [Faction, number][]) if (s.rep[f] > v) return false;
  if (c.weather && !c.weather.includes(s.weather)) return false;
  if (c.seasons && !c.seasons.includes(calendar(s).season)) return false;
  if (c.maxVan !== undefined && s.van > c.maxVan) return false;
  if (c.maxFuel !== undefined && s.fuel > c.maxFuel) return false;
  return true;
}

export function pickEvent(s: GameState, rng: Rng, where: "road" | "paradise", region: Stop["region"], preferTag?: string): GameEvent | undefined {
  const eligible = EVENTS.filter(e =>
    e.where === where &&
    (!e.regions || e.regions.includes(region)) &&
    conditionsMet(s, e.conditions)
  );
  // Nothing repeats until the eligible pool is exhausted.
  const fresh = eligible.filter(e => !s.seenEvents.includes(e.id));
  const pool = fresh.length ? fresh : eligible;
  if (!pool.length) return undefined;
  const comms = s.upgrades.includes("comms");
  return rng.weighted(pool, e => {
    let w = e.weight ?? 1;
    if (preferTag && e.tags.includes(preferTag)) w *= 4;
    // Weather events are much likelier on days with that weather.
    if (e.conditions?.weather) w *= 3;
    if (comms && e.tags.includes("danger")) w *= RULES.commsDangerWeight;
    return w;
  });
}

export function startEvent(s: GameState, rng: Rng, ev: GameEvent, stopName: string, then: AfterEvent) {
  const member = rng.pick(living(s));
  if (!s.seenEvents.includes(ev.id)) s.seenEvents.push(ev.id);
  s.stats.eventsSeen += 1;
  const event = { eventId: ev.id, title: ev.title, text: "", memberId: member.id, stopName };
  event.text = render(s, ev.text, event);
  s.phase = { kind: "event", event, then };
}

export function render(s: GameState, text: string, ctx: { memberId: string; stopName: string }, skilledName?: string): string {
  const member = s.party.find(m => m.id === ctx.memberId);
  const lead = leader(s);
  return text
    .replaceAll("{stop}", ctx.stopName)
    .replaceAll("{leader}", lead?.name ?? "Someone")
    .replaceAll("{member}", member?.name ?? lead?.name ?? "Someone")
    .replaceAll("{skilled}", skilledName ?? lead?.name ?? "Someone");
}

export function choose(s: GameState, index: number, rng: Rng): boolean {
  if (s.phase.kind !== "event") return false;
  const pending = s.phase.event;
  const then = s.phase.then;
  const ev = EVENTS_BY_ID.get(pending.eventId);
  const choice = ev?.choices[index];
  if (!ev || !choice) return false;
  const view = choiceView(s, choice, index, ev.tags);
  if (!view.visible || !view.enabled) return false;

  const deltas: Delta[] = [];
  if (choice.cost?.money) { s.money -= choice.cost.money; deltas.push({ label: "Money", value: -choice.cost.money, unit: "$" }); }
  if (choice.cost?.food) { s.food = round1(s.food - choice.cost.food); deltas.push({ label: "Food", value: -choice.cost.food }); }
  if (choice.cost?.fuel) { s.fuel = round1(s.fuel - choice.cost.fuel); deltas.push({ label: "Gas", value: -choice.cost.fuel, unit: "gal" }); }
  for (const [k, v] of Object.entries(choice.cost?.items ?? {}) as [ItemId, number][]) {
    s.items[k] -= v;
    deltas.push({ label: k === "parts" ? "Spare parts" : k[0].toUpperCase() + k.slice(1), value: -v });
  }

  let success: boolean | undefined;
  let outcomes: Outcome[] = choice.outcomes ?? [];
  if (choice.check) {
    success = rng.float() * 100 < checkOdds(s, choice.check, ev.tags);
    outcomes = (success ? choice.success : choice.failure) ?? [];
    if (success) s.stats.checksPassed += 1; else s.stats.checksFailed += 1;
  }
  const outcome: Outcome = outcomes.length ? rng.weighted(outcomes, o => o.weight ?? 1) : { text: "Nothing much happens." };

  const skilled = skilledMember(s, view.skill)?.name;
  const text = render(s, outcome.text, pending, skilled);
  const deaths = applyEffects(s, rng, outcome.effects, pending.memberId, deltas, ev.title);

  for (const f of outcome.setFlags ?? []) setFlag(s, f);
  if (outcome.clearFlags) s.flags = s.flags.filter(f => !outcome.clearFlags!.includes(f));
  if (outcome.next) s.queuedEvent = outcome.next;

  log(s, { title: pending.title, text: `${choice.label}. ${text}`, deltas });
  for (const d of deaths) log(s, { title: "Loss", text: `${d} did not make it.` });

  if (outcome.ending) { finish(s, outcome.ending, ev.title); return true; }
  if (checkWipe(s)) return true;
  s.phase = { kind: "outcome", outcome: { title: pending.title, text, deltas, success, deaths }, then };
  return true;
}

/** Applies an outcome's effects. Negative effects scale with difficulty. Returns names of anyone who died. */
export function applyEffects(s: GameState, rng: Rng, e: Effects | undefined, memberId: string, deltas: Delta[], cause: string): string[] {
  if (!e) return [];
  const { harshness, generosity } = DIFFICULTY[s.difficulty];
  const scale = (v: number) => Math.round(v * (v < 0 ? harshness : generosity));
  const deaths: string[] = [];
  const target = s.party.find(m => m.id === memberId && m.alive) ?? (living(s).length ? rng.pick(living(s)) : undefined);

  if (e.money) {
    const before = s.money;
    s.money = Math.max(0, s.money + scale(e.money));
    deltas.push({ label: "Money", value: s.money - before, unit: "$" });
  }
  if (e.food) {
    const before = s.food;
    s.food = round1(Math.max(0, s.food + scale(e.food)));
    deltas.push({ label: "Food", value: round1(s.food - before) });
  }
  if (e.fuel) {
    const before = s.fuel;
    s.fuel = round1(clamp(s.fuel + e.fuel, 0, fuelCapacity(s)));
    if (s.fuel !== before) deltas.push({ label: "Gas", value: round1(s.fuel - before), unit: "gal" });
  }
  if (e.van) {
    const before = s.van;
    s.van = clamp(s.van + e.van, 0, 100);
    if (s.van !== before) deltas.push({ label: "Van", value: s.van - before });
  }
  if (e.miles) {
    const leg = s.legs[s.stopIndex];
    if (leg) {
      const before = s.milesIntoLeg;
      // Effects move you within the current leg only; arriving happens by driving.
      s.milesIntoLeg = clamp(s.milesIntoLeg + e.miles, 0, leg.miles - 1);
      const moved = s.milesIntoLeg - before;
      s.totalMiles += moved;
      if (moved) deltas.push({ label: moved > 0 ? "Ahead" : "Lost ground", value: moved, unit: "mi" });
    }
  }
  if (e.health) {
    for (const m of living(s)) m.health = clamp(m.health + scale(e.health), 0, 100);
    deltas.push({ label: "Health (everyone)", value: scale(e.health) });
  }
  if (e.healthOne && target) {
    target.health = clamp(target.health + scale(e.healthOne), 0, 100);
    deltas.push({ label: `${target.name}'s health`, value: scale(e.healthOne) });
  }
  if (e.morale) {
    for (const m of living(s)) m.morale = clamp(m.morale + scale(e.morale), 0, 100);
    deltas.push({ label: "Morale (everyone)", value: scale(e.morale) });
  }
  if (e.heat) {
    const before = s.heat;
    addHeat(s, e.heat);
    if (s.heat !== before) deltas.push({ label: "Heat", value: s.heat - before });
  }
  for (const [f, v] of Object.entries(e.rep ?? {}) as [Faction, number][]) {
    s.rep[f] = clamp(s.rep[f] + v, -100, 100);
    deltas.push({ label: `${f[0].toUpperCase()}${f.slice(1)} rep`, value: v });
  }
  for (const [k, v] of Object.entries(e.items ?? {}) as [ItemId, number][]) {
    s.items[k] = Math.max(0, s.items[k] + v);
    deltas.push({ label: k === "parts" ? "Spare parts" : k[0].toUpperCase() + k.slice(1), value: v });
  }
  if (e.condition && target && !target.conditions.includes(e.condition)) {
    target.conditions.push(e.condition);
    deltas.push({ label: `${target.name} ${e.condition}`, value: -1, unit: "tag" });
  }
  if (e.cure) {
    for (const m of living(s)) m.conditions = m.conditions.filter(c => c !== e.cure);
    deltas.push({ label: `No longer ${e.cure}`, value: 1, unit: "tag" });
  }
  deaths.push(...markDeaths(s, () => cause));

  if (e.delay) {
    for (let i = 0; i < e.delay && living(s).length; i++) {
      s.day += 1;
      deaths.push(...endOfDay(s, rng, "road").deaths);
    }
    deltas.push({ label: "Delayed", value: e.delay, unit: "days" });
  }
  return deaths;
}
