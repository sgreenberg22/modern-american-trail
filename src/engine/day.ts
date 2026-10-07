// A day on the road: weather, driving, fuel, wear, food, health, conditions, arrival.
import { CONDITIONS, DIFFICULTY, HEAT, PACE, RATIONS, RULES, VAN, WEATHER, WEATHER_ODDS } from "./config";
import { conditionsMet, pickEvent, startEvent } from "./encounter";
import type { Rng } from "./rng";
import { averageHealth, calendar, currentStop, EVENTS_BY_ID, fuelCapacity, living, nextStop } from "./selectors";
import type { Condition, GameEvent, GameState, Stop, Weather } from "./types";
import { addHeat, checkWipe, clamp, finishAtGoal, log, markDeaths, round1, setFlag } from "./util";

export function rollWeather(s: GameState, rng: Rng): Weather {
  const region = (nextStop(s) ?? currentStop(s)).region;
  const odds = WEATHER_ODDS[region][calendar(s).season];
  let r = rng.float();
  for (const [w, p] of Object.entries(odds) as [Weather, number][]) {
    if ((r -= p) < 0) return w;
  }
  return "clear";
}

export function travel(s: GameState, rng: Rng): boolean {
  const cfg = DIFFICULTY[s.difficulty];
  s.day += 1;
  s.weather = rollWeather(s, rng);

  // Arrested: the day is spent pulled over; the arrest event decides what happens.
  if (s.heat >= HEAT.arrest) {
    const day = endOfDay(s, rng, "road");
    s.lastDay = { day: s.day, miles: 0, foodEaten: day.eaten, fuelUsed: 0, weather: s.weather, starving: day.starving, outOfFuel: false, passed: [], arrived: null, deaths: day.deaths, newConditions: day.newConditions, banter: null, vignette: null };
    if (checkWipe(s)) return true;
    s.stats.arrests += 1;
    startEvent(s, rng, EVENTS_BY_ID.get("arrest")!, (nextStop(s) ?? currentStop(s)).name, "road");
    return true;
  }

  const pace = PACE[s.pace];
  const wx = WEATHER[s.weather];
  let miles = (cfg.milesPerDay + rng.int(-cfg.milesJitter, cfg.milesJitter)) * pace.miles * wx.miles;
  if (s.upgrades.includes("vehicle")) miles += RULES.vehicleMiles;
  if (averageHealth(s) < RULES.lowHealthAvg) miles *= RULES.lowHealthSpeed;
  if (s.van <= 0) miles *= VAN.wreckedSpeed;
  miles = Math.max(1, Math.round(miles));

  // Fuel. If the tank runs dry partway, the rest of the day is pushing and hitching.
  const galPerMile = (pace.fuel * wx.fuel) / VAN.mpg;
  let fuelUsed = round1(miles * galPerMile);
  let outOfFuel = false;
  if (s.fuel < fuelUsed) {
    const drivable = Math.floor(s.fuel / galPerMile);
    miles = drivable + VAN.dryMiles;
    fuelUsed = s.fuel;
    outOfFuel = true;
    s.stats.dryDays += 1;
    setFlag(s, "ran-dry");
  }
  s.fuel = round1(clamp(s.fuel - fuelUsed, 0, fuelCapacity(s)));

  // Drive. Leftover miles carry through checkpoints; you stop for the day at a
  // paradise, a landmark, or the goal.
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
      if (stop.kind === "waypoint") passed.push(stop);
      else { arrived = stop; miles = 0; }
    }
  }
  s.totalMiles += moved;
  if (passed.length) addHeat(s, HEAT.checkpointPass * passed.length);

  // Van wear. A mechanic in the party slows it.
  const mechanic = living(s).some(m => m.skill === "mechanical") ? RULES.mechanicVanSave : 0;
  s.van = clamp(s.van - Math.max(0, pace.van + wx.van + rng.int(0, 1) - mechanic), 0, 100);
  const breakdown = s.van > 0 && s.van < VAN.breakdownBelow && rng.chance(VAN.breakdownChance);

  const day = endOfDay(s, rng, "road");
  s.lastDay = {
    day: s.day, miles: moved, foodEaten: day.eaten, fuelUsed: round1(fuelUsed), weather: s.weather,
    starving: day.starving, outOfFuel, passed: passed.map(p => p.name), arrived: arrived?.name ?? null,
    deaths: day.deaths, newConditions: day.newConditions, banter: null, vignette: null
  };

  const lines = [`Drove ${moved} miles${s.weather !== "clear" ? ` through ${wx.label.toLowerCase()}` : ""}.`];
  if (passed.length) lines.push(`Passed ${passed.map(p => p.name).join(" and ")}.`);
  if (outOfFuel) lines.push("Ran out of gas and finished the day on foot.");
  if (day.starving) lines.push("Not enough food to go around.");
  lines.push(...day.newConditions);
  for (const d of day.deaths) lines.push(`${d} did not survive the day.`);
  log(s, { title: arrived ? `Arrived: ${arrived.name}` : "On the road", text: lines.join(" ") });

  if (checkWipe(s)) return true;

  if (arrived?.kind === "goal") { finishAtGoal(s); return true; }

  if (arrived?.kind === "paradise") {
    const boost = 1 + RULES.resistanceBonus * Math.max(0, s.rep.resistance) / 100;
    const bonus = Math.round(rng.int(cfg.cityBonus[0], cfg.cityBonus[1]) * boost);
    s.money += bonus;
    log(s, { title: "Sympathizers", text: `Locals in ${arrived.name} press $${bonus} into your hands.`, deltas: [{ label: "Money", value: bonus, unit: "$" }] });
    if (arrived.id === "chicago") setFlag(s, "reached-chicago");
    if (arrived.id === "minneapolis") setFlag(s, "reached-twin-cities");
    const ev = pickEvent(s, rng, "paradise", arrived.region);
    if (ev) startEvent(s, rng, ev, arrived.name, "town");
    else s.phase = { kind: "town" };
    return true;
  }

  if (arrived?.kind === "hostile") {
    s.landmarkUsed = [];
    s.phase = { kind: "landmark" };
    return true;
  }

  // Road events: a queued chain beat, then a breakdown, then a checkpoint, then a random roll.
  const heading = nextStop(s) ?? currentStop(s);
  const checkpoint = passed[passed.length - 1];
  let ev: GameEvent | undefined;
  if (s.queuedEvent) {
    const queued = EVENTS_BY_ID.get(s.queuedEvent);
    s.queuedEvent = null;
    if (queued && conditionsMet(s, queued.conditions)) ev = queued;
  }
  if (!ev && outOfFuel) ev = EVENTS_BY_ID.get("on-fumes");
  if (!ev && breakdown) ev = EVENTS_BY_ID.get("breakdown");
  if (!ev && checkpoint) ev = pickEvent(s, rng, "road", checkpoint.region, "checkpoint");
  if (!ev && rng.chance(cfg.eventChance)) ev = pickEvent(s, rng, "road", heading.region);

  if (ev) startEvent(s, rng, ev, (checkpoint ?? heading).name, "road");
  else s.phase = { kind: "road" };
  return true;
}

export interface DayResult { eaten: number; starving: boolean; deaths: string[]; newConditions: string[] }

/**
 * One day of eating, wear, conditions and heat cooling. Used for driving days,
 * delays ("road"), resting in a safe house ("rest"), and motel nights ("motel").
 */
export function endOfDay(s: GameState, rng: Rng, mode: "road" | "rest" | "motel"): DayResult {
  const cfg = DIFFICULTY[s.difficulty];
  const pace = mode === "road" ? PACE[s.pace] : PACE.steady;
  const rations = RATIONS[s.rations];
  const wx = mode === "road" ? WEATHER[s.weather] : WEATHER.clear;
  const alive = living(s);
  const doctor = alive.some(m => m.skill === "medical");

  // Food
  const need = alive.length * cfg.foodPerPerson * rations.food * (s.upgrades.includes("pantry") ? RULES.pantryFood : 1);
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
  const newConditions: string[] = [];
  const give = (m: (typeof alive)[number], c: Condition, why: string) => {
    if (m.conditions.includes(c)) return;
    m.conditions.push(c);
    newConditions.push(`${m.name} is ${c}${why}.`);
  };

  for (const m of alive) {
    if (mode === "rest" && !starving) {
      m.health += RULES.restHealth;
      m.morale += RULES.restMorale;
    } else if (mode === "motel" && !starving) {
      m.health += RULES.motelHealth;
    } else {
      m.health -= rng.int(cfg.healthDrain[0], cfg.healthDrain[1]) + pace.health + rations.health + wx.health;
      m.morale -= rng.int(cfg.moraleDrain[0], cfg.moraleDrain[1]) + pace.morale + rations.morale + wx.morale;
    }
    if (m.conditions.includes("injured")) m.health -= CONDITIONS.injuredHealth;
    if (m.conditions.includes("sick")) m.health -= CONDITIONS.sickHealth;
    if (m.conditions.includes("exhausted")) m.morale -= CONDITIONS.exhaustedMorale;
    if (starving) {
      m.health -= Math.round(RULES.starveHealth * (1 - fed));
      m.morale -= RULES.starveMorale;
    }
    if (m.morale < RULES.lowMorale) m.health -= RULES.lowMoraleHealth;

    // Conditions: recover, or pick new ones up.
    if (mode === "rest" || mode === "motel") {
      m.conditions = m.conditions.filter(c => !(mode === "motel" ? c === "exhausted" : rng.chance(CONDITIONS.restCure[c])));
    } else {
      m.conditions = m.conditions.filter(c => !rng.chance(CONDITIONS.recover[c] * (doctor ? 2 : 1)));
      if (pace.exhaustChance && rng.chance(pace.exhaustChance)) give(m, "exhausted", " from the pace");
      else if (m.morale < RULES.lowMorale && rng.chance(CONDITIONS.lowMoraleExhaustChance)) give(m, "exhausted", "");
      if (starving && rng.chance(CONDITIONS.starvingSickChance)) give(m, "sick", " from hunger");
      else if (rations.sickChance && rng.chance(rations.sickChance)) give(m, "sick", " on short rations");
    }
  }

  // The doctor tends to whoever is worst off.
  if (doctor) {
    const weakest = [...alive].sort((a, b) => a.health - b.health)[0];
    weakest.health += RULES.doctorHeal;
  }

  for (const m of alive) {
    m.health = clamp(m.health, 0, 100);
    m.morale = clamp(m.morale, 0, 100);
  }
  addHeat(s, -HEAT.dailyDecay);

  const deaths = markDeaths(s, id => {
    if (starving) return "starvation";
    const m = s.party.find(p => p.id === id)!;
    return m.conditions.includes("sick") ? "sickness" : m.conditions.includes("injured") ? "injuries" : "the road";
  });
  return { eaten: round1(eaten), starving, deaths, newConditions };
}
