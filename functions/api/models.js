// functions/api/models.js

const ALLOWLIST = [
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (Free)" },
  { id: "huggingfaceh4/zephyr-7b-beta:free", name: "Zephyr 7B (Free)" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini 128k (Free)" },
  { id: "qwen/qwen-2-7b-instruct:free", name: "Qwen 2 7B (Free)" },
  { id: "openchat/openchat-7b:free", name: "OpenChat 7B (Free)" }
];

let CACHE = { at: 0, models: null };
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function onRequestGet({ env }) {
  try {
    const now = Date.now();
    if (CACHE.models && (now - CACHE.at) < TTL_MS) {
      return json({ models: CACHE.models, cached: true });
    }

    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // No key? Just return the allowlist (client will still rotate on failure)
      return json({ models: ALLOWLIST });
    }

    // Start from allowlist; intersect with OpenRouter catalog if possible
    let candidates = [...ALLOWLIST];
    try {
      const r = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      if (r.ok) {
        const j = await r.json();
        const ids = new Set((j?.data || j?.models || []).map(m => m.id));
        if (ids.size) candidates = candidates.filter(m => ids.has(m.id));
      }
    } catch { /* ignore */ }

    // Probe candidates with a tiny chat call
    const probes = await Promise.all(candidates.map(m => probeModel(apiKey, m.id)));
    const healthy = candidates
      .map((m, i) => ({ ...m, healthy: probes[i].ok, latencyMs: probes[i].ms }))
      .filter(m => m.healthy);

    // Fallback: if none respond, at least return 1–2 models so UI isn't empty
    const result = healthy.length ? healthy : candidates.slice(0, 2).map(m => ({ ...m, healthy: false }));

    CACHE = { at: now, models: result };
    return json({ models: result, cached: false });
  } catch {
    return json({ models: ALLOWLIST });
  }
}

async function probeModel(apiKey, modelId) {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 4000);
  const started = Date.now();
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pages.dev",
        "X-Title": "Modern American Trail (model probe)"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: "OK" }],
        max_tokens: 1,
        temperature: 0
      })
    });
    clearTimeout(to);
    const ms = Date.now() - started;
    return { ok: r.ok, ms };
  } catch {
    clearTimeout(to);
    return { ok: false, ms: Date.now() - started };
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    stat
