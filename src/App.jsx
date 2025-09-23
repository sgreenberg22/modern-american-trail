import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, Heart, Battery, DollarSign, Users, MapPin, Settings,
  ShoppingCart, Package, Zap, Save, Upload, Map as MapIcon
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Server helpers (Cloudflare Pages Functions)                        */
/* ------------------------------------------------------------------ */
async function chat({ model, messages, max_tokens = 700, temperature = 0.7 }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, max_tokens, temperature })
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || res.statusText;
    throw new Error(msg || "OpenRouter error");
  }
  return data;
}

function parseJSONFromText(text) {
  if (!text || typeof text !== "string") throw new Error("Empty response");
  let t = text.trim();
  t = t.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(t);
  } catch {
    const first = t.indexOf("{");
    const last = t.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try { return JSON.parse(t.slice(first, last + 1)); } catch {}
    }
    throw new Error("Could not parse JSON from model response");
  }
}

/* ------------------------------------------------------------------ */
/* Free models (fallback if /api/models not configured)                */
/* ------------------------------------------------------------------ */
const FALLBACK_FREE_MODELS = [
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (Free)", healthy: true },
  { id: "huggingfaceh4/zephyr-7b-beta:free", name: "Zephyr 7B (Free)", healthy: true },
  { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini 128k (Free)", healthy: true },
  { id: "qwen/qwen-2-7b-instruct:free", name: "Qwen 2 7B (Free)", healthy: true },
  { id: "openchat/openchat-7b:free", name: "OpenChat 7B (Free)", healthy: true }
];

/* ------------------------------------------------------------------ */
/* Save / Load helpers                                                 */
/* ------------------------------------------------------------------ */
const SAVE_KEY = "modern_trail.save.v2";

function saveToLocal(state) {
  try {
    const snapshot = { ...state, _meta: { version: 2, savedAt: new Date().toISOString() } };
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    console.warn("Save failed:", e);
  }
}
function hasLocalSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
}
function loadFromLocal() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // minimum migrations
    parsed._meta ||= { version: 2, savedAt: new Date().toISOString() };
    parsed.apiStats ||= { connected: false, totalCalls: 0, successfulCalls: 0, failedCalls: 0, totalTokensUsed: 0, lastCallTime: null, currentModel: parsed.selectedModel, lastError: null, tokensPrompt: 0, tokensCompletion: 0, promptsViaAI: 0, promptsHardcoded: 0 };
    parsed.jailDays ||= 0;
    parsed.jailMaxDays ||= 5;
    parsed.jailEscapeBase ||= 0.35;
    return parsed;
  } catch (e) {
    console.error("Load failed:", e);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Game setup                                                          */
/* ------------------------------------------------------------------ */
function generateLocations() {
  const baseLocations = [
    "Liberal Enclave of Portland",
    "The Censored City (formerly Seattle)",
    "Book Burning Fields of Idaho",
    "Surveillance State of Montana",
    "The Great Wall of North Dakota",
    "Ministry of Truth (Minnesota)",
    "Re-education Camps of Wisconsin",
    "Thought Police Headquarters (Illinois)",
    "Corporate Theocracy of Indiana",
    "Bible Belt Checkpoint (Kentucky)",
    "Coal Rolling Capital (West Virginia)",
    "Confederate Memorial Highway (Virginia)",
    "Freedom™ Processing Center (Maryland)",
    "The Last Stand (Pennsylvania)",
    "Safe Haven of Vermont"
  ];

  const suffixes = [
    "Checkpoint Alpha","Detention Center","Propaganda Station","Truth Verification Point",
    "Loyalty Testing Facility","Patriotism Academy","Freedom™ Outpost","Border Patrol Zone",
    "Corporate Compound","Indoctrination Hub","Surveillance Nexus","Control Point",
    "Compliance Center","Authority Station","Regime Outpost","Order Facility"
  ];

  const out = [];
  for (let i = 0; i < baseLocations.length - 1; i++) {
    out.push(baseLocations[i]);
    const n = 2 + Math.floor(Math.random() * 3);
    for (let j = 0; j < n; j++) {
      const s = suffixes[Math.floor(Math.random() * suffixes.length)];
      out.push(`${s} ${String.fromCharCode(65 + i)}-${j + 1}`);
    }
  }
  out.push(baseLocations[baseLocations.length - 1]);
  return out;
}

const EFFECT_LIMITS = {
  percent: { min: -100, max: 100 },
  money: { min: -1000, max: 2000 },
  milesForward: { min: 0, max: 150 },
  milesBack: { min: 0, max: 150 },
  stuckDays: { min: 0, max: 5 }
};

function sanitizeEffect(raw = {}) {
  const e = { ...raw };
  const num = (v, d = 0) => (typeof v === "number" && isFinite(v) ? v : d);
  const clamp = (v, { min, max }) => Math.max(min, Math.min(max, v));
  const pct = (v) => clamp(num(v), EFFECT_LIMITS.percent);

  return {
    health: pct(e.health || 0),
    morale: pct(e.morale || 0),
    supplies: pct(e.supplies || 0),
    money: clamp(num(e.money || 0), EFFECT_LIMITS.money),
    partyHealth: pct(e.partyHealth || 0),
    partyMorale: pct(e.partyMorale || 0),
    miles: clamp(num(e.miles || 0), EFFECT_LIMITS.milesForward),
    milesBack: clamp(num(e.milesBack || 0), EFFECT_LIMITS.milesBack),
    stuckDays: clamp(num(e.stuckDays || 0), EFFECT_LIMITS.stuckDays),
    sendToJail: Boolean(e.sendToJail || false),
    partyMemberLoss: Boolean(e.partyMemberLoss || false),
    endGame: e.endGame === "win" || e.endGame === "lose" ? e.endGame : null,
    message: typeof e.message === "string" ? e.message : ""
  };
}

function newGameState(defaultModelId) {
  const defaultModel = defaultModelId || FALLBACK_FREE_MODELS[0].id;
  return {
    locations: generateLocations(),
    currentLocationIndex: 0,
    destination: "Safe Haven of Vermont",
    day: 1,
    health: 100,
    morale: 75,
    supplies: 80,
    money: 500,
    party: [
      { name: "Alex", profession: "Former Tech Worker", health: 100, morale: 75 },
      { name: "Jordan", profession: "Banned Teacher", health: 100, morale: 75 },
      { name: "Sam", profession: "Fact-Checker", health: 100, morale: 75 }
    ],
    gameLog: [],
    currentEvent: null,
    isLoading: false,
    selectedModel: defaultModel,
    showSettings: false,
    showShop: false,
    showMap: false,
    lastError: null,
    totalDistance: 0,
    distanceToNext: Math.floor(Math.random() * 50) + 30,
    milesPerDay: 0,
    gameStartTime: Date.now(),
    difficulty: "normal",
    stuckDays: 0,
    jailed: false,
    jailDays: 0,          // ✅ days served in jail
    jailMaxDays: 5,       // ✅ guaranteed release
    jailEscapeBase: 0.35, // ✅ base escape chance first jail day
    lastOutcome: null,
    apiStats: {
      connected: false,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalTokensUsed: 0,
      tokensPrompt: 0,          // ✅ new
      tokensCompletion: 0,      // ✅ new
      promptsViaAI: 0,          // ✅ new
      promptsHardcoded: 0,      // ✅ new
      lastCallTime: null,
      currentModel: defaultModel,
      lastError: null
    },
    _meta: { version: 2, savedAt: new Date().toISOString() }
  };
}

/* ------------------------------------------------------------------ */
/* UI helpers                                                          */
/* ------------------------------------------------------------------ */
function Stat({ label, value, max = 100, icon: Icon, color = "#999" }) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <div style={card()}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ padding: 6, borderRadius: 10, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(2px)" }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ fontSize: 13, color: "#cfd6e4" }}>{label}</div>
        <div style={{ marginLeft: "auto", fontWeight: 800, color }}>
          {max === 100 ? `${value}%` : value}
        </div>
      </div>
      <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%", transition: "width .35s ease" }} />
      </div>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
function btn(bg = "#2b2f44") {
  return {
    background: bg,
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#fff",
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
    transition: "transform .1s ease, opacity .2s ease",
  };
}
function primaryBtn() {
  return {
    ...btn("linear-gradient(90deg,#f43f5e,#f97316,#22c55e)"),
    border: "none",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)"
  };
}
function chip(bg = "#0b1220") {
  return {
    padding: "6px 10px",
    background: bg,
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 999,
    fontSize: 12
  };
}
function card() {
