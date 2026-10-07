// The Modern American Trail: Worker.
// Serves the static game (dist/) and one small, optional endpoint: /api/flavor,
// which writes news-ticker headlines and end-of-run epilogues. The game never
// depends on it; the client falls back to authored text on any error.
//
// Abuse is bounded three ways: structured input only (no client prompts or
// models), per-IP rate limiting, and free-only models (Workers AI stops at its
// free daily allocation on the free plan; OpenRouter is restricted to ":free").

export interface Env {
  ASSETS: Fetcher;
  AI?: Ai;
  FLAVOR_LIMITER?: RateLimit;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODELS?: string;
}

const MAX_BODY_BYTES = 2048;
const WORKERS_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const DEFAULT_OPENROUTER_MODELS = ["apodex/apodex-1.1-mini:free", "inception/mercury-decide:free"];
const UPSTREAM_TIMEOUT_MS = 12000;
/** Shared headlines are cached at the edge so most requests never reach a model. */
const HEADLINE_CACHE_SECONDS = 6 * 60 * 60;
const FALLBACK_LIMIT = { windowMs: 60_000, max: 12 };

const REGIONS = ["northwest", "mountain", "plains", "midwest", "south", "east"] as const;
const SEASONS = ["spring", "summer", "fall", "winter"] as const;
const ENDINGS = ["full-house", "vermont", "lone-survivor", "settled", "detained", "starved", "worn-down", "lost"] as const;
const NAMES = ["Alex", "Sam", "Jordan", "Casey", "Taylor", "Morgan", "Riley", "Jessie", "Pat", "Quinn", "Robin"];

const SYSTEM = [
  "You write for a satirical road-trip game. Friends flee a liberal paradise through a country run by a fictional authoritarian regime, heading for Vermont.",
  "Voice: dry, specific, absurd but plausible. Understate. One concrete detail beats three adjectives.",
  "Aim jokes at the fictional regime, its institutions, slogans, paperwork and enforcers. Never at groups of people, regions' residents, or any race, religion, gender, sexuality or disability.",
  "Never name real people, real politicians, real companies or real news outlets. No slurs, no gore, no real tragedies.",
  "Plain text only. No markdown, no quotation marks around the whole answer, no hashtags, no emoji, no URLs."
].join(" ");

// ------------------------------------------------------------------ validation

type HeadlineReq = { kind: "headline"; region: (typeof REGIONS)[number]; season: (typeof SEASONS)[number]; variant: number; wanted: boolean };
type EpilogueReq = {
  kind: "epilogue"; ending: (typeof ENDINGS)[number]; survivors: string[]; lost: string[];
  days: number; miles: number; difficulty: "easy" | "normal" | "hard"; moments: string[];
};
type FlavorReq = HeadlineReq | EpilogueReq;

const int = (v: unknown, lo: number, hi: number) => (Number.isInteger(v) && (v as number) >= lo && (v as number) <= hi ? (v as number) : null);
const oneOf = <T extends readonly string[]>(v: unknown, list: T): T[number] | null => (list.includes(v as string) ? (v as T[number]) : null);
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f<>{}]/g, " ").slice(0, max).trim() : "");

export function parseRequest(body: unknown): FlavorReq | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (b.kind === "headline") {
    const region = oneOf(b.region, REGIONS);
    const season = oneOf(b.season, SEASONS);
    const variant = int(b.variant, 0, 3);
    if (!region || !season || variant === null) return null;
    return { kind: "headline", region, season, variant, wanted: b.wanted === true };
  }
  if (b.kind === "epilogue") {
    const ending = oneOf(b.ending, ENDINGS);
    const days = int(b.days, 1, 400);
    const miles = int(b.miles, 0, 10000);
    const difficulty = oneOf(b.difficulty, ["easy", "normal", "hard"] as const);
    const names = (v: unknown) => (Array.isArray(v) ? v.filter(n => NAMES.includes(n)).slice(0, 3) : []);
    if (!ending || days === null || miles === null || !difficulty) return null;
    const moments = (Array.isArray(b.moments) ? b.moments : []).slice(0, 5).map(m => clean(m, 60)).filter(Boolean);
    return { kind: "epilogue", ending, survivors: names(b.survivors), lost: names(b.lost), days, miles, difficulty, moments };
  }
  return null;
}

function prompt(r: FlavorReq): { user: string; maxTokens: number } {
  if (r.kind === "headline") {
    const place = { northwest: "the Pacific Northwest", mountain: "the Mountain West", plains: "the Great Plains", midwest: "the Midwest", south: "the South", east: "the Mid-Atlantic and New England" }[r.region];
    return {
      maxTokens: 60,
      user: `Write one news-ticker headline from the regime's state media about ${place} in ${r.season}${r.wanted ? ", which mentions 'dangerous outsiders in a van' without naming anyone" : ""}. Under 100 characters. Headline only. (Variation ${r.variant + 1}.)`
    };
  }
  const how = {
    "full-house": "everyone reached Vermont alive", vermont: "they reached Vermont, but not everyone made it",
    "lone-survivor": "only one of them reached Vermont", settled: "they settled in a safe city before Vermont",
    detained: "they were detained after a failed escape", starved: "they ran out of food", "worn-down": "the road wore them down", lost: "no one was left"
  }[r.ending];
  return {
    maxTokens: 220,
    user: [
      `Write a short epilogue (3 sentences, under 90 words) for a run of the game where ${how}.`,
      `It took ${r.days} days and ${r.miles} miles on ${r.difficulty} difficulty.`,
      r.survivors.length ? `Survivors: ${r.survivors.join(", ")}.` : "",
      r.lost.length ? `Lost along the way: ${r.lost.join(", ")}. Treat them with warmth, not jokes.` : "",
      r.moments.length ? `Moments from the trip: ${r.moments.join("; ")}.` : "",
      "Past tense. Bittersweet if anyone was lost; dry and warm otherwise."
    ].filter(Boolean).join(" ")
  };
}

/** Keeps model output inside the game's rules: short, plain, no links. */
export function tidy(text: string, kind: FlavorReq["kind"]): string | null {
  let t = text.replace(/[*_#`>]/g, "").replace(/\s+/g, " ").trim();
  t = t.replace(/^(headline|epilogue)\s*:\s*/i, "").trim();
  // Unwrap one pair of outer double quotes; leave quotes inside the text alone.
  const m = t.match(/^["“](.*)["”]$/);
  if (m) t = m[1].trim();
  t = t.replace(/^(headline|epilogue)\s*:\s*/i, "").trim();
  if (!t || /https?:|www\.|@/i.test(t)) return null;
  const max = kind === "headline" ? 120 : 700;
  if (t.length > max) t = t.slice(0, max).replace(/\s+\S*$/, "") + "…";
  return t;
}

// ------------------------------------------------------------------ models

async function viaWorkersAI(env: Env, user: string, maxTokens: number): Promise<string | null> {
  if (!env.AI) return null;
  const out = await env.AI.run(WORKERS_AI_MODEL as Parameters<Ai["run"]>[0], {
    messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }],
    max_tokens: maxTokens,
    temperature: 0.9
  } as never) as { response?: string };
  return typeof out?.response === "string" ? out.response : null;
}

async function viaOpenRouter(env: Env, user: string, maxTokens: number, origin: string): Promise<string | null> {
  if (!env.OPENROUTER_API_KEY) return null;
  const models = (env.OPENROUTER_MODELS ? env.OPENROUTER_MODELS.split(",") : DEFAULT_OPENROUTER_MODELS)
    .map(m => m.trim()).filter(m => /^[\w.-]+\/[\w.:-]+:free$/.test(m)).slice(0, 2);
  for (const model of models) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: ctrl.signal,
        headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, "Content-Type": "application/json", "HTTP-Referer": origin, "X-Title": "Modern American Trail" },
        body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.9, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }] })
      });
      if (!res.ok) continue;
      const data = await res.json() as { choices?: { message?: { content?: string } }[] };
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) return text;
    } catch {
      // try the next model
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

// ------------------------------------------------------------------ rate limiting

const hits = new Map<string, number[]>();
function fallbackLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < FALLBACK_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > FALLBACK_LIMIT.max;
}

async function limited(env: Env, ip: string): Promise<boolean> {
  if (env.FLAVOR_LIMITER) {
    try {
      const { success } = await env.FLAVOR_LIMITER.limit({ key: ip });
      return !success;
    } catch {
      // binding unavailable: fall through to the per-isolate limiter
    }
  }
  return fallbackLimited(ip);
}

// ------------------------------------------------------------------ handler

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra } });

export async function handleFlavor(request: Request, env: Env, ctx?: ExecutionContext): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, { Allow: "POST" });
  const self = new URL(request.url).origin;
  const origin = request.headers.get("Origin");
  if (origin && origin !== self) return json({ error: "Forbidden" }, 403);

  if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY_BYTES) return json({ error: "Too large" }, 413);
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "Too large" }, 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return json({ error: "Bad request" }, 400); }
  const req = parseRequest(body);
  if (!req) return json({ error: "Bad request" }, 400);

  // Shared headlines come from the edge cache when possible: no model call, no rate-limit hit.
  const cache = typeof caches !== "undefined" ? (caches as unknown as { default: Cache }).default : null;
  const cacheKey = req.kind === "headline" ? new Request(`${self}/__flavor/headline/${req.region}/${req.season}/${req.variant}/${req.wanted ? 1 : 0}`) : null;
  if (cache && cacheKey) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (await limited(env, ip)) return json({ error: "Too many requests" }, 429, { "Retry-After": "60" });

  const { user, maxTokens } = prompt(req);
  let text: string | null = null;
  try { text = await viaWorkersAI(env, user, maxTokens); } catch (e) { console.warn("workers ai failed", (e as Error)?.message); }
  if (!text) text = await viaOpenRouter(env, user, maxTokens, self);
  const out = text ? tidy(text, req.kind) : null;
  if (!out) return json({ error: "Unavailable" }, 503);

  if (cache && cacheKey) {
    const res = json({ text: out }, 200, { "Cache-Control": `public, max-age=${HEADLINE_CACHE_SECONDS}` });
    const put = cache.put(cacheKey, res.clone());
    if (ctx) ctx.waitUntil(put); else await put;
    return res;
  }
  return json({ text: out });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/flavor") return handleFlavor(request, env, ctx);
    if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
