// All event content. Each file is a themed batch; the validator checks them together.
import type { GameEvent } from "../../types";
import { CHAIN_EVENTS } from "./chains";
import { CHECKPOINT_EVENTS } from "./checkpoints";
import { CORE_EVENTS } from "./core";
import { EAST_EVENTS } from "./east";
import { FACTION_EVENTS } from "./factions";
import { HEARTLAND_EVENTS } from "./heartland";
import { PARADISE_EVENTS } from "./paradise";
import { PEOPLE_EVENTS } from "./people";
import { ROAD_EVENTS } from "./road";
import { WEST_EVENTS } from "./west";

export const EVENTS: GameEvent[] = [
  ...CORE_EVENTS,
  ...CHECKPOINT_EVENTS,
  ...WEST_EVENTS,
  ...HEARTLAND_EVENTS,
  ...EAST_EVENTS,
  ...PEOPLE_EVENTS,
  ...ROAD_EVENTS,
  ...PARADISE_EVENTS,
  ...FACTION_EVENTS,
  ...CHAIN_EVENTS
];
