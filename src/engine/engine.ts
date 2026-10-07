// The reducer. applyAction(state, action) is pure: it clones the input, applies
// the action to the copy, and returns it. Invalid actions return the input unchanged.
import { DIFFICULTY, RULES } from "./config";
import { CHARACTERS, PARTY_SIZE } from "./data/characters";
import { EVENTS } from "./data/events";
import { SHOP_ITEMS, UPGRADES } from "./data/items";
import { buildRoute } from "./data/route";
import { hashString, Rng } from "./rng";
import {
  EVENTS_BY_ID, choiceView, currentStop, hasLivingSkill, living, leader, nextStop,
  shopPrice, skilledMember, checkOdds, averageHealth
} from "./selectors";
import type {
  Action, AfterEvent, Delta, Difficulty, Effects, EventConditions, GameEvent, GameState,
  Member, Outcome, Stop
} from "./types";

export const STATE_VERSION = 3;

// ------------------------------------------------------------------ new game

export interface NewGameOptions {
  seed: string;
  difficulty?: Difficulty;
  /** Character ids; defaults to a seeded random party. */
  party?: string[];
}

export function newGame({ seed, difficulty = "normal", party }: NewGameOptions): GameState {
  const rng = new Rng(hashString(seed));
  const cfg = DIFFICULTY[difficulty];
  const { stops, legs } = buildRoute(rng);

  const chosen = party?.length
    ? party.map(id => CHARACTERS.find(c => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c)
    : rng.shuffle(CHARACTERS).slice(0, PARTY_SIZE);

  let money = cfg.startMoney;
  let food = cfg.startFood;
  let morale = 75;
  for (const c of chosen) {
    money += c.kit.money ?? 0;
    food += c.kit.food ?? 0;
    morale += c.kit.morale ?? 0;
  }

  const members: Member[] = chosen.map(c => ({
    id: c.id, name: c.name, profession: c.profession, skill: c.skill,
    health: 100, morale: clamp(morale, 0, 100), alive: true
  }));

  return {
    version: STATE_VERSION,
    seed,
    rng: rng.state,
    difficulty,
    day: 1,
    stops,
    legs,
    stopIndex: 0,
    milesIntoLeg: 0,
    totalMiles: 0,
    food,
    money,
    party: members,
    upgrades: [],
    flags: [],
    seenEvents: [],
    queuedEvent: null,
    journal: [{
      day: 1,
      title: "The Escape Begins",
      text: `${members.map(m => `${m.name} the ${m.profession}`).join(", ")} load the van in ${stops[0].name}. Vermont is ${legs.reduce((a, l) => a + l.miles, 0).toLocaleString("en-US")} miles east.`
    }],
    lastDay: null,
    // Start in town so the first decision is how to provision.
    phase: { kind: "town" },
    stats: { eventsSeen: 0, checksPassed: 0, checksFailed: 0, foodShortDays: 0 }
  };
}

// ------------------------------------------------------------------ reducer

export function applyAction(state: GameState, action: Action): GameState {
  const s = cloneForStep(state);
  const rng = new Rng(s.rng);
  const ok = step(s, action, rng);
  if (!ok) return state;
  s.rng = rng.state;
  return s;
}

function step(s: GameState, a: Action, rng: Rng): boolean {
  const phase = s.phase.kind;
  switch (a.type) {
    case "travel": return phase === "road" && travel(s, rng);
    case "choose": return phase === "event" && choose(s, a.choice, rng);
    case "continue":
      if (s.phase.kind !== "outcome") return false;
      s.phase = { kind: s.phase.then };
      return true;
    case "buy": return phase === "town" && buy(s, a.item);
    case "buyUpgrade": return phase === "town" && buyUpgrade(s, a.upgrade);
    case "rest": return phase === "town" && rest(s, rng);
    case "leaveTown":
      if (phase !== "town") return false;
      s.phase = { kind: "road" };
      return true;
  }
}

// ------------------------------------------------------------------ travel

function travel(s: GameState, rng: Rng): boolean {
  const cfg = DIFFICULTY[s.difficulty];
  s.day += 1;

  let miles = cfg.milesPerDay + rng.int(-cfg.milesJitter, cfg.milesJitter);
  if (s.upgrades.includes("vehicle")) miles += RULES.vehicleMiles;
  if (averageHealth(s) < RULES.lowHealthAvg) miles *= RULES.lowHealthSpeed;
  miles = Math.max(1, Math.round(miles));

  // Move along the route. Leftover miles carry through checkpoints; you stop for
  // the day on reaching a paradise or the goal.
  const passed: Stop[] = [];
  let arrived: Stop | null = null;
  let moved = 0;
  while (miles > 0 && s.stopIndex < s.legs.length) {
    const leg = s.legs[s.stopIndex];
    const remain = leg.miles - s.milesIntoLeg;
    if (miles < remain) {
      s.milesIntoLeg += miles;
      moved += miles;
      miles = 0;
    } else {
      moved += remain;
      miles -= remain;
      s.stopIndex += 1;
      s.milesIntoLeg = 0;
      const stop = s.stops[s.stopIndex];
      if (stop.kind === "paradise" || stop.kind === "goal") {
        arrived = stop;
        miles = 0;
      } else {
        passed.push(stop);
      }
    }
  }
  s.totalMiles += moved;

  const day = endOfDay(s, rng, false);
  s.lastDay = {
    day: s.day, miles: moved, foodEaten: day.eaten, starving: day.starving,
    passed: passed.map(p => p.name), arrived: arrived?.name ?? null, deaths: day.deaths
  };

  const lines = [`Drove ${moved} miles.`];
  if (passed.length) lines.push(`Passed ${passed.map(p => p.name).join(" and ")}.`);
  if (day.starving) lines.push("Not enough food to go around.");
  for (const d of day.deaths) lines.push(`${d} did not survive the day.`);
  s.journal.push({ day: s.day, title: arrived ? `Arrived: ${arrived.name}` : "On the road", text: lines.join(" ") });

  if (checkGameOver(s)) return true;

  if (arrived?.kind === "goal") {
    s.phase = { kind: "over", result: "win" };
    s.journal.push({ day: s.day, title: "Vermont", text: `${living(s).map(m => m.name).join(", ")} crossed into Vermont after ${s.day} days.` });
    return true;
  }

  if (arrived) {
    const bonus = rng.int(cfg.cityBonus[0], cfg.cityBonus[1]);
    s.money += bonus;
    s.journal.push({ day: s.day, title: "Sympathizers", text: `Locals in ${arrived.name} press $${bonus} into your hands.`, deltas: [{ label: "Money", value: bonus, unit: "$" }] });
    const ev = s.queuedEvent ? null : pickEvent(s, rng, "paradise", arrived.region);
    if (ev) startEvent(s, rng, ev, arrived.name, "town");
    else s.phase = { kind: "town" };
    return true;
  }

  // Road events: a queued chain beat first, then a checkpoint, then a random roll.
  const heading = nextStop(s) ?? currentStop(s);
  const checkpoint = passed[passed.length - 1];
  let ev: GameEvent | undefined;
  if (s.queuedEvent) {
    ev = EVENTS_BY_ID.get(s.queuedEvent);
    s.queuedEvent = null;
    if (ev && !conditionsMet(s, ev.conditions)) ev = undefined;
  }
  if (!ev && checkpoint) ev = pickEvent(s, rng, "road", checkpoint.region, "checkpoint");
  if (!ev && rng.chance(cfg.eventChance)) ev = pickEvent(s, rng, "road", heading.region);

  if (ev) startEvent(s, rng, ev, (checkpoint ?? heading).name, "road");
  else s.phase = { kind: "road" };
  return true;
}

interface DayResult { eaten: number; starving: boolean; deaths: string[] }

/** One day of eating and wear. Used by travel, delays, and resting in town. */
function endOfDay(s: GameState, rng: Rng, resting: boolean): DayResult {
  const cfg = DIFFICULTY[s.difficulty];
  const alive = living(s);
  const need = alive.length * cfg.foodPerPerson * (s.upgrades.includes("pantry") ? RULES.pantryFood : 1);
  let fed = 1;
  let eaten = need;
  if (s.food >= need) {
    s.food = round1(s.food - need);
  } else {
    fed = need > 0 ? s.food / need : 1;
    eaten = s.food;
    s.food = 0;
    s.stats.foodShortDays += 1;
  }
  const starving = fed < 1;

  for (const m of alive) {
    if (resting && !starving) {
      m.health += RULES.restHealth;
      m.morale += RULES.restMorale;
    } else {
      m.health -= rng.int(cfg.healthDrain[0], cfg.healthDrain[1]);
      m.morale -= rng.int(cfg.moraleDrain[0], cfg.moraleDrain[1]);
    }
    if (starving) {
      m.health -= Math.round(RULES.starveHealth * (1 - fed));
      m.morale -= RULES.starveMorale;
    }
    if (m.morale < RULES.lowMorale) m.health -= RULES.lowMoraleHealth;
  }

  // The doctor tends to whoever is worst off.
  if (alive.some(m => m.skill === "medical")) {
    const weakest = [...alive].sort((a, b) => a.health - b.health)[0];
    weakest.health += RULES.doctorHeal;
  }

  for (const m of alive) {
    m.health = clamp(m.health, 0, 100);
    m.morale = clamp(m.morale, 0, 100);
  }
  const deaths = markDeaths(s, starving ? "starvation" : "exhaustion");
  return { eaten: round1(eaten), starving, deaths };
}

function markDeaths(s: GameState, cause: string): string[] {
  const out: string[] = [];
  for (const m of s.party) {
    if (m.alive && m.health <= 0) {
      m.alive = false;
      m.causeOfDeath = cause;
      m.diedOnDay = s.day;
      out.push(m.name);
    }
  }
  return out;
}

function checkGameOver(s: GameState): boolean {
  if (living(s).length > 0) return false;
  const last = [...s.party].sort((a, b) => (b.diedOnDay ?? 0) - (a.diedOnDay ?? 0))[0];
  s.phase = { kind: "over", result: "dead", cause: last?.causeOfDeath };
  s.journal.push({ day: s.day, title: "The End", text: "No one is left to drive." });
  return true;
}

// ------------------------------------------------------------------ events

function conditionsMet(s: GameState, c: EventConditions | undefined): boolean {
  if (!c) return true;
  if (c.minDay !== undefined && s.day < c.minDay) return false;
  if (c.maxDay !== undefined && s.day > c.maxDay) return false;
  if (c.flags && !c.flags.every(f => s.flags.includes(f))) return false;
  if (c.notFlags && c.notFlags.some(f => s.flags.includes(f))) return false;
  if (c.anySkill && !c.anySkill.some(k => hasLivingSkill(s, k))) return false;
  if (c.maxFood !== undefined && s.food > c.maxFood) return false;
  if (c.maxLowestHealth !== undefined) {
    const lowest = Math.min(...living(s).map(m => m.health));
    if (lowest > c.maxLowestHealth) return false;
  }
  return true;
}

function pickEvent(s: GameState, rng: Rng, where: "road" | "paradise", region: Stop["region"], preferTag?: string): GameEvent | undefined {
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
    if (comms && e.tags.includes("danger")) w *= RULES.commsDangerWeight;
    return w;
  });
}

function startEvent(s: GameState, rng: Rng, ev: GameEvent, stopName: string, then: AfterEvent) {
  const member = rng.pick(living(s));
  if (!s.seenEvents.includes(ev.id)) s.seenEvents.push(ev.id);
  s.stats.eventsSeen += 1;
  const event = { eventId: ev.id, title: ev.title, text: "", memberId: member.id, stopName };
  event.text = render(s, ev.text, event);
  s.phase = { kind: "event", event, then };
}

function render(s: GameState, text: string, ctx: { memberId: string; stopName: string }, skilledName?: string): string {
  const member = s.party.find(m => m.id === ctx.memberId);
  const lead = leader(s);
  return text
    .replaceAll("{stop}", ctx.stopName)
    .replaceAll("{leader}", lead?.name ?? "Someone")
    .replaceAll("{member}", member?.name ?? lead?.name ?? "Someone")
    .replaceAll("{skilled}", skilledName ?? lead?.name ?? "Someone");
}

function choose(s: GameState, index: number, rng: Rng): boolean {
  if (s.phase.kind !== "event") return false;
  const pending = s.phase.event;
  const then = s.phase.then;
  const ev = EVENTS_BY_ID.get(pending.eventId);
  const choice = ev?.choices[index];
  if (!ev || !choice) return false;
  const view = choiceView(s, choice, index);
  if (!view.visible || !view.enabled) return false;

  const deltas: Delta[] = [];
  if (choice.cost?.money) { s.money -= choice.cost.money; deltas.push({ label: "Money", value: -choice.cost.money, unit: "$" }); }
  if (choice.cost?.food) { s.food = round1(s.food - choice.cost.food); deltas.push({ label: "Food", value: -choice.cost.food }); }

  let success: boolean | undefined;
  let outcomes: Outcome[] = choice.outcomes ?? [];
  if (choice.check) {
    success = rng.float() * 100 < checkOdds(s, choice.check);
    outcomes = (success ? choice.success : choice.failure) ?? [];
    if (success) s.stats.checksPassed += 1; else s.stats.checksFailed += 1;
  }
  const outcome = outcomes.length ? rng.weighted(outcomes, o => o.weight ?? 1) : { text: "Nothing much happens." };

  const skilled = skilledMember(s, view.skill)?.name;
  const text = render(s, outcome.text, pending, skilled);
  const deaths = applyEffects(s, rng, outcome.effects, pending.memberId, deltas, ev.title);

  for (const f of outcome.setFlags ?? []) if (!s.flags.includes(f)) s.flags.push(f);
  if (outcome.clearFlags) s.flags = s.flags.filter(f => !outcome.clearFlags!.includes(f));
  if (outcome.next) s.queuedEvent = outcome.next;

  s.journal.push({ day: s.day, title: pending.title, text: `${choice.label}. ${text}`, deltas });
  for (const d of deaths) s.journal.push({ day: s.day, title: "Loss", text: `${d} did not make it.` });

  if (checkGameOver(s)) return true;
  s.phase = { kind: "outcome", outcome: { title: pending.title, text, deltas, success, deaths }, then };
  return true;
}

/** Applies an outcome's effects. Negative effects scale with difficulty. Returns names of anyone who died. */
function applyEffects(s: GameState, rng: Rng, e: Effects | undefined, memberId: string, deltas: Delta[], cause: string): string[] {
  if (!e) return [];
  const { harshness, generosity } = DIFFICULTY[s.difficulty];
  const scale = (v: number) => Math.round(v * (v < 0 ? harshness : generosity));
  const deaths: string[] = [];

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
  if (e.healthOne) {
    const target = s.party.find(m => m.id === memberId && m.alive) ?? rng.pick(living(s));
    if (target) {
      target.health = clamp(target.health + scale(e.healthOne), 0, 100);
      deltas.push({ label: `${target.name}'s health`, value: scale(e.healthOne) });
    }
  }
  if (e.morale) {
    for (const m of living(s)) m.morale = clamp(m.morale + scale(e.morale), 0, 100);
    deltas.push({ label: "Morale (everyone)", value: scale(e.morale) });
  }
  deaths.push(...markDeaths(s, cause));

  if (e.delay) {
    for (let i = 0; i < e.delay && living(s).length; i++) {
      s.day += 1;
      deaths.push(...endOfDay(s, rng, false).deaths);
    }
    deltas.push({ label: "Delayed", value: e.delay, unit: "days" });
  }
  return deaths;
}

// ------------------------------------------------------------------ town

function buy(s: GameState, itemId: string): boolean {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return false;
  const price = shopPrice(s, itemId);
  if (s.money < price) return false;
  s.money -= price;
  const e = item.effects;
  if (e.food) s.food = round1(s.food + e.food);
  for (const m of living(s)) {
    if (e.health) m.health = clamp(m.health + e.health, 0, 100);
    if (e.morale) m.morale = clamp(m.morale + e.morale, 0, 100);
  }
  s.journal.push({ day: s.day, title: "Market", text: `Bought ${item.name} for $${price}.` });
  return true;
}

function buyUpgrade(s: GameState, id: string): boolean {
  const up = UPGRADES.find(u => u.id === id);
  if (!up || s.upgrades.includes(id) || s.money < up.price) return false;
  s.money -= up.price;
  s.upgrades.push(id);
  s.journal.push({ day: s.day, title: "Upgrade", text: `Bought ${up.name}: ${up.description}` });
  return true;
}

function rest(s: GameState, rng: Rng): boolean {
  if (s.money < RULES.restCost) return false;
  s.money -= RULES.restCost;
  s.day += 1;
  const r = endOfDay(s, rng, true);
  s.journal.push({ day: s.day, title: "Rest", text: r.starving ? "A day of rest on empty stomachs." : `A day off at a safe house ($${RULES.restCost}). Everyone sleeps in a real bed.` });
  checkGameOver(s);
  return true;
}

// ------------------------------------------------------------------ helpers

/**
 * Copies everything a step can mutate. Stops, legs, journal entries and phase
 * objects are treated as immutable once created, so they're shared, not cloned.
 */
function cloneForStep(s: GameState): GameState {
  return {
    ...s,
    party: s.party.map(m => ({ ...m })),
    upgrades: [...s.upgrades],
    flags: [...s.flags],
    seenEvents: [...s.seenEvents],
    journal: [...s.journal],
    stats: { ...s.stats }
  };
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function round1(v: number) { return Math.round(v * 10) / 10; }
