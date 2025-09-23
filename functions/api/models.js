// functions/api/models.js
// Returns a short list of free OpenRouter models and probes which ones actually work.
// Response: { models: [{ id, name, healthy: boolean }] }

export async function onRequestGet(context) {
  const { env, request } = context;
  const apiKey = env.OPENROUTER_API_KEY || "";
  const referer = new URL(request.url).origin || "https://pages.dev";

  // Curated free models that most reliably have free capacity
  const candidates = [
    { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (Free)" },
    { id: "huggingfaceh4/zephyr-7b-beta:free", name: "Zephyr 7B (Free)" },
    { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini 128k (Free)" },
    { id: "qwen/qwen-2-7b-instruct:free", name: "Qwen 2 7B (Free)" },
    { id: "openchat/openchat-7b:free", name: "OpenChat 7B (Free)" },
    { id: "x-ai/grok-4-fast:free", name: "Grok-4-Fast (Free)" }
  ];

  // Probe a model with a tiny completion; mark healthy if we get "OK"
  async function probe(modelId) {
    if (!apiKey) return false;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 4000);

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

      // Some errors still return JSON; guard parsing
      const data = await res.json().catch(() => ({}));
      const text = (data?.choices?.[0]?.message?.content || "").trim();
      return res.ok && /^OK$/i.test(text);
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Default: assume unhealthy; then probe (if API key present)
  let models = candidates.map(m => ({ ...m, healthy: false }));

  if (apiKey) {
    const results = await Promise.allSettled(models.map(m => probe(m.id)));
    models = models.map((m, i) => {
      const r = results[i];
      const ok = r.status === "fulfilled" && r.value === true;
      return { ...m, healthy: ok };
    });
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
