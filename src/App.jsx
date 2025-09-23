import React, { useEffect, useMemo, useRef, useState } from "react";
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
    lastOutcome: null,
    apiStats: {
      connected: false,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalTokensUsed: 0,
      tokensPrompt: 0,
      tokensCompletion: 0,
      aiPrompts: 0,
      hardcodedPrompts: 0,
      lastCallTime: null,
      currentModel: defaultModel,
      lastError: null
    }
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
  return {
    background: "rgba(12,18,32,0.75)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    backdropFilter: "blur(6px)"
  };
}
function modalBackdrop() {
  return { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 };
}
function modal(opts = {}) {
  return { width: "100%", maxWidth: opts.maxWidth || 720, background: "rgba(12,18,32,0.9)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 16, backdropFilter: "blur(10px)" };
}

/* ------------------------------------------------------------------ */
/* Shop                                                                */
/* ------------------------------------------------------------------ */
const shopItems = [
  { id: "supplies", name: "Underground Rations", description: "Black market food supplies to keep your party fed.", basePrice: 50, effect: { supplies: 30 }, icon: Package },
  { id: "medicine", name: "Bootleg Medicine", description: "Illegal healthcare supplies (banned by the regime).", basePrice: 80, effect: { health: 25, partyHealth: 15 }, icon: Heart },
  { id: "morale_boost", name: "Forbidden Books", description: "Banned literature to boost party morale.", basePrice: 40, effect: { morale: 20, partyMorale: 10 }, icon: Battery },
  { id: "energy_drink", name: "Resistance Energy Drink", description: "Caffeinated rebellion in a can.", basePrice: 25, effect: { health: 10, morale: 10 }, icon: Zap },
  { id: "survival_kit", name: "Prepper's Survival Kit", description: "Everything you need to survive the wasteland.", basePrice: 150, effect: { supplies: 40, health: 15, partyHealth: 10 }, icon: AlertCircle }
];

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */
export default function App() {
  const [models, setModels] = useState(FALLBACK_FREE_MODELS);
  const [modelsLoading, setModelsLoading] = useState(true);

  const initialModelId = useMemo(() => {
    const healthy = models.find(m => m.healthy) || models[0];
    return healthy?.id || FALLBACK_FREE_MODELS[0].id;
  }, [models]);

  const [g, setG] = useState(() => newGameState(initialModelId));

  const fileInputRef = useRef(null);

  const currentLocation = g.locations[g.currentLocationIndex];
  const progressPct = Math.round((g.currentLocationIndex / (g.locations.length - 1)) * 100);
  const isWin = currentLocation === "Safe Haven of Vermont" && g.health > 0;
  const isGameOver = g.health <= 0 || currentLocation === "Safe Haven of Vermont" || g.party.every(p => p.health <= 0);

  useEffect(() => {
    (async () => {
      try {
        setModelsLoading(true);
        const r = await fetch("/api/models");
        const j = await r.json().catch(() => ({}));
        const list = Array.isArray(j?.models) ? j.models : [];
        if (list.length > 0) {
          const healthy = list.filter(m => m.healthy);
          const next = healthy.length > 0 ? healthy : list;
          setModels(next);
          setG(prev => {
            const has = next.some(m => m.id === prev.selectedModel);
            const nextId = has ? prev.selectedModel : (next.find(m => m.healthy)?.id || next[0].id);
            return { ...prev, selectedModel: nextId, apiStats: { ...prev.apiStats, currentModel: nextId } };
          });
        }
      } catch {
        // keep fallback
      } finally {
        setModelsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setG(prev => {
      if (!prev.selectedModel) {
        const healthy = models.find(m => m.healthy) || models[0];
        const id = healthy?.id || FALLBACK_FREE_MODELS[0].id;
        return { ...prev, selectedModel: id, apiStats: { ...prev.apiStats, currentModel: id } };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]);

  async function testAPIConnection() {
    setG(prev => ({ ...prev, apiStats: { ...prev.apiStats, lastError: "Testing connection..." } }));
    try {
      const data = await chat({
        model: g.selectedModel,
        messages: [{ role: "user", content: "Respond with only: OK" }],
        max_tokens: 5,
        temperature: 0
      });
      const text = data?.choices?.[0]?.message?.content?.trim() || "";
      const ok = /^OK$/i.test(text);
      setG(prev => ({
        ...prev,
        apiStats: {
          ...prev.apiStats,
          connected: ok,
          lastError: ok ? null : `Unexpected response: ${text || "(empty)"}`,
          totalCalls: prev.apiStats.totalCalls + 1,
          successfulCalls: prev.apiStats.successfulCalls + (ok ? 1 : 0),
          failedCalls: prev.apiStats.failedCalls + (ok ? 0 : 1),
          lastCallTime: new Date().toLocaleTimeString(),
          currentModel: g.selectedModel,
          totalTokensUsed: prev.apiStats.totalTokensUsed + (data?.usage?.total_tokens || 5),
          tokensPrompt: prev.apiStats.tokensPrompt + (data?.usage?.prompt_tokens || 0),
          tokensCompletion: prev.apiStats.tokensCompletion + (data?.usage?.completion_tokens || 0),
        }
      }));
    } catch (e) {
      const msg = e?.message || "Connection failed";
      const noEndpoints = /no endpoints found|no endpoint/i.test(msg);
      setG(prev => {
        let nextModel = prev.selectedModel;
        const idx = models.findIndex(m => m.id === prev.selectedModel);
        if (noEndpoints && models.length > 1) {
          nextModel = models[(idx + 1) % models.length].id;
        }
        return {
          ...prev,
          selectedModel: nextModel,
          apiStats: {
            ...prev.apiStats,
            connected: false,
            lastError: msg + (noEndpoints ? " (switched/try another free model)" : ""),
            totalCalls: prev.apiStats.totalCalls + 1,
            failedCalls: prev.apiStats.failedCalls + 1,
            lastCallTime: new Date().toLocaleTimeString()
          }
        };
      });
    }
  }

  function outcomeSummary(effect) {
    const parts = [];
    if (effect.health) parts.push(`Health ${effect.health > 0 ? "+" : ""}${effect.health}%`);
    if (effect.morale) parts.push(`Morale ${effect.morale > 0 ? "+" : ""}${effect.morale}%`);
    if (effect.supplies) parts.push(`Supplies ${effect.supplies > 0 ? "+" : ""}${effect.supplies}%`);
    if (effect.money) parts.push(`Money ${effect.money > 0 ? "+" : ""}$${Math.abs(effect.money)}`);
    if (effect.partyHealth) parts.push(`Party health ${effect.partyHealth > 0 ? "+" : ""}${effect.partyHealth}%`);
    if (effect.partyMorale) parts.push(`Party morale ${effect.partyMorale > 0 ? "+" : ""}${effect.partyMorale}%`);
    if (effect.miles) parts.push(`Forward +${effect.miles} miles`);
    if (effect.milesBack) parts.push(`Backtrack +${effect.milesBack} miles`);
    if (effect.stuckDays) parts.push(`Stuck ${effect.stuckDays} day(s)`);
    if (effect.sendToJail) parts.push(`Jailed`);
    if (effect.partyMemberLoss) parts.push(`A party member leaves`);
    if (effect.endGame) parts.push(`End: ${effect.endGame}`);
    return parts.join(" • ");
  }

  function applyMovementAndStatus(prev, effect) {
    let { currentLocationIndex, distanceToNext, totalDistance, stuckDays, jailed } = prev;

    if (effect.milesBack > 0) {
      distanceToNext += effect.milesBack;
      totalDistance = Math.max(0, totalDistance - effect.milesBack);
      const avgLeg = 80;
      while (distanceToNext > avgLeg && currentLocationIndex > 0) {
        currentLocationIndex -= 1;
        distanceToNext -= avgLeg;
      }
    }

    if (effect.miles > 0) {
      distanceToNext = Math.max(0, distanceToNext - effect.miles);
      totalDistance += effect.miles;
      if (distanceToNext === 0 && currentLocationIndex < prev.locations.length - 1) {
        currentLocationIndex += 1;
        distanceToNext = Math.floor(Math.random() * 60) + 40;
      }
    }

    if (effect.stuckDays > 0) stuckDays += effect.stuckDays;
    if (effect.sendToJail) { jailed = true; stuckDays = Math.max(stuckDays, 2); }

    if (effect.endGame === "win") {
      currentLocationIndex = prev.locations.length - 1;
      distanceToNext = 0;
    }

    return { currentLocationIndex, distanceToNext, totalDistance, stuckDays, jailed };
  }

  function maybeCascadingEvent(choiceText, stateAfterChoice) {
    const r = Math.random();

    if (stateAfterChoice.health < 30 && r < 0.35) {
      return {
        title: "Medical Emergency",
        description: "A party member collapses. The regime's healthcare restrictions make help risky.",
        choices: [
          { text: "Visit underground clinic", effect: { health: 20, money: -150, supplies: -10, message: "The black market doctor helps, at a cost." } },
          { text: "Patch them up yourself", effect: { health: -10, supplies: -15, partyHealth: -10, message: "You do what you can. It's not enough." } }
        ]
      };
    }

    if (stateAfterChoice.supplies < 20 && r < 0.45) {
      return {
        title: "Starvation Crisis",
        description: "Hunger clouds judgement. You need food fast.",
        choices: [
          { text: "Raid an abandoned store", effect: { supplies: 30, health: -5, milesBack: 10, message: "You find some expired food, and draw attention." } },
          { text: "Beg other travelers", effect: { supplies: 15, morale: -15, partyMorale: -10, message: "Pride suffers, stomachs don’t." } }
        ]
      };
    }

    if (/(bribe|hack|steal|sabotage|resist|fight)/i.test(choiceText) && r < 0.35) {
      return {
        title: "Authorities On Your Tail",
        description: "Your actions were reported. Enforcers are closing in.",
        choices: [
          { text: "Lay low and change routes", effect: { milesBack: 30, supplies: -10, morale: -5, message: "You buy time, but lose ground." } },
          { text: "Floor it", effect: { health: -10, supplies: -10, miles: 20, message: "The chase is brutal, but you gain distance." } }
        ]
      };
    }

    return null;
  }

  function buildOutcomeDetails(prev, after, eff, movedIndexDelta) {
    const lines = [];
    const arrow = (v) => (v > 0 ? "▲" : "▼");

    if (eff.health) lines.push(`Health: ${after.health}% (${arrow(eff.health)}${Math.abs(eff.health)}%)`);
    if (eff.morale) lines.push(`Morale: ${after.morale}% (${arrow(eff.morale)}${Math.abs(eff.morale)}%)`);
    if (eff.supplies) lines.push(`Supplies: ${after.supplies}% (${arrow(eff.supplies)}${Math.abs(eff.supplies)}%)`);
    if (eff.money) {
      const sign = eff.money > 0 ? "+" : "-";
      lines.push(`Money: $${after.money} (${sign}$${Math.abs(eff.money)})`);
    }

    if (eff.partyHealth) lines.push(`Party health: ${arrow(eff.partyHealth)}${Math.abs(eff.partyHealth)}% each`);
    if (eff.partyMorale) lines.push(`Party morale: ${arrow(eff.partyMorale)}${Math.abs(eff.partyMorale)}% each`);
    if (eff.partyMemberLoss) lines.push("A party member left the group.");

    if (eff.miles) lines.push(`Advanced ${eff.miles} mile${eff.miles === 1 ? "" : "s"}.`);
    if (eff.milesBack) lines.push(`Backtracked ${eff.milesBack} mile${eff.milesBack === 1 ? "" : "s"}.`);
    if (movedIndexDelta > 0) {
      const newLoc = after.locations[after.currentLocationIndex];
      lines.push(`Arrived at ${newLoc}.`);
    }
    if (eff.stuckDays) lines.push(`You are stuck for ${eff.stuckDays} day${eff.stuckDays === 1 ? "" : "s"}.`);
    if (eff.sendToJail) lines.push("You were jailed. Travel disabled until release.");
    if (eff.endGame === "win") lines.push("You reached your destination!");
    if (eff.endGame === "lose") lines.push("You perished.");

    if (eff.message) lines.unshift(eff.message);

    return lines;
  }

  async function generateEvent() {
    setG(prev => ({ ...prev, isLoading: true, lastError: null }));
    try {
      const stateForPrompt = {
        location: currentLocation,
        day: g.day,
        health: g.health,
        morale: g.morale,
        supplies: g.supplies,
        money: g.money,
        partyMembers: g.party.map(p => `${p.name} (${p.profession}, Health: ${p.health}%, Morale: ${p.morale}%)`).join(", "),
        distanceToNext: g.distanceToNext,
        totalDistance: g.totalDistance,
        difficulty: g.difficulty,
        stuckDays: g.stuckDays,
        jailed: g.jailed
      };

      const schema = `Use ONLY this JSON shape:
{
  "title": "string",
  "description": "2-3 sentences of satirical narrative",
  "choices": [
    {
      "text": "string",
      "effect": {
        "health": -20..20,
        "morale": -25..25,
        "supplies": -50..50,
        "money": -500..500,
        "partyHealth": -20..20,
        "partyMorale": -20..20,
        "miles": 0..100,
        "milesBack": 0..100,
        "stuckDays": 0..3,
        "sendToJail": true|false,
        "partyMemberLoss": true|false,
        "endGame": "win"|"lose"|null,
        "message": "short outcome line"
      }
    }
  ]
}
Rules:
- At least ONE of: miles, milesBack, stuckDays, sendToJail, partyHealth/partyMorale, or endGame MUST be impactful (>0 or true).
- Keep numbers proportional to the current state (avoid lethal spikes if health/morale already low).
- Avoid jailing events in the first 3 days under any circumstance.
- Tailor to location "${currentLocation}" and tone: darkly humorous satire of authoritarian conservatism.
- OUTPUT ONLY JSON. No markdown.`;

      const prompt = `You are generating an impactful event for a dystopian Oregon Trail-style satire game, "The Modern American Trail" in ${new Date().getFullYear() + 1}.
Current game state: ${JSON.stringify(stateForPrompt)}
${schema}`;

      const data = await chat({
        model: g.selectedModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 900,
        temperature: 0.8
      });

      const text = data?.choices?.[0]?.message?.content ?? "";
      const eventData = parseJSONFromText(text);
      if (!eventData?.title || !eventData?.description || !Array.isArray(eventData?.choices)) {
        throw new Error("Event missing required fields");
      }

      eventData.choices = eventData.choices.map(c => ({
        text: String(c?.text || "Choose"),
        effect: sanitizeEffect(c?.effect || {})
      }));

      setG(prev => ({
        ...prev,
        currentEvent: eventData,
        isLoading: false,
        apiStats: {
          ...prev.apiStats,
          connected: true,
          totalCalls: prev.apiStats.totalCalls + 1,
          successfulCalls: prev.apiStats.successfulCalls + 1,
          aiPrompts: prev.apiStats.aiPrompts + 1,
          totalTokensUsed: prev.apiStats.totalTokensUsed + (data?.usage?.total_tokens || 0),
          tokensPrompt: prev.apiStats.tokensPrompt + (data?.usage?.prompt_tokens || 0),
          tokensCompletion: prev.apiStats.tokensCompletion + (data?.usage?.completion_tokens || 0),
          lastCallTime: new Date().toLocaleTimeString()
        }
      }));
    } catch (e) {
      const fallbackEvents = [
        {
          title: "Mandatory Patriotism Test",
          description: `At ${currentLocation}, officials demand you prove your loyalty by reciting the pledge to a flag made entirely of corporate logos.`,
          choices: [
            { text: "Recite with exaggerated enthusiasm", effect: { health: 0, morale: -10, partyMorale: -5, miles: 5, message: "You pass the test but feel your soul shrinking." } },
            { text: "Slip them a bribe", effect: { health: -2, morale: 5, money: -80, miles: 10, message: "Money talks, even in a dystopia." } },
            { text: "Refuse and cite rights", effect: { health: -10, morale: 10, money: -50, milesBack: 20, message: "Principles are expensive." } }
          ]
        },
        {
          title: "Corporate Checkpoint Inspection",
          description: "Amazon-Walmart Security Forces search for 'anti-corporate sentiment materials.'",
          choices: [
            { text: "Submit and praise the megacorps", effect: { supplies: -15, morale: -10, partyMorale: -8, miles: 0, message: "They confiscate 'suspicious' items but let you pass." } },
            { text: "Buy overpriced merch to appease", effect: { money: -150, morale: -3, miles: 10, message: "Capitalism miraculously fixes the problem." } },
            { text: "Challenge their authority", effect: { health: -20, money: -200, milesBack: 35, partyHealth: -10, message: "Corporate justice is swift and expensive." } }
          ]
        }
      ].map(evt => ({ ...evt, choices: evt.choices.map(c => ({ ...c, effect: sanitizeEffect(c.effect) })) }));

      setG(prev => ({
        ...prev,
        currentEvent: fallbackEvents[Math.floor(Math.random() * fallbackEvents.length)],
        isLoading: false,
        lastError: `AI Error: ${e.message}. Using fallback event.`,
        apiStats: {
          ...prev.apiStats,
          connected: false,
          totalCalls: prev.apiStats.totalCalls + 1,
          failedCalls: prev.apiStats.failedCalls + 1,
          hardcodedPrompts: prev.apiStats.hardcodedPrompts + 1,
          lastCallTime: new Date().toLocaleTimeString(),
          lastError: e.message
        }
      }));
    }
  }

  function handleChoice(choice) {
    const baseEff = sanitizeEffect(choice.effect || {});
    setG(prev => {
      const eff = { ...baseEff };

      // 🔒 Jail gating to avoid early insta-jail and reduce frequency overall
      if (eff.sendToJail) {
        if (prev.day <= 3) {
          eff.sendToJail = false; // never jail in first 3 days
        } else {
          // 40% chance to actually enforce jail; otherwise convert to short stuck
          const enforce = Math.random() < 0.4;
          if (!enforce) {
            eff.sendToJail = false;
            eff.stuckDays = Math.max(eff.stuckDays || 0, 1);
            eff.message = eff.message || "You narrowly avoid jail, but you're delayed.";
          }
        }
      }

      const wasStuck = prev.stuckDays > 0;

      const move = applyMovementAndStatus(prev, eff);
      const movedIndexDelta = move.currentLocationIndex - prev.currentLocationIndex;

      let party = prev.party.map(m => ({
        ...m,
        health: Math.max(0, Math.min(100, m.health + (eff.partyHealth || 0))),
        morale: Math.max(0, Math.min(100, m.morale + (eff.partyMorale || 0)))
      }));
      if (eff.partyMemberLoss && party.length > 0) party = party.slice(0, -1);

      let nextHealth = Math.max(0, Math.min(100, prev.health + (eff.health || 0)));
      if (eff.endGame === "lose") nextHealth = 0;

      let after = {
        ...prev,
        health: nextHealth,
        morale: Math.max(0, Math.min(100, prev.morale + (eff.morale || 0))),
        supplies: Math.max(0, Math.min(100, prev.supplies + (eff.supplies || 0))),
        money: Math.max(0, prev.money + (eff.money || 0)),
        party,
        currentLocationIndex: move.currentLocationIndex,
        distanceToNext: move.distanceToNext,
        totalDistance: move.totalDistance,
        stuckDays: move.stuckDays,
        jailed: move.jailed,
        currentEvent: null
      };

      // NOTE: We now decrement stuck time + advance day inside onContinue, not here.

      const details = buildOutcomeDetails(prev, after, eff, movedIndexDelta);
      const toast = {
        title: prev.currentEvent?.title || "Outcome",
        message: eff.message || "Your decision has consequences.",
        details,
        severe: eff.endGame === "lose" || eff.sendToJail || after.health <= 0
      };

      const cascade = maybeCascadingEvent(choice.text || "", after);
      if (cascade) {
        cascade.choices = cascade.choices.map(c => ({ ...c, effect: sanitizeEffect(c.effect) }));
      }

      const logLine = `${eff.message || "You made your choice."}${outcomeSummary(eff) ? " — " + outcomeSummary(eff) : ""}`;

      return {
        ...after,
        lastOutcome: toast,
        currentEvent: cascade || null,
        gameLog: [...prev.gameLog, { day: prev.day, event: prev.currentEvent.title, result: logLine }]
      };
    });
  }

  // Auto-dismiss the outcome toast
  useEffect(() => {
    if (!g.lastOutcome) return;
    const t = setTimeout(() => {
      setG(p => ({ ...p, lastOutcome: null }));
    }, 6000);
    return () => clearTimeout(t);
  }, [g.lastOutcome]);

  function buyItem(item) {
    const price = item.basePrice + Math.floor(Math.random() * 20) - 10;
    if (g.money < price) return;
    setG(prev => {
      const party = prev.party.map(m => ({
        ...m,
        health: Math.min(100, m.health + (item.effect.partyHealth || 0)),
        morale: Math.min(100, m.morale + (item.effect.partyMorale || 0))
      }));
      return {
        ...prev,
        money: prev.money - price,
        health: Math.min(100, prev.health + (item.effect.health || 0)),
        morale: Math.min(100, prev.morale + (item.effect.morale || 0)),
        supplies: Math.min(100, prev.supplies + (item.effect.supplies || 0)),
        party,
        gameLog: [...prev.gameLog, { day: prev.day, event: "Black Market Purchase", result: `Bought ${item.name} for $${price}.` }]
      };
    });
  }

  function advanceDay() {
    const base = 15 + Math.floor(Math.random() * 10);
    const healthMod = Math.floor(g.health / 20);
    const suppliesMod = Math.floor(g.supplies / 25);
    const miles = base + healthMod + suppliesMod + g.milesPerDay;

    setG(prev => {
      let { currentLocationIndex, distanceToNext } = prev;
      let newDistanceToNext = Math.max(0, prev.distanceToNext - miles);
      let newIndex = currentLocationIndex;
      if (newDistanceToNext === 0 && currentLocationIndex < prev.locations.length - 1) {
        newIndex += 1;
        newDistanceToNext = Math.floor(Math.random() * 60) + 40;
      }

      const suppliesLoss = Math.floor(Math.random() * 10) + 8;
      const healthLoss = Math.floor(Math.random() * 5) + 2;
      const moraleLoss = Math.floor(Math.random() * 7) + 3;

      const newParty = prev.party.map(m => ({
        ...m,
        health: Math.max(0, m.health - (2 + Math.floor(Math.random() * 5))),
        morale: Math.max(0, m.morale - (3 + Math.floor(Math.random() * 6)))
      }));

      return {
        ...prev,
        day: prev.day + 1,
        totalDistance: prev.totalDistance + miles,
        distanceToNext: newDistanceToNext,
        currentLocationIndex: newIndex,
        supplies: Math.max(0, prev.supplies - suppliesLoss),
        health: Math.max(0, prev.health - healthLoss),
        morale: Math.max(0, prev.morale - moraleLoss),
        party: newParty,
        currentEvent: null
      };
    });

    setTimeout(() => {
      setG(curr => {
        if (!curr.currentEvent) generateEvent();
        return curr;
      });
    }, 500);
  }

  // Single CTA: Continue (reworked to advance time while jailed/stuck)
  function onContinue() {
    if (g.currentEvent) return; // wait for choice

    if (g.stuckDays > 0 || g.jailed) {
      // While jailed/stuck: day advances, stuck decreases, then prompt an event (no travel)
      setG(prev => {
        const nextStuck = Math.max(0, prev.stuckDays - 1);
        const log = nextStuck !== prev.stuckDays
          ? [...prev.gameLog, { day: prev.day, event: "Jail Day", result: `You wait out the day. ${nextStuck} day(s) remain.` }]
          : prev.gameLog;
        return {
          ...prev,
          day: prev.day + 1,
          stuckDays: nextStuck,
          jailed: nextStuck > 0 ? prev.jailed : false,
          gameLog: log
        };
      });
      setTimeout(() => {
        setG(curr => { if (!curr.currentEvent) generateEvent(); return curr; });
      }, 400);
      return;
    }

    // Not stuck: normal travel day
    advanceDay();
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChosen(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result || "{}"));
        // Minimal validation
        if (!obj || typeof obj !== "object" || !Array.isArray(obj.locations) || typeof obj.day !== "number") {
          throw new Error("Invalid save file");
        }
        setG(obj);
      } catch (err) {
        alert(`Failed to import save: ${err.message}`);
      }
    };
    reader.readAsText(file);
    // reset input so same file can be re-imported if needed
    e.target.value = "";
  }

  const upcoming = useMemo(
    () => g.locations.slice(g.currentLocationIndex + 1, g.currentLocationIndex + 4),
    [g.locations, g.currentLocationIndex]
  );

  // DESCENDING recent log (newest first)
  const recentLog = useMemo(() => {
    const lastTen = g.gameLog.slice(-10);
    return lastTen.reverse();
  }, [g.gameLog]);

  const gradientBg = "linear-gradient(135deg,#0f172a 0%, #1e293b 30%, #7c3aed 60%, #f43f5e 100%)";

  const aiRatio = (() => {
    const total = g.apiStats.aiPrompts + g.apiStats.hardcodedPrompts;
    if (total === 0) return 1;
    return g.apiStats.aiPrompts / total;
  })();

  return (
    <div style={{ minHeight: "100vh", background: gradientBg, backgroundAttachment: "fixed", color: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 34, color: "#fff", textShadow: "0 4px 18px rgba(0,0,0,0.45)" }}>
            The Modern American Trail
          </h1>
          <div style={{ color: "rgba(255,255,255,0.85)" }}>Escape the Dystopia • Survive the Journey • Find Freedom</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={{ ...chip(g.apiStats.connected ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"), borderColor: g.apiStats.connected ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)" }}>
              {g.apiStats.connected ? "🟢 AI Connected" : "🔴 Fallback/Local Logic"}
            </span>
            <span style={chip("rgba(59,130,246,0.15)")}>Model: {g.selectedModel}</span>
            <span style={chip("rgba(250,204,21,0.15)")}>Day {g.day}</span>
            {g.stuckDays > 0 && (
              <span style={chip("rgba(124,45,18,0.25)")}>
                ⛔ Stuck {g.jailed ? "(Jailed) " : ""}{g.stuckDays} day{g.stuckDays === 1 ? "" : "s"} remaining
              </span>
            )}
            <span style={chip("rgba(101,163,13,0.18)")}>AI gen: {(aiRatio * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Top actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button title="Map" style={btn()} onClick={() => setG(p => ({ ...p, showMap: true }))}><MapIcon size={18} /></button>
            <button title="Black Market" style={btn("#1d3b2d")} onClick={() => setG(p => ({ ...p, showShop: true }))}><ShoppingCart size={18} /></button>
            <button title="Settings" style={btn("#1c2d4a")} onClick={() => setG(p => ({ ...p, showSettings: true }))}><Settings size={18} /></button>
            <button title="New Game" style={btn("#3b1d0c")} onClick={() => setG(newGameState(models.find(m => m.healthy)?.id || models[0]?.id))}>New</button>
            <button
              title="Export Save"
              style={btn("#2a1f4a")}
              onClick={() => {
                const blob = new Blob([JSON.stringify(g, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `modern_trail_${isWin ? "victory" : "run"}_${g.day}days.json`;
                a.click();
              }}
            >
              <Save size={18} />
            </button>
            <button title="Import Save" style={btn("#243b53")} onClick={handleImportClick}><Upload size={18} /></button>
            <input ref={fileInputRef} onChange={handleFileChosen} type="file" accept="application/json" style={{ display: "none" }} />
          </div>

          {/* NOTE: Removed the duplicate top Continue button. Keep only the middle prompt-area button below. */}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginBottom: 16 }}>
          <Stat label="Health" value={g.health} icon={Heart} color="#ef4444" />
          <Stat label="Morale" value={g.morale} icon={Battery} color="#3b82f6" />
          <Stat label="Supplies" value={g.supplies} icon={AlertCircle} color="#f59e0b" />
          <Stat label="Money" value={g.money} max={1000} icon={DollarSign} color="#22c55e" />
        </div>

        {/* Location & Progress */}
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", marginBottom: 16 }}>
          <div style={card()}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <MapPin size={18} color="#fca5a5" />
              <div style={{ fontWeight: 800, color: "#fde68a" }}>{currentLocation}</div>
              <div style={{ marginLeft: "auto", ...chip("rgba(31,41,55,0.6)") }}>Day {g.day}</div>
            </div>
            <div style={{ fontSize: 14, color: "#aeb6c7", display: "grid", gap: 6 }}>
              <Row label="Distance to next" value={<span style={{ color: "#60a5fa", fontFamily: "ui-monospace,monospace" }}>{g.distanceToNext} miles</span>} />
              <Row label="Total traveled" value={<span style={{ color: "#34d399", fontFamily: "ui-monospace,monospace" }}>{g.totalDistance} miles</span>} />
              <Row label="Progress" value={<span style={{ color: "#c084fc" }}>{g.currentLocationIndex}/{g.locations.length - 1}</span>} />
            </div>
          </div>
          <div style={card()}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <MapIcon size={18} color="#93c5fd" /><div style={{ fontWeight: 700 }}>Journey Progress</div>
            </div>
            <div style={{ height: 14, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ width: `${Math.max(6, progressPct)}%`, background: "linear-gradient(90deg,#ef4444,#f59e0b,#22c55e)", height: "100%", transition: "width .35s ease" }} />
            </div>
            <div style={{ fontSize: 12, color: "#e5e7eb", textAlign: "center" }}>{progressPct}% Complete</div>
          </div>
        </div>

        {/* Main area */}
        {isGameOver ? (
          <div style={{ ...card(), textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{isWin ? "🏆" : "💀"}</div>
            <h2 style={{ marginTop: 0 }}>{isWin ? "Victory!" : "Game Over"}</h2>
            <p style={{ color: "#cbd5e1" }}>
              {isWin
                ? `Congratulations! You reached the Safe Haven of Vermont after ${g.day} days and ${g.totalDistance} miles.`
                : "The dystopian regime has claimed another victim. Your journey ends in the wasteland."}
            </p>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", marginTop: 12 }}>
              <button style={btn("#4a1d1d")} onClick={() => setG(newGameState(models.find(m => m.healthy)?.id || models[0]?.id))}>New Journey</button>
              <button style={btn("#1c2d4a")} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to Top</button>
            </div>
          </div>
        ) : g.currentEvent ? (
          <div style={{ ...card(), border: "1px solid rgba(252,165,165,0.35)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <AlertCircle size={20} color="#f87171" />
              <h3 style={{ margin: 0, color: "#fca5a5" }}>{g.currentEvent.title}</h3>
            </div>
            <div style={{ ...card(), border: "1px dashed rgba(248,113,113,0.35)", background: "rgba(127,29,29,0.15)" }}>
              <p style={{ margin: 0, color: "#e5e7eb" }}>{g.currentEvent.description}</p>
            </div>
            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
              {g.currentEvent.choices.map((c, idx) => (
                <button key={idx} style={btn("rgba(24,32,48,0.9)")} onClick={() => handleChoice(c)}>
                  <strong style={{ marginRight: 8 }}>{["🅰️","🅱️","🅲️","🅳️"][idx] || "➕"}</strong>{c.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ ...card(), textAlign: "center" }}>
            {g.isLoading ? (
              <div>
                <div style={{ fontSize: 28, marginBottom: 12, filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.45))" }}>🔮</div>
                <div style={{ fontSize: 14, color: "#fde68a" }}>Consulting the resistance network...</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🌅</div>
                <p style={{ color: "#cbd5e1", marginBottom: 12 }}>
                  Another day dawns in this authoritarian wasteland. What challenges await at{" "}
                  <span style={{ color: "#fde68a", fontWeight: 700 }}>{currentLocation}</span>?
                </p>
                <button style={primaryBtn()} onClick={onContinue} disabled={g.isLoading}>
                  {g.stuckDays > 0 ? "Continue (Wait It Out)" : "Continue"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Party */}
        <div style={{ ...card(), marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Users size={18} color="#93c5fd" /><div style={{ fontWeight: 700, color: "#bfdbfe" }}>Your Party</div>
          </div>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {g.party.map((m, i) => {
              let icon = "👤";
              if (m.profession.includes("Tech")) icon = "💻";
              else if (m.profession.includes("Teacher")) icon = "📚";
              else if (m.profession.includes("Fact")) icon = "🔍";
              return (
                <div key={i} style={card()}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 800 }}>{icon} {m.name}</div>
                    <div>{m.health <= 0 ? "💀" : "💚"}</div>
                  </div>
                  <div style={{ color: "#cbd5e1", fontSize: 14, marginTop: 4 }}>{m.profession}</div>
                  <div style={{ display: "grid", gap: 4, fontSize: 14, marginTop: 6 }}>
                    <Row label="Health:" value={<strong style={{ color: m.health <= 30 ? "#f87171" : "#34d399" }}>{m.health}%</strong>} />
                    <Row label="Morale:" value={<strong style={{ color: m.morale <= 30 ? "#fbbf24" : "#60a5fa" }}>{m.morale}%</strong>} />
                  </div>
                  {m.health <= 0 && (
                    <div style={{ marginTop: 8, border: "1px solid #7f1d1d", color: "#fca5a5", padding: "3px 6px", borderRadius: 6 }}>
                      Incapacitated
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Log (DESCENDING newest first) */}
        {g.gameLog.length > 0 && (
          <div style={{ ...card(), marginTop: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Journey Log</div>
            <div style={{ display: "grid", gap: 6, maxHeight: 200, overflowY: "auto" }}>
              {recentLog.map((line, i) => (
                <div key={i} style={{ color: "#cbd5e1", fontSize: 14 }}>
                  <strong>Day {line.day}:</strong> {line.event} — {line.result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 18, color: "#e5e7eb", fontSize: 12 }}>
          Total locations: {g.locations.length} • Progress: {g.currentLocationIndex}/{g.locations.length - 1}
          <div style={{ opacity: 0.85 }}>A satirical Oregon Trail-style game • Events are fictional commentary</div>
        </div>
      </div>

      {/* Settings */}
      {g.showSettings && (
        <div style={modalBackdrop()}>
          <div style={modal()}>
            <h3 style={{ marginTop: 0 }}>Settings</h3>
            <div style={{ ...card(), marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: "#93c5fd", marginBottom: 6 }}>AI Connection</div>
              <div style={{ display: "grid", gap: 8 }}>
                <label>
                  <div style={{ fontSize: 12, color: "#9aa3b2", marginBottom: 4 }}>Model (free only)</div>
                  <select
                    value={g.selectedModel}
                    onChange={e => setG(p => ({ ...p, selectedModel: e.target.value, apiStats: { ...p.apiStats, currentModel: e.target.value } }))}
                    style={{ width: "100%", padding: 12, background: "rgba(15,19,32,0.9)", color: "#e5e7eb", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
                    disabled={modelsLoading || models.length === 0}
                  >
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}{m.healthy ? "" : " (iffy)"}</option>)}
                  </select>
                  {modelsLoading && <div style={{ fontSize: 12, color: "#9aa3b2", marginTop: 6 }}>Loading free models…</div>}
                  {!modelsLoading && models.length === 0 && (
                    <div style={{ fontSize: 12, color: "#fca5a5", marginTop: 6 }}>
                      No free models available right now. Using built-in fallback list.
                    </div>
                  )}
                </label>
                <div style={{ display: "grid", gap: 4, fontSize: 13, color: "#cbd5e1" }}>
                  <div>AI prompts: <strong>{g.apiStats.aiPrompts}</strong></div>
                  <div>Hard-coded prompts: <strong>{g.apiStats.hardcodedPrompts}</strong></div>
                  <div>AI usage ratio: <strong>{(aiRatio * 100).toFixed(1)}%</strong></div>
                  <div>Prompt tokens: <strong>{g.apiStats.tokensPrompt}</strong></div>
                  <div>Completion tokens: <strong>{g.apiStats.tokensCompletion}</strong></div>
                  <div>Total tokens (all): <strong>{g.apiStats.totalTokensUsed}</strong></div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button style={btn("#1c2d4a")} onClick={testAPIConnection}>Test Connection</button>
                  <button style={btn("#3a3f52")} onClick={() => setG(p => ({
                    ...p, apiStats: { ...p.apiStats, totalCalls: 0, successfulCalls: 0, failedCalls: 0, totalTokensUsed: 0, tokensPrompt: 0, tokensCompletion: 0, aiPrompts: 0, hardcodedPrompts: 0, lastError: null }
                  }))}>
                    Reset Stats
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "#9aa3b2" }}>
                  Your API key is stored server-side in Cloudflare Pages and never exposed in the browser.
                </div>
                {g.apiStats.lastError && (
                  <div style={{ ...card(), border: "1px solid rgba(127,29,29,0.45)" }}>
                    <strong>Last Error:</strong> {g.apiStats.lastError}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button style={btn()} onClick={() => setG(p => ({ ...p, showSettings: false }))}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Shop */}
      {g.showShop && (
        <div style={modalBackdrop()}>
          <div style={modal({ maxWidth: 900 })}>
            <h3 style={{ marginTop: 0, color: "#34d399" }}>Underground Black Market</h3>
            <p style={{ color: "#cbd5e1" }}>A shadowy figure emerges: “Got supplies for the resistance. Cash only, no questions.”</p>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", marginBottom: 12 }}>
              {shopItems.map(item => {
                const price = item.basePrice + Math.floor(Math.random() * 20) - 10;
                const Icon = item.icon;
                const afford = g.money >= price;
                return (
                  <div key={item.id} style={{ ...card(), opacity: afford ? 1 : 0.6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={18} color="#34d399" /><strong>{item.name}</strong>
                    </div>
                    <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 4 }}>{item.description}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      <div style={{ color: "#34d399", fontWeight: 800 }}>${price}</div>
                      <button style={btn("#16523a")} onClick={() => buyItem({ ...item, basePrice: price })} disabled={!afford}>
                        {afford ? "Buy" : "No Cash"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Your Money: ${g.money}</span>
              <button style={btn()} onClick={() => setG(p => ({ ...p, showShop: false }))}>Leave Market</button>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      {g.showMap && (
        <div style={modalBackdrop()}>
          <div style={modal({ maxWidth: 720 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ marginTop: 0, color: "#93c5fd" }}>Journey Map</h3>
              <button style={btn()} onClick={() => setG(p => ({ ...p, showMap: false }))}>Close</button>
            </div>
            <div style={card()}>
              <div style={{ fontWeight: 800, marginBottom: 8, color: "#93c5fd" }}>Journey Progress</div>
              <div style={{ height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#ef4444,#f59e0b,#22c55e)", height: "100%", transition: "width .35s ease" }} />
              </div>
              <div style={{ display: "grid", gap: 4, fontSize: 14, color: "#cbd5e1" }}>
                <Row label="Current Location:" value={<span style={{ color: "#fde68a" }}>{currentLocation}</span>} />
                <Row label="Distance to Next:" value={<span style={{ color: "#60a5fa" }}>{g.distanceToNext} miles</span>} />
                <Row label="Total Distance:" value={<span style={{ color: "#34d399" }}>{g.totalDistance} miles</span>} />
                <Row label="Upcoming:" value={<span>{upcoming.join(" • ") || "—"}</span>} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Toast */}
      {g.lastOutcome && (
        <div style={{ position: "fixed", right: 16, bottom: 16, maxWidth: 460, zIndex: 60 }}>
          <div style={{ ...card(), border: `1px solid ${g.lastOutcome.severe ? "rgba(127,29,29,0.6)" : "rgba(255,255,255,0.12)"}`, boxShadow: "0 10px 20px rgba(0,0,0,0.35)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <strong>Outcome: {g.lastOutcome.title}</strong>
              <button
                onClick={() => setG(p => ({ ...p, lastOutcome: null }))}
                style={{ ...btn("#1f2937"), padding: "4px 8px", lineHeight: 1 }}
                aria-label="Dismiss outcome"
              >
                ×
              </button>
            </div>
            <div style={{ color: "#cbd5e1", fontSize: 14, marginBottom: 6 }}>{g.lastOutcome.message}</div>
            <ul style={{ margin: 0, paddingLeft: 16, color: "#aeb6c7", fontSize: 13, display: "grid", gap: 4 }}>
              {g.lastOutcome.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
