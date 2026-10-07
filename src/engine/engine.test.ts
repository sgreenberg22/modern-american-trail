import { describe, expect, it, vi } from "vitest";
import {
  applyAction, currentChoices, deserialize, living, milesToNext, newGame, serialize, shopPrice,
  EVENTS_BY_ID, type GameState
} from ".";
import { validateContent } from "./content";
import { EVENTS } from "./data/events";
import { Rng, hashString } from "./rng";
import { BOTS, playRun } from "../../scripts/bots";

/** Plays a full run with the smart bot, returning every intermediate state. */
function playThrough(seed: string, difficulty: GameState["difficulty"] = "normal"): GameState[] {
  let s = newGame({ seed, difficulty });
  const rng = new Rng(hashString(seed + "bot"));
  const states = [s];
  for (let i = 0; i < 5000 && s.phase.kind !== "over"; i++) {
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

/** A state on the road, partway along leg `leg`. */
function onRoad(seed = "road", patch: Partial<GameState> = {}): GameState {
  return { ...applyAction(newGame({ seed }), { type: "leaveTown" }), ...patch };
}

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
    for (let i = 0; i < 400 && s.phase.kind !== "over"; i++) s = deepFreeze(applyAction(s, BOTS.smart(s, rng)));
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
  });
});

describe("travel", () => {
  it("carries leftover miles through checkpoints instead of discarding them", () => {
    let s = onRoad("carry");
    // Find a checkpoint leg followed by another non-town stop, and park just before it.
    const i = s.stops.findIndex((st, k) => k > 0 && st.kind === "waypoint" && s.stops[k + 1]?.kind !== "paradise");
    s = { ...s, stopIndex: i - 1, milesIntoLeg: s.legs[i - 1].miles - 5, totalMiles: 0, queuedEvent: null };
    const after = applyAction(s, { type: "travel" });
    expect(after.stopIndex).toBe(i);
    expect(after.milesIntoLeg).toBe(after.lastDay!.miles - 5);
    expect(after.totalMiles).toBe(after.lastDay!.miles);
  });

  it("arriving at a paradise by driving pays the city bonus and opens the town", () => {
    let s = onRoad("arrive");
    const i = s.stops.findIndex((st, k) => k > 0 && st.kind === "paradise");
    s = { ...s, stopIndex: i - 1, milesIntoLeg: s.legs[i - 1].miles - 1 };
    const after = applyAction(s, { type: "travel" });
    expect(after.stopIndex).toBe(i);
    expect(after.money).toBeGreaterThan(s.money);
    expect(after.lastDay!.arrived).toBe(s.stops[i].name);
    // Either straight into town or an arrival event that returns to town.
    expect(after.phase.kind === "town" || (after.phase.kind === "event" && after.phase.then === "town")).toBe(true);
  });

  it("never writes [object Object] into the journal", () => {
    for (const seed of ["j1", "j2", "j3"]) {
      const states = playThrough(seed);
      const text = states[states.length - 1].journal.map(j => j.title + j.text).join("\n");
      expect(text).not.toContain("[object");
      expect(text).not.toMatch(/\{(stop|leader|member|skilled)\}/);
    }
  });
});

describe("events", () => {
  it("event effects can't move you past the next stop", () => {
    const s = onRoad("miles", { milesIntoLeg: 0 });
    const leg = s.legs[s.stopIndex];
    const forced: GameState = {
      ...s,
      phase: { kind: "event", then: "road", event: { eventId: "wildfire", title: "", text: "", memberId: s.party[0].id, stopName: "" } }
    };
    for (let seed = 0; seed < 50; seed++) {
      const after = applyAction({ ...forced, rng: seed }, { type: "choose", choice: 1 });
      expect(after.stopIndex).toBe(s.stopIndex);
      expect(after.milesIntoLeg).toBeLessThan(leg.miles);
    }
  });

  it("hides skill-gated choices when no living member has the skill", () => {
    const base = onRoad("gated");
    const withoutHacker: GameState = {
      ...base,
      party: base.party.map(m => ({ ...m, skill: "survival" as const })),
      phase: { kind: "event", then: "road", event: { eventId: "drone", title: "", text: "", memberId: base.party[0].id, stopName: "" } }
    };
    const views = currentChoices(withoutHacker);
    expect(views[0].visible).toBe(false);
    expect(applyAction(withoutHacker, { type: "choose", choice: 0 })).toBe(withoutHacker);

    const withHacker: GameState = { ...withoutHacker, party: withoutHacker.party.map((m, k) => (k === 0 ? { ...m, skill: "hacking" as const } : m)) };
    expect(currentChoices(withHacker)[0].visible).toBe(true);
  });

  it("shows higher odds when the party has the skill", () => {
    const base = onRoad("odds");
    const ev: GameState["phase"] = { kind: "event", then: "road", event: { eventId: "wildfire", title: "", text: "", memberId: base.party[0].id, stopName: "" } };
    const skilled = { ...base, phase: ev, party: base.party.map(m => ({ ...m, skill: "survival" as const })) };
    const unskilled = { ...base, phase: ev, party: base.party.map(m => ({ ...m, skill: "hacking" as const })) };
    expect(currentChoices(skilled)[1].odds!).toBeGreaterThan(currentChoices(unskilled)[1].odds!);
  });

  it("every choice of every event resolves without error", () => {
    const base = onRoad("all-events", { food: 40, money: 1000, flags: ["envelope"] });
    for (const ev of EVENTS) {
      const s: GameState = { ...base, phase: { kind: "event", then: "road", event: { eventId: ev.id, title: ev.title, text: ev.text, memberId: base.party[0].id, stopName: "Somewhere" } } };
      ev.choices.forEach((_, i) => {
        const party = base.party.map(m => ({ ...m, skill: (ev.choices[i].requires?.skill ?? m.skill) }));
        for (let seed = 0; seed < 20; seed++) {
          const after = applyAction({ ...s, party, rng: seed }, { type: "choose", choice: i });
          expect(after, `${ev.id} choice ${i}`).not.toBe(s);
          expect(["outcome", "over"]).toContain(after.phase.kind);
        }
      });
    }
  });

  it("only the defined endings exist: content can't instantly win", () => {
    for (const seed of ["e1", "e2", "e3", "e4"]) {
      const states = playThrough(seed);
      for (let k = 1; k < states.length; k++) {
        const s = states[k];
        if (s.phase.kind === "over" && s.phase.result === "win") {
          expect(s.stops[s.stopIndex].kind).toBe("goal");
          expect(living(s).length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("party and endings", () => {
  it("losing members isn't game over while anyone survives", () => {
    const s = onRoad("survivor");
    const one: GameState = { ...s, party: s.party.map((m, k) => (k === 0 ? m : { ...m, alive: false, health: 0 })) };
    const after = applyAction(one, { type: "travel" });
    expect(after.phase.kind).not.toBe("over");
  });

  it("you can win with a single survivor", () => {
    const s = onRoad("lone-winner");
    const last = s.legs.length - 1;
    const lone: GameState = {
      ...s,
      stopIndex: last,
      milesIntoLeg: s.legs[last].miles - 1,
      party: s.party.map((m, k) => (k === 0 ? m : { ...m, alive: false, health: 0 })),
      food: 100
    };
    const after = applyAction(lone, { type: "travel" });
    expect(after.phase).toEqual({ kind: "over", result: "win" });
  });

  it("game over when everyone is gone, with a cause", () => {
    const s = onRoad("wipe");
    const dying: GameState = { ...s, food: 0, party: s.party.map(m => ({ ...m, health: 1 })) };
    const after = applyAction(dying, { type: "travel" });
    expect(after.phase.kind).toBe("over");
    if (after.phase.kind === "over") {
      expect(after.phase.result).toBe("dead");
      expect(after.phase.cause).toBe("starvation");
    }
  });
});

describe("town", () => {
  it("charges exactly the price shown, and the price is stable", () => {
    const s = newGame({ seed: "prices" });
    const shown = shopPrice(s, "rations");
    expect(shopPrice(s, "rations")).toBe(shown);
    const after = applyAction(s, { type: "buy", item: "rations" });
    expect(s.money - after.money).toBe(shown);
    expect(shopPrice(after, "rations")).toBe(shown);
  });

  it("upgrades can each be bought once, and more than one can be bought", () => {
    let s = { ...newGame({ seed: "upgrades" }), money: 5000 };
    s = applyAction(s, { type: "buyUpgrade", upgrade: "pantry" });
    s = applyAction(s, { type: "buyUpgrade", upgrade: "vehicle" });
    expect(s.upgrades).toEqual(["pantry", "vehicle"]);
    expect(applyAction(s, { type: "buyUpgrade", upgrade: "pantry" })).toBe(s);
  });

  it("the pantry upgrade really reduces food eaten", () => {
    const base = onRoad("pantry", { food: 100 });
    const plain = applyAction(base, { type: "travel" });
    const pantry = applyAction({ ...base, upgrades: ["pantry"] }, { type: "travel" });
    expect(pantry.lastDay!.foodEaten).toBeLessThan(plain.lastDay!.foodEaten);
  });

  it("the van upgrade really adds miles", () => {
    const base = onRoad("van", { food: 100, milesIntoLeg: 0 });
    const plain = applyAction(base, { type: "travel" });
    const van = applyAction({ ...base, upgrades: ["vehicle"] }, { type: "travel" });
    expect(van.lastDay!.miles).toBeGreaterThan(plain.lastDay!.miles);
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
    const mid = states[20];
    const r = deserialize(serialize(mid));
    if (!r.ok) throw new Error(r.error);
    expect(applyAction(r.state, { type: "travel" })).toEqual(applyAction(mid, { type: "travel" }));
  });

  it("rejects the pre-rebuild save format with a clear message", () => {
    const legacy = JSON.stringify({ locations: [], health: 50, isLoading: true, _meta: { version: 2 } });
    const r = deserialize(legacy);
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

describe("content", () => {
  it("passes the validator", () => {
    expect(validateContent().errors).toEqual([]);
  });

  it("every event id referenced by a chain exists", () => {
    for (const e of EVENTS) for (const c of e.choices) for (const o of [...(c.outcomes ?? []), ...(c.success ?? []), ...(c.failure ?? [])]) {
      if (o.next) expect(EVENTS_BY_ID.has(o.next)).toBe(true);
    }
  });
});

describe("simulation smoke test", () => {
  it("bots finish runs without invalid moves on every difficulty", () => {
    for (const difficulty of ["easy", "normal", "hard"] as const) {
      for (let i = 0; i < 60; i++) {
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
