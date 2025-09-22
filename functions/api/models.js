/**
 * Cloudflare Pages Function: /api/models
 * Returns ONLY free chat models from OpenRouter.
 */
export const onRequest = async ({ request, env }) => {
  const origin = new URL(request.url).origin;
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY || ""}`,
        "HTTP-Referer": env.SITE_URL || origin,
        "X-Title": "Modern American Trail",
      },
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch {
      return new Response(JSON.stringify({ error: "Bad upstream response", body: text.slice(0, 400) }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const models = Array.isArray(json?.data) ? json.data : [];

    // Heuristics for "free": ID tagged :free OR zero pricing reported
    const isZero = (x) => x === 0 || x === "0" || x === "0.0" || x === "0.000000";
    const freeOnly = models
      .filter(m => {
        const id = m?.id || "";
        const pricing = m?.pricing || {};
        const zeroish = isZero(pricing.prompt) && isZero(pricing.completion);
        // filter to chat-capable where possible; otherwise pass through
        return id.includes(":free") || zeroish;
      })
      // Avoid the currently-problematic default you hit
      .filter(m => m.id !== "meta-llama/llama-3.1-8b-instruct:free")
      .map(m => ({ id: m.id, name: m.name || m.id }))
      // uniqueness + sort
      .filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i)
      .sort((a, b) => a.name.localeCompare(b.name));

    return new Response(JSON.stringify({ models: freeOnly }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Fetch failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};
