// Connects the pure engine to React. Game state autosaves to localStorage after
// every action; UI-only state (open panels etc.) stays in components and is never saved.
import { useCallback, useEffect, useReducer } from "react";
import { applyAction, deserialize, newGame, serialize, type Action, type Difficulty, type GameState } from "../engine";

const SAVE_KEY = "modern-american-trail.save";

type Msg = { kind: "action"; action: Action } | { kind: "replace"; state: GameState | null };

function reducer(state: GameState | null, msg: Msg): GameState | null {
  if (msg.kind === "replace") return msg.state;
  return state ? applyAction(state, msg.action) : state;
}

export function readSavedGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const r = deserialize(raw);
    return r.ok && r.state.phase.kind !== "over" ? r.state : null;
  } catch {
    return null;
  }
}

function randomSeed(): string {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return Array.from(a, n => n.toString(36)).join("");
}

export function useGame() {
  const [state, send] = useReducer(reducer, null);

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(SAVE_KEY, serialize(state));
    } catch {
      // Storage full or blocked (private mode): the game still plays, it just won't resume.
    }
  }, [state]);

  const dispatch = useCallback((action: Action) => send({ kind: "action", action }), []);
  const start = useCallback((difficulty: Difficulty, seed = randomSeed()) => send({ kind: "replace", state: newGame({ seed, difficulty }) }), []);
  const resume = useCallback((s: GameState) => send({ kind: "replace", state: s }), []);
  const quit = useCallback(() => send({ kind: "replace", state: null }), []);

  return { state, dispatch, start, resume, quit };
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
