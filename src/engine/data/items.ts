import type { Condition, Skill, StopKind } from "../types";

// ------------------------------------------------------------------ inventory items

export type ItemKind = "supply" | "tool" | "trade" | "curio";

export interface ItemUseDef {
  /** Asks which party member it's for. Otherwise it applies to everyone (or the van). */
  targeted?: boolean;
  health?: number;
  morale?: number;
  cure?: Condition;
  food?: number;
  fuel?: number;
  van?: number;
  /** Extra van repair when a living member has the mechanical skill. */
  vanMechanic?: number;
  heat?: number;
  text: string;
}

export interface ItemDef {
  id: string;
  name: string;
  kind: ItemKind;
  /** Pounds per unit. */
  weight: number;
  description: string;
  /** Base shop price. Items without one are only found, never sold in shops. */
  price?: number;
  /** Where shops may stock it (default: paradises). */
  stockedAt?: StopKind[];
  /** Base resale value. */
  sell: number;
  /** Sells for 1.5x at this kind of stop and 0.5x elsewhere. */
  wantedAt?: "paradise" | "hostile";
  use?: ItemUseDef;
  /** Tools: a standing bonus to checks with this skill while you carry it. */
  passive?: { skill: Skill; bonus: number };
}

const P: StopKind[] = ["paradise"];
const L: StopKind[] = ["hostile"];
const PL: StopKind[] = ["paradise", "hostile"];

export const ITEMS: ItemDef[] = [
  // ------------------------------------------------ supplies
  { id: "medkit", name: "Bootleg Medkit", kind: "supply", weight: 5, price: 55, sell: 25, stockedAt: P,
    description: "+25 health and treats an injury.", use: { targeted: true, health: 25, cure: "injured", text: "{target} gets patched up." } },
  { id: "antibiotics", name: "Antibiotics", kind: "supply", weight: 1, price: 40, sell: 20, stockedAt: P,
    description: "Cures sickness, +10 health. Prescription not required, or possible.", use: { targeted: true, health: 10, cure: "sick", text: "{target} takes the full course, as directed by nobody." } },
  { id: "parts", name: "Spare Parts", kind: "supply", weight: 25, price: 60, sell: 25, stockedAt: PL,
    description: "+35 van condition (+55 with a mechanic).", use: { van: 35, vanMechanic: 20, text: "The parts go in, mostly where they belong." } },
  { id: "books", name: "Forbidden Books", kind: "supply", weight: 5, price: 30, sell: 15, stockedAt: P, wantedAt: "paradise",
    description: "+15 morale for everyone. A tote bag of contraband literature.", use: { morale: 15, text: "Everyone reads something with more than one point of view. Spirits lift." } },
  { id: "painkillers", name: "Bootleg Ibuprofen", kind: "supply", weight: 1, price: 25, sell: 10, stockedAt: PL,
    description: "+12 health for one person. The bottle says \"vitamins.\"", use: { targeted: true, health: 12, text: "{target} takes two and feels marginally less like a pothole." } },
  { id: "vitamins", name: "Contraband Gummy Vitamins", kind: "supply", weight: 1, price: 20, sell: 8, stockedAt: P,
    description: "+5 health for everyone. Banned for \"promoting a culture of wellness.\"", use: { health: 5, text: "Everyone eats a gummy bear shaped like a broccoli. It helps." } },
  { id: "energy", name: "Case of Energy Drinks", kind: "supply", weight: 6, price: 18, sell: 8, stockedAt: L,
    description: "Clears exhaustion for one person. Flavor: \"Patriot Blast.\"", use: { targeted: true, cure: "exhausted", morale: -2, text: "{target} is no longer exhausted. {target} is now vibrating." } },
  { id: "coffee", name: "Fair-Trade Coffee", kind: "supply", weight: 2, price: 15, sell: 10, stockedAt: P, wantedAt: "hostile",
    description: "+8 morale for everyone.", use: { morale: 8, text: "Pour-over on a camp stove. Everyone feels human." } },
  { id: "mre", name: "Military MREs", kind: "supply", weight: 8, price: 30, sell: 15, stockedAt: L,
    description: "+15 food in 8 pounds. Each comes with a tiny bottle of hot sauce and a flag sticker.", use: { food: 15, text: "You unpack the MREs into the food bag. The flag stickers go on the dashboard, ironically." } },
  { id: "tire-patch", name: "Tire Patch Kit", kind: "supply", weight: 3, price: 25, sell: 10, stockedAt: PL,
    description: "+12 van condition.", use: { van: 12, text: "You patch a slow leak nobody had admitted to." } },
  { id: "coolant", name: "Jug of Coolant", kind: "supply", weight: 8, price: 20, sell: 8, stockedAt: L,
    description: "+8 van condition. Essential in a heat wave.", use: { van: 8, text: "The engine stops making the noise it makes before it makes a worse noise." } },
  { id: "electrolytes", name: "Electrolyte Packets", kind: "supply", weight: 1, price: 15, sell: 5, stockedAt: PL,
    description: "+5 health for everyone.", use: { health: 5, text: "Everyone drinks something neon. It's medically sound, probably." } },
  { id: "jerrycan", name: "Full Jerry Can", kind: "supply", weight: 35, price: 25, sell: 15, stockedAt: L,
    description: "Five gallons into the tank when you need it.", use: { fuel: 5, text: "You pour five gallons into the tank and most of it goes in." } },

  // ------------------------------------------------ tools (best tool per skill applies)
  { id: "laptop", name: "Burner Laptop", kind: "tool", weight: 4, price: 120, sell: 50, stockedAt: P,
    description: "Hacking +15 while carried.", passive: { skill: "hacking", bonus: 15 } },
  { id: "usb-duck", name: "Suspicious USB Stick", kind: "tool", weight: 0, price: 45, sell: 15, stockedAt: P,
    description: "Hacking +8 while carried. Label: \"FAMILY PHOTOS (DEFINITELY).\"", passive: { skill: "hacking", bonus: 8 } },
  { id: "press-badge", name: "Fake Press Badge", kind: "tool", weight: 0, price: 60, sell: 20, stockedAt: P,
    description: "Persuasion +12. Says you work for a newspaper that closed in 2009.", passive: { skill: "persuasion", bonus: 12 } },
  { id: "flag-pin", name: "Flag Lapel Pin", kind: "tool", weight: 0, price: 10, sell: 5, stockedAt: L,
    description: "Persuasion +6. Camouflage, basically.", passive: { skill: "persuasion", bonus: 6 } },
  { id: "ham-radio", name: "Ham Radio", kind: "tool", weight: 6, price: 80, sell: 35, stockedAt: PL,
    description: "Survival +10. Weather reports, and a guy in Nebraska who reads poetry at 2 a.m.", passive: { skill: "survival", bonus: 10 } },
  { id: "topo-maps", name: "Pre-Regime Topo Maps", kind: "tool", weight: 2, price: 35, sell: 20, stockedAt: P,
    description: "Survival +8. The roads are where they were before they got renamed.", passive: { skill: "survival", bonus: 8 } },
  { id: "socket-set", name: "Socket Set", kind: "tool", weight: 10, price: 65, sell: 25, stockedAt: PL,
    description: "Mechanical +12.", passive: { skill: "mechanical", bonus: 12 } },
  { id: "multimeter", name: "Multimeter", kind: "tool", weight: 1, price: 25, sell: 10, stockedAt: P,
    description: "Mechanical +6. Nobody fully knows what the dial does.", passive: { skill: "mechanical", bonus: 6 } },
  { id: "surgery-kit", name: "Field Surgery Kit", kind: "tool", weight: 4, price: 90, sell: 40, stockedAt: P,
    description: "Medical +12.", passive: { skill: "medical", bonus: 12 } },
  { id: "first-aid-manual", name: "First Aid Manual", kind: "tool", weight: 1, price: 15, sell: 5, stockedAt: P,
    description: "Medical +6. Several pages have been redacted for \"ideological content,\" including the one on the spleen.", passive: { skill: "medical", bonus: 6 } },
  { id: "constitution", name: "Annotated Constitution", kind: "tool", weight: 1, price: 40, sell: 15, stockedAt: P,
    description: "Negotiation +10. The annotations are mostly exclamation points.", passive: { skill: "negotiation", bonus: 10 } },
  { id: "notary-stamp", name: "Notary Stamp", kind: "tool", weight: 1, price: 50, sell: 20, stockedAt: P,
    description: "Negotiation +8. Bureaucrats respect a stamp.", passive: { skill: "negotiation", bonus: 8 } },
  { id: "clipboard", name: "Clipboard", kind: "tool", weight: 1, price: 15, sell: 3, stockedAt: PL,
    description: "Intimidation +10. Nobody questions a person with a clipboard.", passive: { skill: "intimidation", bonus: 10 } },
  { id: "sunglasses", name: "Mirrored Sunglasses", kind: "tool", weight: 0, price: 20, sell: 5, stockedAt: L,
    description: "Intimidation +8. You can see yourself in them, and so can they.", passive: { skill: "intimidation", bonus: 8 } },
  { id: "lockpicks", name: "Lockpick Set", kind: "tool", weight: 1, price: 70, sell: 30, stockedAt: L,
    description: "Stealth +12.", passive: { skill: "stealth", bonus: 12 } },
  { id: "fake-plates", name: "Fake License Plates", kind: "tool", weight: 5, price: 80, sell: 30, stockedAt: L,
    description: "Stealth +10. The van is now registered in a state that doesn't exist.", passive: { skill: "stealth", bonus: 10 } },

  // ------------------------------------------------ trade goods
  { id: "insulin", name: "Canadian Insulin", kind: "trade", weight: 2, sell: 90, wantedAt: "hostile",
    description: "Worth a fortune in the hellhole, where it costs a fortune." },
  { id: "bourbon", name: "Pre-Ban Bourbon", kind: "trade", weight: 6, sell: 60, wantedAt: "hostile",
    description: "Banned for \"liberal bias.\" Nobody can explain how bourbon has a bias." },
  { id: "regime-hats", name: "Box of Regime Hats", kind: "trade", weight: 3, price: 12, stockedAt: L, sell: 30, wantedAt: "paradise",
    description: "Paradise thrift stores sell them as irony. Margins are excellent." },
  { id: "vinyl", name: "Banned Vinyl Records", kind: "trade", weight: 4, sell: 45, wantedAt: "paradise",
    description: "Protest folk, mostly. One is just whale sounds." },
  { id: "seeds", name: "Heirloom Seeds", kind: "trade", weight: 1, sell: 35, wantedAt: "paradise",
    description: "Pre-patent tomatoes. Co-ops will fight over them, politely, by committee." },
  { id: "copper", name: "Spool of Copper Wire", kind: "trade", weight: 20, sell: 50, wantedAt: "hostile",
    description: "Heavy, and somebody always wants it." },
  { id: "rally-coins", name: "Commemorative \"Gold\" Coins", kind: "trade", weight: 1, price: 40, stockedAt: L, sell: 25, wantedAt: "hostile",
    description: "Sold at rallies as an investment. They are an investment in brass." },
  { id: "textbooks", name: "Contraband Textbooks", kind: "trade", weight: 8, sell: 45, wantedAt: "paradise",
    description: "Biology, with the chapter on evolution still in it." },
  { id: "solar-panel", name: "Smuggled Solar Panel", kind: "trade", weight: 25, sell: 80, wantedAt: "paradise",
    description: "Illegal in three states for \"insulting coal.\"" },
  { id: "hot-sauce", name: "Small-Batch Hot Sauce", kind: "trade", weight: 2, price: 10, stockedAt: L, sell: 20, wantedAt: "paradise",
    description: "Made by a guy at a gas station who has strong views on vinegar." },
  { id: "cigarettes", name: "Carton of Cigarettes", kind: "trade", weight: 1, price: 30, stockedAt: L, sell: 25, wantedAt: "hostile",
    description: "Nobody in the van smokes. That's not what they're for." },
  { id: "batteries", name: "Box of Batteries", kind: "trade", weight: 4, price: 15, stockedAt: PL, sell: 20,
    description: "Everybody needs batteries. Everybody." },
  { id: "tote", name: "Signed Public Radio Tote", kind: "trade", weight: 1, sell: 40, wantedAt: "paradise",
    description: "Signed by a host whose voice you'd recognize anywhere. Priceless, roughly $40." },
  { id: "kombucha", name: "Case of Kombucha", kind: "trade", weight: 6, sell: 12, wantedAt: "paradise",
    description: "From the mutual-aid fridge. It keeps showing up.", use: { morale: 3, text: "Everyone has a kombucha. Everyone pretends to like it." } },
  { id: "scrap", name: "Scrap Aluminum", kind: "trade", weight: 15, sell: 25, wantedAt: "hostile",
    description: "Cans, mostly. Some of a lawn chair." },
  { id: "cheese", name: "Wheel of Contraband Cheese", kind: "trade", weight: 5, sell: 35,
    description: "Raw-milk, aged, banned for being \"too European.\" Also edible.", use: { food: 8, morale: 4, text: "You cut into the cheese. Everyone is briefly French." } },
  { id: "jerky", name: "Gift Shop Jerky", kind: "trade", weight: 3, price: 12, stockedAt: L, sell: 12,
    description: "Shaped like the state. Edible in a pinch.", use: { food: 6, text: "You eat Montana. It's chewy." } },

  // ------------------------------------------------ curios and keys
  { id: "brick", name: "Souvenir Wall Brick", kind: "curio", weight: 5, sell: 5,
    description: "From the Great Wall of North Dakota. Keeps out nothing.", use: { morale: 4, text: "You hold the brick and think about walls. It's oddly comforting." } },
  { id: "wanted-poster", name: "Your Own Wanted Poster", kind: "curio", weight: 0, sell: 2,
    description: "It's a good likeness of everyone except whoever is angriest about it.", use: { morale: 8, text: "You pass the poster around. It's the best photo anyone has taken of you in years." } },
  { id: "snow-globe", name: "Book-Burning Snow Globe", kind: "curio", weight: 1, sell: 12, wantedAt: "paradise",
    description: "Shake it and little paper flakes swirl around a bonfire. Deeply cursed. Sells well as irony." },
  { id: "loyalty-card", name: "Fully Punched Loyalty Card", kind: "curio", weight: 0, sell: 0,
    description: "Ten punches. Checkpoint guards are obligated to honor it, which they hate." },
  { id: "plate", name: "Commemorative Plate", kind: "curio", weight: 3, sell: 15, wantedAt: "hostile",
    description: "Celebrates a governor's \"Decade of Decency.\" It's year three." },
  { id: "scarf", name: "Hand-Knit Scarf", kind: "curio", weight: 1, sell: 10,
    description: "Knit during your checkup by a retired nurse.", use: { targeted: true, morale: 15, text: "{target} wears the scarf. It's warm in a way that has nothing to do with wool." } },
  { id: "postcard", name: "Postcard From Vermont", kind: "curio", weight: 0, sell: 1,
    description: "From someone who made it. \"The cheese is real. Keep going.\"", use: { morale: 12, text: "You read the postcard out loud. Then again. Then {member} reads it." } },
  { id: "mixtape", name: "Protest Mixtape", kind: "curio", weight: 0, sell: 8,
    description: "Hand-labeled. Side B is the same song nine times.", use: { morale: 6, text: "Side A. Everyone sings. Side B. Everyone keeps singing." } },
  { id: "bumper-sticker", name: "COEXIST Bumper Sticker", kind: "curio", weight: 0, sell: 3, wantedAt: "paradise",
    description: "Still in the wrapper. Putting it on the van would be a choice." },
  { id: "rubber-chicken", name: "Rubber Chicken", kind: "curio", weight: 1, sell: 2,
    description: "Origin unknown. Morale-positive.", use: { morale: 5, text: "Someone squeezes the chicken at the perfect moment. Nobody recovers for a mile." } },
  { id: "church-fan", name: "Church Paper Fan", kind: "curio", weight: 0, sell: 1,
    description: "From a revival tent. One side has a prayer; the other has a funeral home ad." },
  { id: "deputy-badge", name: "Junior Deputy Badge", kind: "curio", weight: 0, sell: 5,
    description: "Plastic. Looks real from a distance, if the distance is large." },
  { id: "thank-you", name: "Thank-You Note From the Resistance", kind: "curio", weight: 0, sell: 0,
    description: "Handwritten, unsigned, slightly coffee-stained.", use: { morale: 6, text: "You reread the note. Somebody noticed." } },
  { id: "envelope", name: "Sealed Envelope", kind: "curio", weight: 0, sell: 0,
    description: "\"Documents. Real ones. The kind they want gone.\" Deliver it to the Twin Cities." }
];

export const ITEMS_BY_ID: ReadonlyMap<string, ItemDef> = new Map(ITEMS.map(i => [i.id, i]));

// ------------------------------------------------------------------ shops

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  food?: number;
  fuel?: number;
  /** Buying this adds one of this inventory item. */
  item?: string;
}

/** Bulk goods every stop sells, plus every stockable inventory item. */
export const SHOP_ITEMS: ShopItem[] = [
  { id: "rations", name: "Underground Rations", basePrice: 45, food: 20,
    description: "Twenty pounds of groceries from a co-op that requires a 40-step membership process." },
  { id: "gas", name: "Gas (5 gal)", basePrice: 17, fuel: 5,
    description: "Five gallons, pumped by a guy who calls it \"freedom juice\" without irony." },
  ...ITEMS.filter(i => i.price !== undefined).map(i => ({ id: i.id, name: i.name, description: i.description, basePrice: i.price!, item: i.id }))
];

/** Every stop sells these; the rest are seeded per stop from items stocked at that kind of stop. */
export const ALWAYS_STOCKED = ["rations", "gas"];
export const PARADISE_EXTRA_STOCK = 6;
export const LANDMARK_EXTRA_STOCK = 3;
/** Paradises always carry the basics so a run is never soft-locked on medicine. */
export const PARADISE_STAPLES = ["medkit", "parts"];
export const LANDMARK_STAPLES = ["parts"];
export const LANDMARK_MARKUP = 1.35;

/** Shop price multiplier range, applied per stop and item. */
export const PRICE_SPREAD = { min: 0.85, max: 1.3 };

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
