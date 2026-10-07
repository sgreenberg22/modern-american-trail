import type { EndingId } from "../types";

export interface Ending {
  id: EndingId;
  title: string;
  /** {survivors}, {city}, {days}, {miles} are filled in. */
  text: string;
  kind: "win" | "partial" | "loss";
  /** Base score before bonuses and the difficulty multiplier. */
  score: number;
}

export const ENDINGS: Record<EndingId, Ending> = {
  "full-house": { id: "full-house", kind: "win", score: 3000, title: "Everyone Made It",
    text: "All of you cross into Vermont after {days} days. A volunteer in a fleece vest hands each of you maple syrup, a voter registration form, and a pamphlet about composting. Nobody has ever been so happy to receive a pamphlet." },
  "vermont": { id: "vermont", kind: "win", score: 2000, title: "Vermont",
    text: "{survivors} cross the state line after {days} days and {miles} miles. There's a plaque at the welcome center with room for names. You add the ones who didn't make it." },
  "lone-survivor": { id: "lone-survivor", kind: "win", score: 1200, title: "The Last One In",
    text: "{survivors} drives across the line alone after {days} days. The van makes it too, more or less. Someone at the border hands over a blanket and doesn't ask questions." },
  "settled": { id: "settled", kind: "partial", score: 800, title: "Putting Down Roots",
    text: "You decide {city} is far enough. It isn't Vermont, but it has a co-op, a library that lends books with more than one point of view, and a landlord who only mostly ignores you. {survivors} start over here." },
  "detained": { id: "detained", kind: "loss", score: 0, title: "Detained",
    text: "The escape doesn't work. The paperwork, at least, is very thorough. Your file now says \"flight risk (patriotic review pending),\" and the review will take a long time." },
  "starved": { id: "starved", kind: "loss", score: 0, title: "The Food Ran Out",
    text: "{miles} miles in, the last of the food is gone, and so is the last of you." },
  "worn-down": { id: "worn-down", kind: "loss", score: 0, title: "Worn Down",
    text: "{miles} miles of checkpoints, bad sleep and gas station dinners. The road wins this one." },
  "lost": { id: "lost", kind: "loss", score: 0, title: "The Trail Ends",
    text: "{miles} miles in, there's no one left to drive." }
};

/** Endings that event content is allowed to trigger directly. Wins are never among them. */
export const CONTENT_ENDINGS: EndingId[] = ["detained"];

export interface UnlockDef {
  id: string;
  label: string;
  /** How to earn it, shown on locked items. */
  hint: string;
}

export const UNLOCKS: UnlockDef[] = [
  { id: "reach-twin-cities", label: "Reached the Twin Cities", hint: "Reach Minneapolis in any run." },
  { id: "reach-chicago", label: "Reached Chicago", hint: "Reach Chicago in any run." },
  { id: "first-win", label: "First Vermont", hint: "Reach Vermont on any difficulty." },
  { id: "win-normal", label: "Normal win", hint: "Reach Vermont on Normal or Hard." },
  { id: "full-house", label: "Full house", hint: "Get everyone to Vermont alive." },
  { id: "jailbreak", label: "Jailbreak", hint: "Escape after being arrested." },
  { id: "faithful-friend", label: "Friend of the Faithful", hint: "Finish a run with Faithful reputation of 30 or more." },
  { id: "long-haul", label: "Long haul", hint: "Drive 10,000 miles across all runs." },
  { id: "ran-dry", label: "Ran dry", hint: "Run out of gas on the road." }
];
