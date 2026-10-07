import type { ItemId } from "../types";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  /** What one purchase adds. */
  food?: number;
  fuel?: number;
  item?: ItemId;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "rations", name: "Underground Rations", basePrice: 45, food: 20,
    description: "Twenty pounds of groceries from a co-op that requires a 40-step membership process." },
  { id: "gas", name: "Gas (5 gal)", basePrice: 17, fuel: 5,
    description: "Five gallons, pumped by a guy who calls it \"freedom juice\" without irony." },
  { id: "medkit", name: "Bootleg Medkit", basePrice: 55, item: "medkit",
    description: "Use on one person: +25 health and treats an injury." },
  { id: "antibiotics", name: "Antibiotics", basePrice: 40, item: "antibiotics",
    description: "Use on one person: cures sickness, +10 health. Prescription not required, or possible." },
  { id: "parts", name: "Spare Parts", basePrice: 60, item: "parts",
    description: "Use on the van: +35 condition (+55 with a mechanic). 25 lb." },
  { id: "books", name: "Forbidden Books", basePrice: 30, item: "books",
    description: "Use: +15 morale for everyone. A tote bag of contraband literature." }
];

/** Every paradise sells these; the rest are stocked by seeded chance. */
export const ALWAYS_STOCKED = ["rations", "gas"];
export const OPTIONAL_STOCK = ["medkit", "antibiotics", "parts", "books"];
export const OPTIONAL_STOCK_COUNT = 3;
/** Landmark gas stations: a small, overpriced selection. */
export const LANDMARK_STOCK = ["rations", "gas", "parts"];
export const LANDMARK_MARKUP = 1.35;

/** Shop price multiplier range, applied per stop and item. */
export const PRICE_SPREAD = { min: 0.85, max: 1.3 };

export interface ItemUse {
  name: string;
  /** Whether using it needs a target party member. */
  targeted: boolean;
  description: string;
}

export const ITEM_USES: Record<ItemId, ItemUse> = {
  medkit: { name: "Medkit", targeted: true, description: "+25 health, treats injury" },
  antibiotics: { name: "Antibiotics", targeted: true, description: "Cures sickness, +10 health" },
  parts: { name: "Spare parts", targeted: false, description: "Repairs the van" },
  books: { name: "Forbidden books", targeted: false, description: "+15 morale for everyone" }
};

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
    description: "Food lasts longer: the party eats 25% less." },
  { id: "rack", name: "Roof Rack", price: 150,
    description: "+150 lb of cargo space and room for 10 more gallons of gas." }
];
