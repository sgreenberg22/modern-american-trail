import type { Effects } from "../types";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  effects: Effects;
}

/** Sold at paradise stops. Prices vary per stop but are stable for the run. */
export const SHOP_ITEMS: ShopItem[] = [
  { id: "rations", name: "Underground Rations", basePrice: 45, effects: { food: 20 },
    description: "Twenty pounds of groceries from a co-op that requires a 40-step membership process." },
  { id: "medkit", name: "Bootleg Medicine", basePrice: 70, effects: { health: 15 },
    description: "Banned-in-the-hellhole healthcare. +15 health for everyone." },
  { id: "books", name: "Forbidden Books", basePrice: 35, effects: { morale: 15 },
    description: "A tote bag of contraband literature. +15 morale for everyone." },
  { id: "kit", name: "Prepper's Survival Kit", basePrice: 120, effects: { food: 30, health: 8 },
    description: "Thirty pounds of food plus a first-aid pouch with a laminated pamphlet." }
];

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  price: number;
}

/** One-time purchases. Each description states exactly what the engine does. */
export const UPGRADES: Upgrade[] = [
  { id: "vehicle", name: "Reinforced Van", price: 450,
    description: "+15 miles per day." },
  { id: "comms", name: "Encrypted Comms", price: 350,
    description: "Hear about danger early: dangerous road events are 40% less likely." },
  { id: "pantry", name: "Prepper-Grade Pantry", price: 300,
    description: "Food lasts longer: the party eats 25% less." }
];

/** Shop price multiplier range, applied per stop and item. */
export const PRICE_SPREAD = { min: 0.85, max: 1.3 };
