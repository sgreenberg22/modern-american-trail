// Wrap LLM calls and collect usage stats (prompt/completion tokens).
// Adjust the endpoint to match your Cloudflare Pages Function path.
const API = "/api/ai"; // your existing proxy path


// In-memory counters (replace with store if you have one)
export const aiStats = {
promptsViaAI: 0,
promptsHardcoded: 0,
tokensPrompt: 0,
tokensCompletion: 0
};


export async function callAI(payload) {
const res = await fetch(API, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload)
});
let json = null;
try { json = await res.json(); } catch {}


// OpenAI-style usage object if provided by your proxy
const usage = json?.usage || {};
aiStats.tokensPrompt += usage.prompt_tokens || 0;
aiStats.tokensCompletion += usage.completion_tokens || 0;
aiStats.promptsViaAI += 1;
return json;
}


export function markHardcodedFallback() {
aiStats.promptsHardcoded += 1;
}


export function getAIRatio() {
const denom = aiStats.promptsViaAI + aiStats.promptsHardcoded;
return denom === 0 ? 1 : aiStats.promptsViaAI / denom;
}
