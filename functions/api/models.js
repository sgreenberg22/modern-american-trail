// functions/api/models.js
// Returns a short list of free OpenRouter models and probes which ones actually work.
// Response: { models: [{ id, name, healthy: boolean }] }

export async function onRequestGet(context) {
  const { env, request } = context;
  const apiKey = env.OPENROUTER_API_KEY || "";
  const referer = new URL(request.url).origin || "https://pages.dev";

  async function getFreeModels() {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models");
      if (!response.ok) return [];

      const { data } = await response.json();
      if (!Array.isArray(data)) return [];

      return data
        .filter(model => model.id.endsWith(":free"))
        .map(model => ({
          id: model.id,
          name: model.name.replace(/:free/i, " (Free)").trim()
        }));
    } catch (error) {
      console.error("Failed to fetch models from OpenRouter:", error);
      return [];
    }
  }

  const candidates = await getFreeModels();

  // Probe a model with a tiny completion; returns { ok, latency }
  async function probe(modelId) {
    if (!apiKey) return { ok: false, latency: Infinity };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 4000);
    const start = performance.now();

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": referer,
          "X-Title": "Modern American Trail (probe)"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: "Respond with only: OK" }],
          max_tokens: 4,
          temperature: 0
        })
      });

      const latency = performance.now() - start;
      const data = await res.json().catch(() => ({}));
      const text = (data?.choices?.[0]?.message?.content || "").trim();
      const ok = res.ok && /^OK$/i.test(text);
      return { ok, latency };
    } catch {
      return { ok: false, latency: Infinity };
    } finally {
      clearTimeout(timeout);
    }
  }

  // Default: assume unhealthy; then probe, filter, and sort (if API key present)
  let models = [];

  if (apiKey) {
    const results = await Promise.allSettled(candidates.map(m => probe(m.id)));
    const probedModels = results.map((r, i) => {
      const candidate = candidates[i];
      if (r.status === "fulfilled") {
        return { ...candidate, healthy: r.value.ok, latency: r.value.latency };
      }
      return { ...candidate, healthy: false, latency: Infinity }; // Probe failed
    });

    // Filter for healthy models, sort by latency, take top 3
    models = probedModels
      .filter(m => m.healthy)
      .sort((a, b) => a.latency - b.latency)
      .slice(0, 3);
  }

  return new Response(JSON.stringify({ models }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function onRequestOptions() {
  // CORS preflight (mostly unnecessary for same-origin, but harmless)
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
