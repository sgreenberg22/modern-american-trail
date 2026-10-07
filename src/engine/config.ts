import type { CheckDifficulty, Difficulty } from "./types";

export interface DifficultyConfig {
  label: string;
  startMoney: number;
  startFood: number;
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
}

// Tuned with `npm run sim`; see README for current win rates.
// harshness/generosity are well away from 1.0 because the starter events were
// written generously. The Phase 3 content pass recalibrates authored numbers so
// these can move back toward 1.0 without changing the win rates.
export const DIFFICULTY: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy", startMoney: 140, startFood: 50, milesPerDay: 115, milesJitter: 20, foodPerPerson: 2.5,
    healthDrain: [0, 2], moraleDrain: [0, 2], eventChance: 0.55, checkBonus: 5, cityBonus: [25, 55],
    harshness: 2.2, generosity: 0.46
  },
  normal: {
    label: "Normal", startMoney: 120, startFood: 50, milesPerDay: 110, milesJitter: 22, foodPerPerson: 2.25,
    healthDrain: [0, 2], moraleDrain: [0, 3], eventChance: 0.6, checkBonus: 0, cityBonus: [20, 50],
    harshness: 2.32, generosity: 0.45
  },
  hard: {
    label: "Hard", startMoney: 110, startFood: 45, milesPerDay: 105, milesJitter: 25, foodPerPerson: 2.45,
    healthDrain: [0, 2], moraleDrain: [0, 3], eventChance: 0.65, checkBonus: -5, cityBonus: [15, 45],
    harshness: 2.42, generosity: 0.45
  }
};

export const CHECK_BASE: Record<CheckDifficulty, number> = { easy: 70, medium: 50, hard: 30 };
export const SKILLED_BONUS = 30;
export const CHECK_MIN = 5;
export const CHECK_MAX = 95;

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
  doctorHeal: 2,
  vehicleMiles: 15,
  commsDangerWeight: 0.6,
  pantryFood: 0.75
};

/** Bounds every event effect must fall within (enforced by the content validator). */
export const EFFECT_BOUNDS = {
  food: [-60, 60],
  money: [-600, 600],
  miles: [-100, 150],
  delay: [0, 3],
  health: [-40, 40],
  healthOne: [-60, 60],
  morale: [-40, 40]
} as const;
