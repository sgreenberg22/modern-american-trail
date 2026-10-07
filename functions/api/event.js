// functions/api/event.js
// Generates one game event via OpenRouter. The client sends ONLY structured game
// context; the prompt, model, and limits are decided here. This is deliberately
// not a general-purpose chat proxy.

const MAX_BODY_BYTES = 4096;
const MAX_TOKENS = 700;
const UPSTREAM_TIMEOUT_MS = 15000;
const MAX_MODEL_ATTEMPTS = 2;
const RATE_LIMIT = { windowMs: 60_000, max: 8 }; // per IP, per isolate

// Free models only. Override with the OPENROUTER_MODELS env var (comma-separated).
// Anything not ending in ":free" is dropped, so cost is structurally $0.
const DEFAULT_MODELS = ["apodex/apodex-1.1-mini:free", "inception/mercury-decide:free"];

// Effects the AI may set. No instant win/lose, jail, or party-member removal.
const EFFECT_KEYS = ["health", "morale", "supplies", "money", "partyHealth", "partyMorale", "miles", "milesBack", "stuckDays"];

const SKILLS = new Set([
  "hacking", "persuasion", "survival", "mechanical",
  "medical", "negotiation", "intimidation", "stealth"
]);

// Best-effort per-isolate limiter. Isolates are short-lived and per-location, so
// this is a speed bump, not a guarantee; the real limit arrives with the Workers
// migration (ratelimit binding). Free-only models cap the worst case at $0.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra }
  });
}

const str = (v, max) => (typeof v === "string" ? v.slice(0, max).replace(/[\u0000-\u001f]/g, " ") : "");
const int = (v, min, max) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : min;
};

function validateContext(raw) {
  if (!raw || typeof raw !== "object") return null;
  const location = str(raw.location, 120);
  if (!location) return null;
  return {
    location,
    locationType: raw.locationType === "city" ? "city" : "hostile",
    day: int(raw.day, 1, 999),
    health: int(raw.health, 0, 100),
    morale: int(raw.morale, 0, 100),
    supplies: int(raw.supplies, 0, 100),
    money: int(raw.money, 0, 100000),
    party: (Array.isArray(raw.party) ? raw.party : []).slice(0, 8).map(p => ({
      name: str(p?.name, 40),
      profession: str(p?.profession, 40)
    })),
    skills: (Array.isArray(raw.skills) ? raw.skills : []).filter(s => SKILLS.has(s)).slice(0, 8),
    recentLog: (Array.isArray(raw.recentLog) ? raw.recentLog : []).slice(-3).map(l => str(l, 200))
  };
}

function buildPrompt(c) {
  const state =
    `\n- Location: ${c.location} (Type: ${c.locationType})` +
    `\n- Day: ${c.day}` +
    `\n- Health: ${c.health}%` +
    `\n- Morale: ${c.morale}%` +
    `\n- Supplies: ${c.supplies}%` +
    `\n- Money: $${c.money}` +
    `\n- Party: ${c.party.map(p => `${p.name} (${p.profession})`).join(", ")}` +
    `\n- Skills: ${c.skills.join(", ")}` +
    `\n- Recent Log: ${c.recentLog.join(" | ")}`;

  return (
    "You are generating an impactful event for a dystopian Oregon Trail-style satire game.\n" +
    "Current game state:\n" + state + "\n" +
    "Describe the event in JSON format.\n" +
    "- The root object must have \"title\" (string), \"description\" (string), and \"choices\" (array of 2-4 objects).\n" +
    "- Each choice object must have \"text\" (string) and \"effect\" (object).\n" +
    "- Allowed effect keys: health, morale, supplies, money, partyHealth, partyMorale, miles, milesBack, stuckDays, message.\n\n" +
    "Rules:\n" +
    "- Be creative and avoid generic events. Create a unique, memorable, satirical scenario.\n" +
    "- Tailor to the current location and its type, with a tone of darkly humorous satire.\n" +
    "- Create special choices if the party has relevant skills (e.g., 'hacking', 'negotiation').\n" +
    "- If location type is \"city\", the event MUST be supportive. This is a Liberal Paradise. Offer rewards like money or supplies, or create positive social interactions.\n" +
    "- If location type is \"hostile\", the event MUST be dangerous and challenging. These are hostile territories.\n" +
    "- Vary events based on the recent log to avoid repetition.\n" +
    "- OUTPUT ONLY the JSON object. No markdown, no commentary."
  );
}

function pickEffect(e) {
  const out = {};
  if (!e || typeof e !== "object") return out;
  for (const k of EFFECT_KEYS) if (typeof e[k] === "number" && Number.isFinite(e[k])) out[k] = e[k];
  if (typeof e.message === "string") out.message = str(e.message, 300);
  return out;
}

function parseEvent(text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("empty");
  const t = text.replace(/```json|```/gi, "").trim();
  let obj;
  try {
    obj = JSON.parse(t);
  } catch {
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b <= a) throw new Error("unparseable");
    obj = JSON.parse(t.slice(a, b + 1));
  }
  if (!obj?.title || !obj?.description || !Array.isArray(obj?.choices) || obj.choices.length === 0) {
    throw new Error("missing fields");
  }
  // Only pass through the fields the game understands; the client sanitizes values.
  return {
    title: str(obj.title, 120),
    description: str(obj.description, 1200),
    choices: obj.choices.slice(0, 4).map(c => ({
      text: str(c?.text, 200) || "Choose",
      effect: pickEffect(c?.effect)
    }))
  };
}

async function callModel(model, prompt, apiKey, referer) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "Modern American Trail"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: MAX_TOKENS,
        temperature: 0.8
      })
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    return { event: parseEvent(data?.choices?.[0]?.message?.content), usage: data?.usage || null };
  } finally {
    clearTimeout(timer);
  }
}

export async function onRequestPost({ request, env }) {
  // Same-origin browsers only. (Spoofable by scripts, but it stops casual reuse.)
  const origin = request.headers.get("Origin");
  const self = new URL(request.url).origin;
  if (origin && origin !== self) return json({ error: "Forbidden" }, 403);

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (rateLimited(ip)) return json({ error: "Too many requests" }, 429, { "Retry-After": "60" });

  const lenHeader = Number(request.headers.get("Content-Length") || 0);
  if (lenHeader > MAX_BODY_BYTES) return json({ error: "Request too large" }, 413);
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "Request too large" }, 413);

  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: "Bad request" }, 400); }
  const context = validateContext(body?.context);
  if (!context) return json({ error: "Bad request" }, 400);

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) return json({ error: "AI unavailable" }, 503);

  const models = (env.OPENROUTER_MODELS ? env.OPENROUTER_MODELS.split(",") : DEFAULT_MODELS)
    .map(s => s.trim())
    .filter(m => /^[\w.-]+\/[\w.:-]+:free$/.test(m))
    .slice(0, MAX_MODEL_ATTEMPTS);
  if (models.length === 0) return json({ error: "AI unavailable" }, 503);

  const prompt = buildPrompt(context);
  for (const model of models) {
    try {
      const { event, usage } = await callModel(model, prompt, apiKey, self);
      return json({ event, model, usage });
    } catch (e) {
      console.warn(`event model ${model} failed: ${e?.message}`); // server log only
    }
  }
  return json({ error: "AI unavailable" }, 502);
}

// Any other method (including the old CORS preflight) is rejected.
export function onRequest() {
  return json({ error: "Method not allowed" }, 405, { Allow: "POST" });
}
