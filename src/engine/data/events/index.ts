// All event content. Each file is a themed batch; the validator checks them together.
import type { GameEvent } from "../../types";
import { CORE_EVENTS } from "./core";

export const EVENTS: GameEvent[] = [...CORE_EVENTS];
