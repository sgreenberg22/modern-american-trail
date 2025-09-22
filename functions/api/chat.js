// functions/api/chat.js
// Server-side proxy to OpenRouter so your browser never sees the API key.

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { model, messages, max_tokens = 700, temperature = 0.7 } = await request.json();

    if (!model || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Missing model or messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server missing OPENROUTER_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const referer = request.headers.get("origin") || "https://pages.dev";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "Modern American Trail"
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature
      })
    });

    const text = await res.text(); // pass through raw
    if (!res.ok) {
      // Try to extract OpenRouter error message for easier debugging
      let message = `OpenRouter error (${res.status})`;
      try {
        const j = JSON.parse(text);
        message = j?.error?.message || j?.message || message;
      } catch {
        message = `${message}: ${text}`;
      }
      return new Response(JSON.stringify({ error: message }), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(text, { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Unhandled error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
