import { describe, expect, it, vi } from "vitest";
import {
  applyAction, cantBuy, checkBreakdown, checkOdds, currentChoices, dailyOptions, deserialize, emptyMeta, EVENTS_BY_ID,
  ITEMS, living, milesToNext, newGame, parseMeta, recordRun, score, sellPrice, serialize, shareText, shopPrice, shopStock,
  STATE_VERSION, type GameState
} from ".";
import { HEAT, VAN } from "./config";
import { validateContent } from "./content";
import { EVENTS } from "./data/events";
import { Rng, hashString } from "./rng";
import { BOTS, playRun } from "../../scripts/bots";

/** Plays a full run with the smart bot, returning every intermediate state. */
function playThrough(seed: string, difficulty: GameState["difficulty"] = "normal"): GameState[] {
  let s = newGame({ seed, difficulty });
  const rng = new Rng(hashString(seed + "bot"));
  const states = [s];
  for (let i = 0; i < 8000 && s.phase.kind !== "over"; i++) {
    s = applyAction(s, BOTS.smart(s, rng));
    states.push(s);
  }
  return states;
}

function deepFreeze<T>(o: T): T {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) deepFreeze(v);
  }
  return o;
}

/** A state on the road with plenty of everything, so tests isolate one mechanic. */
function onRoad(seed = "road", patch: Partial<GameState> = {}): GameState {
  return { ...applyAction(newGame({ seed }), { type: "leaveTown" }), food: 200, fuel: 25, heat: 0, ...patch };
}

/** Index of the first stop of a kind after the start. */
const firstOf = (s: GameState, kind: string) => s.stops.findIndex((st, k) => k > 0 && st.kind === kind);

/** A state parked right before the given stop. */
function justBefore(s: GameState, stopIndex: number): GameState {
  return { ...s, stopIndex: stopIndex - 1, milesIntoLeg: s.legs[stopIndex - 1].miles - 1, queuedEvent: null };
}

const forceEvent = (s: GameState, eventId: string): GameState =>
  ({ ...s, phase: { kind: "event", then: "road", event: { eventId, title: "", text: "", memberId: s.party[0].id, stopName: "" } } });

describe("determinism and purity", () => {
  it("same seed and actions produce identical runs", () => {
    const a = playThrough("same-seed");
    const b = playThrough("same-seed");
    expect(serialize(a[a.length - 1])).toBe(serialize(b[b.length - 1]));
  });

  it("different seeds produce different runs", () => {
    const a = playThrough("seed-a");
    const b = playThrough("seed-b");
    expect(serialize(a[a.length - 1])).not.toBe(serialize(b[b.length - 1]));
  });

  it("never mutates its input", () => {
    let s = deepFreeze(newGame({ seed: "frozen" }));
    const rng = new Rng(1);
    for (let i = 0; i < 600 && s.phase.kind !== "over"; i++) s = deepFreeze(applyAction(s, BOTS.smart(s, rng)));
    expect(s.day).toBeGreaterThan(1);
  });

  it("never calls Math.random", () => {
    const spy = vi.spyOn(Math, "random").mockImplementation(() => { throw new Error("Math.random used"); });
    try {
      playThrough("no-math-random");
    } finally {
      spy.mockRestore();
    }
  });

  it("returns the same object for invalid actions", () => {
    const s = newGame({ seed: "invalid" }); // starts in town
    expect(applyAction(s, { type: "travel" })).toBe(s);
    expect(applyAction(s, { type: "choose", choice: 0 })).toBe(s);
    expect(applyAction(s, { type: "buy", item: "nope" })).toBe(s);
    expect(applyAction(s, { type: "continue" })).toBe(s);
    expect(applyAction(s, { type: "landmark", action: "talk" })).toBe(s);
    expect(applyAction(s, { type: "useItem", item: "medkit", member: "nobody" })).toBe(s);
    expect(applyAction(s, { type: "setPace", pace: s.pace })).toBe(s);
  });
});

describe("travel", () => {
  it("carries leftover miles through checkpoints instead of discarding them", () => {
    const base = onRoad("carry");
    const i = base.stops.findIndex((st, k) => k > 0 && st.kind === "waypoint" && base.stops[k + 1]?.kind === "waypoint");
    const s = { ...base, stopIndex: i - 1, milesIntoLeg: base.legs[i - 1].miles - 5, totalMiles: 0 };
    const after = applyAction(s, { type: "travel" });
    expect(after.stopIndex).toBe(i);
    expect(after.milesIntoLeg).toBe(after.lastDay!.miles - 5);
    expect(after.totalMiles).toBe(after.lastDay!.miles);
  });

  it("arriving at a paradise pays the city bonus and opens the town", () => {
    const base = onRoad("arrive");
    const s = justBefore(base, firstOf(base, "paradise"));
    const after = applyAction(s, { type: "travel" });
    expect(after.money).toBeGreaterThan(s.money);
    expect(after.phase.kind === "town" || (after.phase.kind === "event" && after.phase.then === "town")).toBe(true);
  });

  it("you stop for the day at a hostile landmark", () => {
    const base = onRoad("landmark");
    const i = firstOf(base, "hostile");
    const after = applyAction(justBefore(base, i), { type: "travel" });
    expect(after.stopIndex).toBe(i);
    expect(after.phase.kind).toBe("landmark");
  });

  it("a faster pace covers more ground and burns more gas", () => {
    const base = onRoad("pace", { milesIntoLeg: 0 });
    const steady = applyAction(base, { type: "travel" });
    const hurried = applyAction({ ...base, pace: "hurried" }, { type: "travel" });
    expect(hurried.lastDay!.miles).toBeGreaterThan(steady.lastDay!.miles);
    expect(hurried.lastDay!.fuelUsed).toBeGreaterThan(steady.lastDay!.fuelUsed);
  });

  it("smaller rations eat less food", () => {
    const base = onRoad("rations");
    const filling = applyAction(base, { type: "travel" });
    const bare = applyAction({ ...base, rations: "bare" }, { type: "travel" });
    expect(Math.abs(bare.lastDay!.foodEaten - filling.lastDay!.foodEaten / 2)).toBeLessThanOrEqual(0.1);
  });

  it("an empty tank means walking pace, and the fumes event offers a way out", () => {
    const after = applyAction(onRoad("dry", { fuel: 0, milesIntoLeg: 0 }), { type: "travel" });
    expect(after.lastDay!.outOfFuel).toBe(true);
    expect(after.lastDay!.miles).toBeLessThanOrEqual(VAN.dryMiles);
    expect(after.flags).toContain("ran-dry");
    expect(after.phase.kind === "event" && after.phase.event.eventId).toBe("on-fumes");
  });

  it("a wrecked van crawls; spare parts fix it", () => {
    const base = onRoad("wreck", { milesIntoLeg: 0 });
    const wrecked = applyAction({ ...base, van: 0 }, { type: "travel" });
    const fine = applyAction(base, { type: "travel" });
    expect(wrecked.lastDay!.miles).toBeLessThan(fine.lastDay!.miles * 0.6);
    const fixed = applyAction({ ...base, van: 10, items: { ...base.items, parts: 1 } }, { type: "useItem", item: "parts" });
    expect(fixed.van).toBeGreaterThan(10);
    expect(fixed.items.parts ?? 0).toBe(0);
  });

  it("never writes [object Object] or raw tokens into the journal", () => {
    for (const seed of ["j1", "j2", "j3"]) {
      const states = playThrough(seed);
      const text = states[states.length - 1].journal.map(j => j.title + j.text).join("\n");
      expect(text).not.toContain("[object");
      expect(text).not.toMatch(/\{(stop|leader|member|skilled|survivors|city|days|miles)\}/);
    }
  });
});

describe("conditions and items", () => {
  it("a condition lowers the odds for checks that member makes", () => {
    const base = onRoad("cond");
    const party = base.party.map(m => ({ ...m, skill: "survival" as const }));
    const healthy = checkOdds({ ...base, party }, { skill: "survival", difficulty: "medium" });
    const injured = checkOdds({ ...base, party: party.map(m => ({ ...m, conditions: ["injured" as const] })) }, { skill: "survival", difficulty: "medium" });
    expect(injured).toBeLessThan(healthy);
  });

  it("a medkit heals and treats an injury", () => {
    const base = onRoad("medkit");
    const hurt = { ...base, items: { ...base.items, medkit: 1 }, party: base.party.map((m, k) => (k === 0 ? { ...m, health: 40, conditions: ["injured" as const] } : m)) };
    const after = applyAction(hurt, { type: "useItem", item: "medkit", member: hurt.party[0].id });
    expect(after.party[0].health).toBe(65);
    expect(after.party[0].conditions).not.toContain("injured");
  });

  it("sickness drains health faster than no condition", () => {
    const base = onRoad("sick", { rng: 7 });
    const sick = { ...base, party: base.party.map(m => ({ ...m, conditions: ["sick" as const] })) };
    const a = applyAction(base, { type: "travel" });
    const b = applyAction(sick, { type: "travel" });
    expect(b.party[0].health).toBeLessThan(a.party[0].health);
  });
});

describe("items", () => {
  it("there are at least 60 items, and every tool boosts a skill", () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(60);
    for (const i of ITEMS.filter(i => i.kind === "tool")) expect(i.passive?.bonus).toBeGreaterThan(0);
    expect(new Set(ITEMS.map(i => i.id)).size).toBe(ITEMS.length);
  });

  it("carrying a tool raises the odds, and only the best tool for a skill counts", () => {
    const base = onRoad("tools", { items: {} });
    const check = { skill: "stealth" as const, difficulty: "medium" as const };
    const none = checkOdds(base, check);
    const one = checkBreakdown({ ...base, items: { "fake-plates": 1 } }, check);
    const both = checkBreakdown({ ...base, items: { "fake-plates": 1, lockpicks: 1 } }, check);
    expect(one.total).toBe(Math.min(95, none + 10));
    expect(both.parts.filter(p => p.label === "Lockpick Set" || p.label === "Fake License Plates")).toEqual([{ label: "Lockpick Set", value: 12 }]);
  });

  it("trade goods sell for more where they're wanted", () => {
    const town = { ...newGame({ seed: "sell" }), items: { insulin: 1, "regime-hats": 1 } };
    // In a paradise, hats are wanted (irony) and insulin isn't.
    expect(sellPrice(town, "regime-hats")).toBeGreaterThan(30 * 0.85 * 1.5 - 1);
    expect(sellPrice(town, "insulin")).toBeLessThan(90 * 1.15 * 0.5 + 1);
    const sold = applyAction(town, { type: "sell", item: "insulin" });
    expect(sold.money).toBe(town.money + sellPrice(town, "insulin"));
    expect(sold.items.insulin).toBeUndefined();
  });

  it("using an item applies its effect and removes it", () => {
    const base = onRoad("use", { items: { energy: 1 } });
    const tired = { ...base, party: base.party.map((m, k) => (k === 0 ? { ...m, conditions: ["exhausted" as const] } : m)) };
    const after = applyAction(tired, { type: "useItem", item: "energy", member: tired.party[0].id });
    expect(after.party[0].conditions).not.toContain("exhausted");
    expect(after.items.energy).toBeUndefined();
    expect(applyAction(after, { type: "useItem", item: "energy", member: tired.party[0].id })).toBe(after);
  });

  it("choices that need an item are hidden until you carry it", () => {
    const base = onRoad("needs-item", { items: {} });
    const ev = EVENTS.find(e => e.choices.some(c => c.requires?.item));
    if (!ev) return; // covered once content uses it
    const idx = ev.choices.findIndex(c => c.requires?.item);
    const item = ev.choices[idx].requires!.item!;
    const party = base.party.map(m => ({ ...m, skill: ev.choices[idx].requires?.skill ?? m.skill }));
    expect(currentChoices(forceEvent({ ...base, party }, ev.id))[idx].visible).toBe(false);
    expect(currentChoices(forceEvent({ ...base, party, items: { [item]: 1 } }, ev.id))[idx].visible).toBe(true);
  });
});

describe("heat and jail", () => {
  it("driving through checkpoints raises heat", () => {
    const base = onRoad("cp-heat");
    const i = base.stops.findIndex((st, k) => k > 0 && st.kind === "waypoint");
    const after = applyAction({ ...justBefore(base, i), heat: 20 }, { type: "travel" });
    expect(after.heat).toBeGreaterThan(20 - HEAT.dailyDecay);
  });

  it("hitting the arrest threshold gets you arrested on the next drive", () => {
    const after = applyAction(onRoad("arrest", { heat: HEAT.arrest }), { type: "travel" });
    expect(after.phase.kind === "event" && after.phase.event.eventId).toBe("arrest");
    expect(after.stats.arrests).toBe(1);
    expect(after.lastDay!.miles).toBe(0);
  });

  it("waiting it out always works and is always available", () => {
    const s = forceEvent(onRoad("wait", { money: 0 }), "arrest");
    const views = currentChoices(s);
    const wait = views.find(v => v.label === "Wait it out")!;
    expect(wait.enabled).toBe(true);
    const after = applyAction(s, { type: "choose", choice: wait.index });
    expect(after.phase.kind).toBe("outcome");
    expect(after.heat).toBeLessThan(40);
  });

  it("a failed escape is the only way content ends the run, and it's the detained ending", () => {
    const s = forceEvent(onRoad("escape"), "arrest");
    const escape = currentChoices(s).find(v => v.label === "Escape")!;
    const endings = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const after = applyAction({ ...s, rng: seed }, { type: "choose", choice: escape.index });
      if (after.phase.kind === "over") endings.add(after.phase.ending);
      if (after.flags.includes("jailbreak")) endings.add("escaped");
    }
    expect(endings).toEqual(new Set(["detained", "escaped"]));
  });
});

describe("landmarks", () => {
  function atLandmark(seed: string, patch: Partial<GameState> = {}): GameState {
    const base = onRoad(seed);
    return { ...applyAction(justBefore(base, firstOf(base, "hostile")), { type: "travel" }), ...patch };
  }

  it("allows two actions per visit, each once", () => {
    let s = atLandmark("lm-actions", { money: 500 });
    s = applyAction(applyAction(s, { type: "landmark", action: "work" }), { type: "continue" });
    expect(applyAction(s, { type: "landmark", action: "work" })).toBe(s);
    s = applyAction(applyAction(s, { type: "landmark", action: "layLow" }), { type: "continue" });
    expect(applyAction(s, { type: "landmark", action: "talk" })).toBe(s);
    expect(s.phase.kind).toBe("landmark");
  });

  it("odd jobs pay and take a day; laying low cools heat", () => {
    const s = atLandmark("lm-work", { heat: 50 });
    const worked = applyAction(s, { type: "landmark", action: "work" });
    expect(worked.money).toBeGreaterThan(s.money);
    expect(worked.day).toBe(s.day + 1);
    const low = applyAction(s, { type: "landmark", action: "layLow" });
    expect(low.heat).toBeLessThan(s.heat - 20);
  });

  it("sells a small, marked-up selection", () => {
    const s = atLandmark("lm-shop", { money: 1000 });
    expect(shopStock(s).slice(0, 3)).toEqual(["rations", "gas", "parts"]);
    expect(shopStock(s).length).toBe(6);
    expect(cantBuy(s, "medkit")).toBe("Not sold here");
    const town = newGame({ seed: "lm-shop" });
    expect(shopPrice(s, "gas")).toBeGreaterThan(shopPrice(town, "gas") * 0.9);
  });
});

describe("events", () => {
  it("event effects can't move you past the next stop", () => {
    const s = onRoad("miles", { milesIntoLeg: 0 });
    const leg = s.legs[s.stopIndex];
    for (let seed = 0; seed < 50; seed++) {
      const after = applyAction({ ...forceEvent(s, "wildfire"), rng: seed }, { type: "choose", choice: 1 });
      expect(after.stopIndex).toBe(s.stopIndex);
      expect(after.milesIntoLeg).toBeLessThan(leg.miles);
    }
  });

  it("hides skill-gated choices when no living member has the skill", () => {
    const base = onRoad("gated");
    const noHacker = forceEvent({ ...base, party: base.party.map(m => ({ ...m, skill: "survival" as const })) }, "drone");
    expect(currentChoices(noHacker)[0].visible).toBe(false);
    expect(applyAction(noHacker, { type: "choose", choice: 0 })).toBe(noHacker);
    const hacker = { ...noHacker, party: noHacker.party.map((m, k) => (k === 0 ? { ...m, skill: "hacking" as const } : m)) };
    expect(currentChoices(hacker)[0].visible).toBe(true);
  });

  it("item costs disable a choice until you have the item", () => {
    const base = onRoad("parts-cost");
    const s = forceEvent({ ...base, items: { ...base.items, parts: 0 } }, "breakdown");
    const install = currentChoices(s).find(v => v.label === "Install spare parts")!;
    expect(install.enabled).toBe(false);
    const withParts = { ...s, items: { ...s.items, parts: 1 } };
    expect(currentChoices(withParts).find(v => v.label === "Install spare parts")!.enabled).toBe(true);
  });

  it("every choice of every event resolves without error", () => {
    const base = onRoad("all-events", { food: 40, money: 1000, flags: ["envelope"], items: { medkit: 2, antibiotics: 2, parts: 2, books: 2 } });
    for (const ev of EVENTS) {
      ev.choices.forEach((c, i) => {
        const party = base.party.map(m => ({ ...m, skill: c.requires?.skill ?? m.skill }));
        const items = { ...base.items, ...(c.requires?.item ? { [c.requires.item]: 1 } : {}), ...(c.cost?.items ?? {}), ...(ev.conditions?.item ? { [ev.conditions.item]: 1 } : {}) } as Record<string, number>;
        for (let seed = 0; seed < 20; seed++) {
          const s = { ...forceEvent({ ...base, party, items }, ev.id), rng: seed };
          const after = applyAction(s, { type: "choose", choice: i });
          expect(after, `${ev.id} choice ${i}`).not.toBe(s);
          expect(["outcome", "over"]).toContain(after.phase.kind);
        }
      });
    }
  });

  it("no run is won except by reaching Vermont with someone alive", () => {
    for (const seed of ["e1", "e2", "e3", "e4"]) {
      const states = playThrough(seed);
      const last = states[states.length - 1];
      if (last.phase.kind === "over" && ["full-house", "vermont", "lone-survivor"].includes(last.phase.ending)) {
        expect(last.stops[last.stopIndex].kind).toBe("goal");
        expect(living(last).length).toBeGreaterThan(0);
      }
    }
  });
});

describe("endings and score", () => {
  function atGoal(seed: string, alive: number): GameState {
    const s = onRoad(seed);
    const last = s.legs.length - 1;
    return { ...s, stopIndex: last, milesIntoLeg: s.legs[last].miles - 1, party: s.party.map((m, k) => (k < alive ? m : { ...m, alive: false, health: 0 })) };
  }

  it("losing members isn't game over while anyone survives", () => {
    const s = onRoad("survivor");
    const one = { ...s, party: s.party.map((m, k) => (k === 0 ? m : { ...m, alive: false, health: 0 })) };
    expect(applyAction(one, { type: "travel" }).phase.kind).not.toBe("over");
  });

  it("the win ending depends on who made it", () => {
    const end = (n: number) => { const p = applyAction(atGoal(`goal-${n}`, n), { type: "travel" }).phase; return p.kind === "over" ? p.ending : null; };
    expect(end(3)).toBe("full-house");
    expect(end(2)).toBe("vermont");
    expect(end(1)).toBe("lone-survivor");
  });

  it("starving everyone ends in the starved ending", () => {
    const s = onRoad("wipe", { food: 0, party: onRoad("wipe").party.map(m => ({ ...m, health: 1 })) });
    const p = applyAction(s, { type: "travel" }).phase;
    expect(p.kind === "over" && p.ending).toBe("starved");
  });

  it("you can settle down in a paradise, but not in Portland", () => {
    expect(applyAction(newGame({ seed: "settle" }), { type: "settle" }).phase.kind).toBe("town");
    const base = onRoad("settle");
    const town = applyAction(justBefore(base, firstOf(base, "paradise")), { type: "travel" });
    const inTown = town.phase.kind === "town" ? town : { ...town, phase: { kind: "town" as const } };
    const p = applyAction(inTown, { type: "settle" }).phase;
    expect(p.kind === "over" && p.ending).toBe("settled");
  });

  it("wins outscore losses, and harder difficulties score more", () => {
    const win = applyAction(atGoal("score", 3), { type: "travel" });
    const hardWin = applyAction({ ...atGoal("score", 3), difficulty: "hard" as const }, { type: "travel" });
    const loss = applyAction(onRoad("score-loss", { food: 0, party: onRoad("x").party.map(m => ({ ...m, health: 1 })) }), { type: "travel" });
    expect(score(win).total).toBeGreaterThan(score(loss).total);
    expect(score(hardWin).total).toBeGreaterThan(score(win).total);
  });
});

describe("town", () => {
  it("charges exactly the price shown, and the price is stable", () => {
    const s = newGame({ seed: "prices" });
    const shown = shopPrice(s, "rations");
    const after = applyAction(s, { type: "buy", item: "rations" });
    expect(s.money - after.money).toBe(shown);
    expect(shopPrice(after, "rations")).toBe(shown);
  });

  it("each paradise has its own stable stock, always with food and gas", () => {
    const s = newGame({ seed: "stock" });
    expect(shopStock(s)).toEqual(shopStock(newGame({ seed: "stock" })));
    expect(shopStock(s)).toEqual(expect.arrayContaining(["rations", "gas"]));
    expect(shopStock(s)).toEqual(expect.arrayContaining(["medkit", "parts"]));
    expect(shopStock(s).length).toBe(10);
  });

  it("won't overfill the tank", () => {
    const s = { ...newGame({ seed: "tank" }), fuel: 24, money: 1000 };
    expect(cantBuy(s, "gas")).toBe("Tank is full");
  });

  it("upgrades work as described", () => {
    const base = onRoad("upgrades", { milesIntoLeg: 0 });
    expect(applyAction({ ...base, upgrades: ["pantry"] }, { type: "travel" }).lastDay!.foodEaten).toBeLessThan(applyAction(base, { type: "travel" }).lastDay!.foodEaten);
    expect(applyAction({ ...base, upgrades: ["vehicle"] }, { type: "travel" }).lastDay!.miles).toBeGreaterThan(applyAction(base, { type: "travel" }).lastDay!.miles);
  });

  it("the garage repairs the van for the quoted price", () => {
    const s = { ...newGame({ seed: "garage" }), van: 40, money: 500 };
    const after = applyAction(s, { type: "repair" });
    expect(after.van).toBe(100);
    expect(s.money - after.money).toBe(Math.ceil(60 * VAN.garagePerPoint));
  });
});

describe("saves", () => {
  it("round-trips game state exactly", () => {
    const states = playThrough("save-rt");
    const mid = states[Math.floor(states.length / 2)];
    const r = deserialize(serialize(mid));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.state).toEqual(mid);
  });

  it("a loaded save continues identically to the original", () => {
    const states = playThrough("save-cont");
    const mid = states.find((s, k) => k > 20 && s.phase.kind === "road")!;
    const r = deserialize(serialize(mid));
    if (!r.ok) throw new Error(r.error);
    expect(applyAction(r.state, { type: "travel" })).toEqual(applyAction(mid, { type: "travel" }));
  });

  it("migrates a Phase 1 (v3) save", () => {
    const v4 = newGame({ seed: "migrate" });
    const { daily, startMonth, weather, pace, rations, fuel, van, items, heat, rep, landmarkUsed, ...rest } = v4;
    void daily; void startMonth; void weather; void pace; void rations; void fuel; void van; void items; void heat; void rep; void landmarkUsed;
    const v3 = { ...rest, version: 3, party: v4.party.map(({ conditions, ...m }) => { void conditions; return m; }), stats: { eventsSeen: 0, checksPassed: 0, checksFailed: 0, foodShortDays: 0 } };
    const r = deserialize(JSON.stringify({ format: "modern-american-trail", version: 3, state: v3 }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.state.version).toBe(STATE_VERSION);
      expect(r.state.fuel).toBeGreaterThan(0);
      expect(r.state.party.every(m => Array.isArray(m.conditions))).toBe(true);
    }
  });

  it("migrates a Phase 2 (v4) save, dropping empty item slots", () => {
    const v5 = newGame({ seed: "migrate-v4" });
    const { seenBanter, seenVignettes, ...rest } = v5;
    void seenBanter; void seenVignettes;
    const v4 = { ...rest, version: 4, items: { medkit: 1, antibiotics: 0, parts: 0, books: 0 } };
    const r = deserialize(JSON.stringify({ format: "modern-american-trail", version: 4, state: v4 }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.state.items).toEqual({ medkit: 1 });
      expect(r.state.seenBanter).toEqual([]);
    }
  });

  it("rejects the pre-rebuild save format with a clear message", () => {
    const r = deserialize(JSON.stringify({ locations: [], health: 50, isLoading: true, _meta: { version: 2 } }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/old version/);
  });

  it("rejects garbage, tampering and impossible values", () => {
    expect(deserialize("not json").ok).toBe(false);
    expect(deserialize("{}").ok).toBe(false);
    const s = newGame({ seed: "tamper" });
    const tampered = JSON.parse(serialize(s));
    tampered.state.party[0].health = 500;
    expect(deserialize(JSON.stringify(tampered)).ok).toBe(false);
    const badEvent = JSON.parse(serialize(s));
    badEvent.state.phase = { kind: "event", then: "road", event: { eventId: "deleted", title: "", text: "", memberId: "x", stopName: "" } };
    expect(deserialize(JSON.stringify(badEvent)).ok).toBe(false);
  });

  it("contains game state only, never UI flags", () => {
    const keys = Object.keys(JSON.parse(serialize(newGame({ seed: "ui" }))).state);
    for (const k of ["isLoading", "showShop", "showMap", "showSettings", "lastOutcome", "selectedModel"]) expect(keys).not.toContain(k);
  });
});

describe("meta: unlocks and Daily Run", () => {
  it("records runs and unlocks things once", () => {
    const states = playThrough("meta-run", "easy");
    const final = states[states.length - 1];
    const first = recordRun(emptyMeta(), final);
    expect(first.meta.runs).toBe(1);
    const second = recordRun(first.meta, final);
    expect(second.newUnlocks).toEqual([]);
    expect(new Set(second.meta.unlocks).size).toBe(second.meta.unlocks.length);
  });

  it("winning unlocks the Nurse", () => {
    for (let i = 0; i < 30; i++) {
      const states = playThrough(`win-${i}`, "easy");
      const final = states[states.length - 1];
      if (final.phase.kind === "over" && ["full-house", "vermont", "lone-survivor"].includes(final.phase.ending)) {
        expect(recordRun(emptyMeta(), final).meta.unlocks).toContain("first-win");
        return;
      }
    }
    throw new Error("no winning run found in 30 easy seeds");
  });

  it("the Daily Run is identical for everyone on a date and different across dates", () => {
    expect(dailyOptions("2026-10-07")).toEqual(dailyOptions("2026-10-07"));
    expect(dailyOptions("2026-10-07").seed).not.toBe(dailyOptions("2026-10-08").seed);
    const a = newGame(dailyOptions("2026-10-07"));
    expect(a.daily).toBe("2026-10-07");
    expect(serialize(a)).toBe(serialize(newGame(dailyOptions("2026-10-07"))));
  });

  it("the share string is short and spoiler-free", () => {
    const states = playThrough("share");
    const text = shareText(states[states.length - 1]);
    expect(text.split("\n").length).toBe(4);
    expect(text).toMatch(/Score \d/);
    // No event titles leak (compared as whole lines/phrases; ending titles are allowed).
    const lines = text.split("\n").flatMap(l => l.split(" · ")).map(l => l.trim());
    for (const e of EVENTS) expect(lines).not.toContain(e.title);
  });

  it("corrupt meta falls back to a fresh record", () => {
    expect(parseMeta("{nope")).toEqual(emptyMeta());
    expect(parseMeta(JSON.stringify({ version: 1, unlocks: "all" }))).toEqual(emptyMeta());
  });
});

describe("content", () => {
  it("passes the validator", () => {
    expect(validateContent().errors).toEqual([]);
  });

  it("the validator rejects content that tries to win the game", () => {
    const cheat = [...EVENTS, { id: "cheat", title: "Cheat", where: "road" as const, tags: [], text: "x", choices: [{ label: "Win", outcomes: [{ text: "You win", ending: "full-house" as const }] }] }];
    expect(validateContent(cheat).errors.join("\n")).toMatch(/may not trigger ending "full-house"/);
  });

  it("every event referenced by a chain exists", () => {
    for (const e of EVENTS) for (const c of e.choices) for (const o of [...(c.outcomes ?? []), ...(c.success ?? []), ...(c.failure ?? [])]) {
      if (o.next) expect(EVENTS_BY_ID.has(o.next)).toBe(true);
    }
  });
});

describe("simulation smoke test", () => {
  it("bots finish runs without invalid moves on every difficulty", () => {
    for (const difficulty of ["easy", "normal", "hard"] as const) {
      for (let i = 0; i < 40; i++) {
        for (const bot of ["smart", "casual", "random"] as const) {
          const r = playRun(newGame({ seed: `smoke-${difficulty}-${i}`, difficulty }), BOTS[bot], i);
          expect(r.days).toBeGreaterThan(1);
        }
      }
    }
  });

  it("milesToNext never goes negative across a run", () => {
    for (const s of playThrough("miles-check")) expect(milesToNext(s)).toBeGreaterThanOrEqual(0);
  });
});
