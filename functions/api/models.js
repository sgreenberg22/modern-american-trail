// functions/api/models.js
// Returns a short list of free OpenRouter models and probes which ones actually work.
// Response: { models: [{ id, name, healthy: boolean }] }

export async function onRequestGet(context) {
  const { env, request } = context;
  const apiKey = env.OPENROUTER_API_KEY || "";
  const referer = new URL(request.url).origin || "https://pages.dev";

  // Curated free models that most reliably have free capacity
  const candidates = [
    { id: "deepseek/deepseek-r1-0528:free", name: "DeepSeek R1 0528 (Free)" },
    { id: "deepseek/deepseek-chat-v3-0324:free", name: "DeepSeek Chat v3 0324 (Free)" },
    { id: "tngtech/deepseek-r1t-chimera:free", name: "DeepSeek R1T Chimera (Free)" },
    { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (Free)" },
    { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Exp (Free)" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct (Free)" },
    { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", name: "Dolphin Mistral 24B Venice (Free)" },
    { id: "mistralai/mistral-small-3.2-24b-instruct:free", name: "Mistral Small 3.2 24B Instruct (Free)" },
    { id: "openai/gpt-oss-20b:free", name: "GPT-OSS 20B (Free)" },
    { id: "deepseek/deepseek-r1-distill-llama-70b:free", name: "DeepSeek R1 Distill Llama 70B (Free)" },
    { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick (Free)" },
    { id: "meta-llama/llama-4-scout:free", name: "Llama 4 Scout (Free)" },
    { id: "meta-llama/llama-3.3-8b-instruct:free", name: "Llama 3.3 8B Instruct (Free)" }
  ];

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
