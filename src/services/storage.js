// Versioned save/load helpers using localStorage
const KEY = "trailgame.save.v2";


export function saveGame(state) {
const snapshot = {
...state,
_meta: { version: 2, savedAt: new Date().toISOString() }
};
try {
localStorage.setItem(KEY, JSON.stringify(snapshot));
} catch (e) {
console.warn("Save failed:", e);
}
}


export function hasSave() {
try {
return !!localStorage.getItem(KEY);
} catch {
return false;
}
}


export function loadGame() {
try {
const raw = localStorage.getItem(KEY);
if (!raw) return null;
const parsed = JSON.parse(raw);
// Ensure new fields exist
parsed._meta ||= { version: 2, savedAt: new Date().toISOString() };
parsed.jail ||= { isJailed: false, daysInJail: 0, maxJailDays: 5, escapeChancePerDay: 0.35 };
parsed.aiStats ||= { promptsViaAI: 0, promptsHardcoded: 0, tokensPrompt: 0, tokensCompletion: 0 };
return parsed;
} catch (e) {
console.error("Load failed:", e);
return null;
}
}


export function clearSave() {
try {
localStorage.removeItem(KEY);
} catch {}
}
