// All event content. Each file is a themed batch; the validator checks them together.
import type { GameEvent } from "../../types";
import { CHECKPOINT_EVENTS } from "./checkpoints";
import { CORE_EVENTS } from "./core";
import { HEARTLAND_EVENTS } from "./heartland";
import { WEST_EVENTS } from "./west";

export const EVENTS: GameEvent[] = [...CORE_EVENTS, ...CHECKPOINT_EVENTS, ...WEST_EVENTS, ...HEARTLAND_EVENTS];
