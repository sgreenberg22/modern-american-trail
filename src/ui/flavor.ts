// Optional AI flavor text. The game never waits on this: authored text shows
// immediately, AI text replaces it if and when it arrives. The first error
// turns AI off for the rest of the session.
import { useEffect, useState } from "react";
import { authoredHeadline, calendar, endingOf, living, nextStop, currentStop, HEAT, type GameState } from "../engine";
import { stableFloat } from "../engine/rng";

const PREF_KEY = "modern-american-trail.ai";
const TIMEOUT_MS = 8000;
/** Courtesy caps per run; the server enforces its own per-IP limit. */
const MAX_HEADLINES_PER_RUN = 6;

let sessionDisabled = false;
const headlineCache = new Map<string, string>();
const headlineCount = new Map<string, number>();

export function aiPreference(): boolean {
  try { return localStorage.getItem(PREF_KEY) !== "off"; } catch { return true; }
}
export function setAiPreference(on: boolean) {
  try { localStorage.setItem(PREF_KEY, on ? "on" : "off"); } catch { /* ignore */ }
  if (on) sessionDisabled = false;
}

async function requestFlavor(body: Record<string, unknown>): Promise<string | null> {
  if (sessionDisabled || !aiPreference()) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("/api/flavor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json() as { text?: string };
    if (typeof data.text !== "string" || !data.text) throw new Error("empty");
    return data.text;
  } catch {
    sessionDisabled = true; // fall back to authored text for the rest of the session
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Today's ticker headline: authored, upgraded to an AI one per region when available. */
export function useHeadline(state: GameState): { text: string; ai: boolean } {
  const region = (nextStop(state) ?? currentStop(state)).region;
  const key = `${state.seed}|${region}`;
  const authored = authoredHeadline(state);
  const [ai, setAi] = useState<string | null>(headlineCache.get(key) ?? null);

  useEffect(() => {
    setAi(headlineCache.get(key) ?? null);
    if (headlineCache.has(key)) return;
    const used = headlineCount.get(state.seed) ?? 0;
    if (used >= MAX_HEADLINES_PER_RUN) return;
    headlineCount.set(state.seed, used + 1);
    let live = true;
    requestFlavor({
      kind: "headline",
      region,
      season: calendar(state).season,
      variant: Math.floor(stableFloat(state.seed, region) * 4),
      wanted: state.heat >= HEAT.wanted
    }).then(text => {
      if (!text) return;
      headlineCache.set(key, text);
      if (live) setAi(text);
    });
    return () => { live = false; };
    // One request per run per region; day-to-day changes don't refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Alternate authored and AI lines so the authored ticker still gets airtime.
  return ai && state.day % 2 === 0 ? { text: ai, ai: true } : { text: authored, ai: false };
}

/** An AI epilogue for a finished run, or null (not available / still writing / AI off). */
export function useEpilogue(state: GameState): { text: string | null; loading: boolean } {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ending = endingOf(state);

  useEffect(() => {
    if (!ending || sessionDisabled || !aiPreference()) return;
    let live = true;
    setLoading(true);
    const moments = state.journal
      .filter(j => !["On the road", "Market", "Sympathizers", "Rest"].includes(j.title) && !j.title.startsWith("Arrived"))
      .map(j => j.title)
      .filter((t, i, a) => a.indexOf(t) === i)
      .slice(-5);
    requestFlavor({
      kind: "epilogue",
      ending: ending.id,
      survivors: living(state).map(m => m.name),
      lost: state.party.filter(m => !m.alive).map(m => m.name),
      days: state.day,
      miles: state.totalMiles,
      difficulty: state.difficulty,
      moments
    }).then(t => { if (live) { setText(t); setLoading(false); } });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.seed, ending?.id]);

  return { text, loading };
}
