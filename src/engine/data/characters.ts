import type { Character } from "../types";

export const CHARACTERS: Character[] = [
  { id: "alex", name: "Alex", profession: "Hacker", skill: "hacking", kit: { money: 200 },
    blurb: "Brings $200 from a crypto wallet they swear is legal. Opens anything with a keypad." },
  { id: "sam", name: "Sam", profession: "Journalist", skill: "persuasion", kit: { morale: 15 },
    blurb: "Keeps spirits up (+15 morale). Can talk a guard into a long, confused silence." },
  { id: "jordan", name: "Jordan", profession: "Prepper", skill: "survival", kit: { food: 30 },
    blurb: "Packed 30 extra pounds of freeze-dried lasagna. Knows which berries are fine." },
  { id: "casey", name: "Casey", profession: "Mechanic", skill: "mechanical", kit: { money: 50, food: 10 },
    blurb: "Can fix the van with a coat hanger and spite. Slightly better provisioned." },
  { id: "taylor", name: "Taylor", profession: "Doctor", skill: "medical", kit: { food: 5 },
    blurb: "Patches up the weakest traveler a little every day. Has opinions about your diet." },
  { id: "morgan", name: "Morgan", profession: "Lawyer", skill: "negotiation", kit: { money: 120 },
    blurb: "Brings $120 and a pocket Constitution, annotated, now mostly redacted." },
  { id: "riley", name: "Riley", profession: "Ex-Cop", skill: "intimidation", kit: { food: 15, morale: -5 },
    blurb: "Knows every checkpoint script by heart. A bit of a downer at campfires." },
  { id: "jessie", name: "Jessie", profession: "Smuggler", skill: "stealth", kit: { money: 80, food: 10 },
    blurb: "Extra cash and snacks of unclear origin. Has driven this route before, at night, lights off." }
];

export const PARTY_SIZE = 3;
