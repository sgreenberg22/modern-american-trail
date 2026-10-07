// Connects the pure engine to React. Game state autosaves to localStorage after
// every action; UI-only state (open panels etc.) stays in components and is never saved.
// Meta progress (unlocks, stats, Daily Run results) is stored separately.
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  applyAction, dailyOptions, deserialize, newGame, parseMeta, recordRun, serialize,
  type Action, type GameState, type MetaState, type NewGameOptions, type UnlockDef
} from "../engine";

const SAVE_KEY = "modern-american-trail.save";
const META_KEY = "modern-american-trail.meta";

type Msg = { kind: "action"; action: Action } | { kind: "replace"; state: GameState | null };

function reducer(state: GameState | null, msg: Msg): GameState | null {
  if (msg.kind === "replace") return msg.state;
  return state ? applyAction(state, msg.action) : state;
}

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage full or blocked: play continues, just won't persist */ }
}

export function readSavedGame(): GameState | null {
  const raw = read(SAVE_KEY);
  if (!raw) return null;
  const r = deserialize(raw);
  return r.ok && r.state.phase.kind !== "over" ? r.state : null;
}

export function randomSeed(): string {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return Array.from(a, n => n.toString(36)).join("");
}

/** Today's Daily Run date. UTC, so everyone in the world shares the same run. */
export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useGame() {
  const [state, send] = useReducer(reducer, null);
  const [meta, setMeta] = useState<MetaState>(() => parseMeta(read(META_KEY)));
  const [newUnlocks, setNewUnlocks] = useState<UnlockDef[]>([]);
  const metaRef = useRef(meta);
  const recorded = useRef<GameState | null>(null);

  useEffect(() => {
    if (state) write(SAVE_KEY, serialize(state));
  }, [state]);

  // Record a finished run exactly once.
  useEffect(() => {
    if (!state || state.phase.kind !== "over" || recorded.current === state) return;
    recorded.current = state;
    const r = recordRun(metaRef.current, state);
    metaRef.current = r.meta;
    write(META_KEY, JSON.stringify(r.meta));
    setMeta(r.meta);
    setNewUnlocks(r.newUnlocks);
  }, [state]);

  const dispatch = useCallback((action: Action) => send({ kind: "action", action }), []);
  const start = useCallback((opts: Omit<NewGameOptions, "seed"> & { seed?: string }) => {
    setNewUnlocks([]);
    send({ kind: "replace", state: newGame({ seed: randomSeed(), ...opts }) });
  }, []);
  const startDaily = useCallback(() => {
    setNewUnlocks([]);
    send({ kind: "replace", state: newGame(dailyOptions(todayUTC())) });
  }, []);
  const resume = useCallback((s: GameState) => send({ kind: "replace", state: s }), []);
  const quit = useCallback(() => send({ kind: "replace", state: null }), []);

  return { state, meta, newUnlocks, dispatch, start, startDaily, resume, quit };
}

export function exportSave(state: GameState) {
  const blob = new Blob([serialize(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `modern-american-trail-day${state.day}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importSave(file: File): Promise<ReturnType<typeof deserialize>> {
  if (file.size > 2_000_000) return { ok: false, error: "That file is too large to be a save." };
  return deserialize(await file.text());
}
