import type { Character, ItemId } from "../types";

export const CHARACTERS: Character[] = [
  { id: "alex", name: "Alex", profession: "Hacker", skill: "hacking", kit: { money: 200 },
    blurb: "Brings $200 from a crypto wallet they swear is legal. Opens anything with a keypad." },
  { id: "sam", name: "Sam", profession: "Journalist", skill: "persuasion", kit: { morale: 15 },
    blurb: "Keeps spirits up (+15 morale). Can talk a guard into a long, confused silence." },
  { id: "jordan", name: "Jordan", profession: "Prepper", skill: "survival", kit: { food: 30 },
    blurb: "Packed 30 extra pounds of freeze-dried lasagna. Knows which berries are fine." },
  { id: "casey", name: "Casey", profession: "Mechanic", skill: "mechanical", kit: { money: 50, items: { parts: 1 } },
    blurb: "Brings a box of spare parts. Repairs go further, and the van wears out slower." },
  { id: "taylor", name: "Taylor", profession: "Doctor", skill: "medical", kit: { items: { medkit: 1 } },
    blurb: "Patches up the weakest traveler every day and helps people recover. Brings a medkit." },
  { id: "morgan", name: "Morgan", profession: "Lawyer", skill: "negotiation", kit: { money: 120 },
    blurb: "Brings $120 and a pocket Constitution, annotated, now mostly redacted." },
  // Unlockable
  { id: "riley", name: "Riley", profession: "Ex-Cop", skill: "intimidation", kit: { food: 15, morale: -5 }, unlock: "reach-chicago",
    blurb: "Knows every checkpoint script by heart. A bit of a downer at campfires." },
  { id: "jessie", name: "Jessie", profession: "Smuggler", skill: "stealth", kit: { money: 80, food: 10 }, unlock: "jailbreak",
    blurb: "Extra cash and snacks of unclear origin. Has driven this route before, at night, lights off." },
  { id: "pat", name: "Pat", profession: "Defrocked Pastor", skill: "persuasion", kit: { rep: { faithful: 25 }, money: 40 }, unlock: "faithful-friend",
    blurb: "Kicked out of a megachurch for being too nice. Church folk still trust them (+25 with the Faithful)." },
  { id: "quinn", name: "Quinn", profession: "Trucker", skill: "mechanical", kit: { fuel: 10, food: 10 }, unlock: "long-haul",
    blurb: "Has a CB radio, a thermos, and opinions about every truck stop between here and Maine. Starts with extra gas." },
  { id: "robin", name: "Robin", profession: "Nurse", skill: "medical", kit: { items: { medkit: 2, antibiotics: 1 } }, unlock: "first-win",
    blurb: "Twelve-hour shifts made this road trip feel restful. Brings two medkits and antibiotics." }
];

export const PARTY_SIZE = 3;

export interface StartingKit {
  id: string;
  name: string;
  description: string;
  money?: number;
  food?: number;
  fuel?: number;
  items?: Partial<Record<ItemId, number>>;
  upgrades?: string[];
  unlock?: string;
}

export const KITS: StartingKit[] = [
  { id: "none", name: "Travel light", description: "Nothing extra. Purists only." , money: 60 },
  { id: "cooler", name: "Cooler of sandwiches", description: "+30 food.", food: 30 },
  { id: "toolbox", name: "Toolbox", description: "Two sets of spare parts.", items: { parts: 2 }, unlock: "reach-twin-cities" },
  { id: "cash", name: "Emergency cash", description: "+$150 sewn into the seat cushions.", money: 150, unlock: "win-normal" },
  { id: "medbag", name: "Med bag", description: "Two medkits and antibiotics.", items: { medkit: 2, antibiotics: 1 }, unlock: "full-house" },
  { id: "rack", name: "Roof rack and jerry cans", description: "Roof rack (+150 lb) and 10 extra gallons.", upgrades: ["rack"], fuel: 10, unlock: "ran-dry" }
];
