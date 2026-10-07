import type { CheckDifficulty, Condition, Difficulty, Pace, Rations, Region, Season, Weather } from "./types";

export interface DifficultyConfig {
  label: string;
  startMoney: number;
  startFood: number;
  startFuel: number;
  milesPerDay: number;
  milesJitter: number;
  foodPerPerson: number;
  /** Daily wear per living member, inclusive range. */
  healthDrain: [number, number];
  moraleDrain: [number, number];
  /** Chance of a road event on a day with no checkpoint arrival. */
  eventChance: number;
  /** Added to every skill-check percentage. */
  checkBonus: number;
  /** Cash handed over by sympathizers on arriving at a paradise. */
  cityBonus: [number, number];
  /** Multiplies negative effects from events. */
  harshness: number;
  /** Multiplies positive effects from events. */
  generosity: number;
  /** Score multiplier. */
  scoreMult: number;
}

// Tuned with `npm run sim`; see README for current win rates.
// Authored event numbers are what happens on Normal. harshness/generosity scale
// bad and good outcomes per difficulty and should stay close to 1.0.
export const DIFFICULTY: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy", startMoney: 290, startFood: 50, startFuel: 22, milesPerDay: 135, milesJitter: 20, foodPerPerson: 1.95,
    healthDrain: [1, 4], moraleDrain: [0, 2], eventChance: 0.55, checkBonus: 5, cityBonus: [65, 110],
    harshness: 0.97, generosity: 1.05, scoreMult: 1
  },
  normal: {
    label: "Normal", startMoney: 290, startFood: 50, startFuel: 20, milesPerDay: 130, milesJitter: 22, foodPerPerson: 1.9,
    healthDrain: [1, 4], moraleDrain: [1, 3], eventChance: 0.6, checkBonus: 0, cityBonus: [60, 100],
    harshness: 1, generosity: 1, scoreMult: 1.5
  },
  hard: {
    label: "Hard", startMoney: 285, startFood: 45, startFuel: 18, milesPerDay: 125, milesJitter: 25, foodPerPerson: 2.1,
    healthDrain: [1, 4], moraleDrain: [1, 3], eventChance: 0.65, checkBonus: -5, cityBonus: [55, 95],
    harshness: 1.03, generosity: 0.97, scoreMult: 2.5
  }
};

export const CHECK_BASE: Record<CheckDifficulty, number> = { easy: 70, medium: 50, hard: 30 };
export const SKILLED_BONUS = 30;
export const CHECK_MIN = 5;
export const CHECK_MAX = 95;
/** Skill-check penalty when the member making the check has a condition. */
export const CONDITION_CHECK_PENALTY: Record<Condition, number> = { injured: 20, sick: 15, exhausted: 15 };

export interface PaceConfig { label: string; miles: number; health: number; morale: number; van: number; fuel: number; exhaustChance: number; blurb: string }
export const PACE: Record<Pace, PaceConfig> = {
  steady:   { label: "Steady",   miles: 1.0,  health: 0, morale: 0, van: 1, fuel: 1.0,  exhaustChance: 0,    blurb: "Normal speed. Easy on people and the van." },
  hurried:  { label: "Hurried",  miles: 1.2,  health: 1, morale: 1, van: 2, fuel: 1.1,  exhaustChance: 0.04, blurb: "20% more miles. More wear on everyone." },
  grueling: { label: "Grueling", miles: 1.4,  health: 3, morale: 2, van: 3, fuel: 1.25, exhaustChance: 0.15, blurb: "40% more miles. People get exhausted; the van suffers." }
};

export interface RationsConfig { label: string; food: number; health: number; morale: number; sickChance: number; blurb: string }
export const RATIONS: Record<Rations, RationsConfig> = {
  filling: { label: "Filling", food: 1.0,  health: 0, morale: 0, sickChance: 0,    blurb: "Everyone eats properly." },
  meager:  { label: "Meager",  food: 0.75, health: 1, morale: 1, sickChance: 0,    blurb: "25% less food. Hunger takes a slow toll." },
  bare:    { label: "Bare",    food: 0.5,  health: 3, morale: 3, sickChance: 0.03, blurb: "Half rations. Fast weight loss, and people get sick." }
};

export interface WeatherConfig { label: string; miles: number; health: number; morale: number; van: number; fuel: number }
export const WEATHER: Record<Weather, WeatherConfig> = {
  clear: { label: "Clear", miles: 1.0,  health: 0, morale: 0, van: 0, fuel: 1.0 },
  rain:  { label: "Rain",  miles: 0.85, health: 0, morale: 1, van: 1, fuel: 1.0 },
  storm: { label: "Storm", miles: 0.6,  health: 1, morale: 2, van: 2, fuel: 1.0 },
  heat:  { label: "Heat wave", miles: 0.95, health: 1, morale: 1, van: 1, fuel: 1.1 },
  snow:  { label: "Snow",  miles: 0.55, health: 1, morale: 1, van: 2, fuel: 1.15 },
  fog:   { label: "Fog",   miles: 0.8,  health: 0, morale: 0, van: 0, fuel: 1.0 }
};

/** Weather odds per region and season; "clear" takes the remainder. */
export const WEATHER_ODDS: Record<Region, Record<Season, Partial<Record<Weather, number>>>> = {
  northwest: { spring: { rain: 0.35, fog: 0.1 }, summer: { rain: 0.08, heat: 0.1 }, fall: { rain: 0.35, fog: 0.15 }, winter: { rain: 0.4, snow: 0.1, storm: 0.05 } },
  mountain:  { spring: { rain: 0.15, snow: 0.1, storm: 0.05 }, summer: { heat: 0.15, storm: 0.1 }, fall: { snow: 0.2, rain: 0.1 }, winter: { snow: 0.45, storm: 0.05 } },
  plains:    { spring: { storm: 0.15, rain: 0.15 }, summer: { storm: 0.18, heat: 0.2 }, fall: { rain: 0.1, snow: 0.1 }, winter: { snow: 0.35, storm: 0.05 } },
  midwest:   { spring: { rain: 0.25, storm: 0.1 }, summer: { heat: 0.2, storm: 0.12 }, fall: { rain: 0.15, fog: 0.08 }, winter: { snow: 0.3, storm: 0.05 } },
  south:     { spring: { rain: 0.2, storm: 0.1 }, summer: { heat: 0.35, storm: 0.12 }, fall: { rain: 0.12, fog: 0.08 }, winter: { rain: 0.2, snow: 0.08 } },
  east:      { spring: { rain: 0.25, fog: 0.05 }, summer: { heat: 0.2, storm: 0.1 }, fall: { rain: 0.15, fog: 0.08 }, winter: { snow: 0.3, storm: 0.05 } }
};

export const VAN = {
  mpg: 24,
  tank: 25,
  /** Miles per day when the tank is empty (pushing, hitching, begging gas). */
  dryMiles: 18,
  /** Below this condition the van can break down. */
  breakdownBelow: 30,
  breakdownChance: 0.15,
  /** Speed when the van is wrecked (condition 0). */
  wreckedSpeed: 0.35,
  partsRepair: 35,
  mechanicPartsBonus: 20,
  /** Garage repair at paradise stops, per condition point. */
  garagePerPoint: 1.5
};

export const HEAT = {
  dailyDecay: 1,
  /** Every checkpoint you drive through logs your plates. */
  checkpointPass: 5,
  /** At or above this, checkpoint checks get harder and pursuit events can fire. */
  wanted: 60,
  /** At this level you're arrested on the next travel day. */
  arrest: 100,
  wantedCheckPenalty: 15,
  restCooldown: 20,
  layLowCooldown: 25,
  motelHeat: 10
};

export const CONDITIONS = {
  injuredHealth: 1,
  sickHealth: 3,
  exhaustedMorale: 1,
  /** Daily chance a condition clears on its own (doubled with a doctor alive). */
  recover: { injured: 0.06, sick: 0.08, exhausted: 0.15 } as Record<Condition, number>,
  /** Chance per condition that a rest day clears it. */
  restCure: { injured: 0.35, sick: 0.35, exhausted: 1 } as Record<Condition, number>,
  starvingSickChance: 0.08,
  lowMoraleExhaustChance: 0.08
};

export const RULES = {
  starveHealth: 10,
  starveMorale: 6,
  lowMorale: 25,
  lowMoraleHealth: 2,
  lowHealthAvg: 40,
  lowHealthSpeed: 0.8,
  restHealth: 8,
  restMorale: 10,
  restCost: 30,
  motelCost: 15,
  motelHealth: 5,
  /** Odd jobs at a landmark: a day of work for cash. */
  workPay: [55, 85] as [number, number],
  workHeat: 5,
  doctorHeal: 2,
  mechanicVanSave: 1,
  vehicleMiles: 15,
  commsDangerWeight: 0.6,
  pantryFood: 0.75,
  rackCapacity: 150,
  rackFuel: 10,
  cargoCapacity: 300,
  landmarkActions: 2,
  /** Resistance reputation: max shop discount and city-bonus boost at rep 100. */
  resistanceDiscount: 0.15,
  resistanceBonus: 0.5,
  /** Faction rep adds rep/this to checks that name the faction. */
  repCheckDivisor: 5
};

/** Bounds every event effect must fall within (enforced by the content validator). */
export const EFFECT_BOUNDS = {
  food: [-60, 60],
  money: [-600, 600],
  fuel: [-15, 15],
  van: [-40, 40],
  miles: [-100, 150],
  delay: [0, 3],
  health: [-50, 40],
  healthOne: [-60, 60],
  morale: [-40, 40],
  heat: [-80, 60],
  rep: [-30, 30],
  items: [-2, 3]
} as const;
