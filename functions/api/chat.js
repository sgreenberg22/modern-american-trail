// functions/api/chat.js
export const onRequest = async ({ request, env }) => {
  const origin = new URL(request.url).origin;
  const cors = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: cors
    });
  }

  if (!env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: "Server is missing OPENROUTER_API_KEY" }), {
      status: 500,
      headers: cors
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: cors
    });
  }

  const { model, messages, max_tokens = 700, ...rest } = payload || {};
  if (!model || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Missing model or messages[]" }), {
      status: 400,
      headers: cors
    });
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.SITE_URL || origin,   // helpful for OpenRouter routing
        "X-Title": "Modern American Trail"
      },
      body: JSON.stringify({ model, messages, max_tokens, ...rest })
    });

    const text = await upstream.text();
    let json;
    try { json = JSON.parse(text); } catch {
      return new Response(JSON.stringify({ error: "Bad upstream response", body: text.slice(0, 400) }), {
        status: 502, headers: cors
      });
    }

    if (!upstream.ok) {
      const message = json?.error?.message || jso
