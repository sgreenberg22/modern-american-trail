/**
 * Cloudflare Pages Function: /api/chat
 * Proxies browser requests to OpenRouter without exposing your API key.
 * Set OPENROUTER_API_KEY as a Pages secret in the Cloudflare dashboard.
 */
export const onRequest = async ({ request, env }) => {
  // CORS (safe since frontend and function live on same origin; this is just being explicit)
  const origin = new URL(request.url).origin;
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: "Server is missing OPENROUTER_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const {
    model = "meta-llama/llama-3.1-8b-instruct:free",
    messages = [],
    max_tokens = 600,
    temperature = 0.8,
    top_p = 0.95,
  } = payload || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages[] is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": env.SITE_URL || origin, // helps with OpenRouter rate-limits/domain tracking
        "X-Title": "Modern American Trail",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature,
        top_p,
      }),
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ error: "Non-JSON response from OpenRouter", body: text.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!res.ok) {
      return new Response(JSON.stringify({ error: json.error || json }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Upstream fetch failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};
