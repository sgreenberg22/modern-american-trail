// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, Heart, Battery, DollarSign, Users, MapPin, Settings,
  ShoppingCart, Package, Zap, Save, Upload, Map as MapIcon
} from "lucide-react";

/** -------------------------------------------------------------------------
 * Server helpers (Cloudflare Pages Functions)
 * ------------------------------------------------------------------------- */
async function chat({ model, messages, max_tokens = 700 }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, max_tokens })
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || res.statusText;
    throw new Error(msg || "OpenRouter error");
  }
  return data;
}

/** Safely extract a JSON object from a model response (which may contain backticks) */
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
      const slice = t.slice(first, last + 1);
      try { return JSON.parse(slice); } catch { /* ignore */ }
    }
    throw new Error("Could not parse JSON from model response");
  }
}

/** -------------------------------------------------------------------------
 * Fallback list (used if /api/models is unavailable)
 * ------------------------------------------------------------------------- */
const FALLBACK_FREE_MODELS = [
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (Free)" },
  { id: "huggingfaceh4/zephyr-7b-beta:free", name: "Zephyr 7B (Free)" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini 128k (Free)" },
  { id: "qwen/qwen-2-7b-instruct:free", name: "Qwen 2 7B (Free)" },
  { id: "openchat/openchat-7b:free", name: "OpenChat 7B (Free)" }
];

/** -------------------------------------------------------------------------
 * Game data & helpers
 * ------------------------------------------------------------------------- */
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

  const proceduralSuffixes = [
    "Checkpoint Alpha", "Detention Center", "Propaganda Station", "Truth Verification Point",
    "Loyalty Testing Facility", "Patriotism Academy", "Freedom™ Outpost", "Border Patrol Zone",
    "Corporate Compound", "Indoctrination Hub", "Surveillance Nexus", "Control Point",
    "Compliance Center", "Authority Station", "Regime Outpost", "Order Facility"
  ];

  const out = [];
  for (let i = 0; i < baseLocations.length - 1; i++) {
    out.push(baseLocations[i]);
    const numProcedural = 2 + Math.floor(Math.random() * 3); // 2–4 between each main stop
    for (let j = 0; j < numProcedural; j++) {
      const suffix = proceduralSuffixes[Math.floor(Math.random() * proceduralSuffixes.length)];
      out.push(`${suffix} ${String.fromCharCode(65 + i)}-${j + 1}`);
    }
  }
  // ✅ Fixed: last base location + return
  out.push(baseLocations[baseLocations.length - 1]);
  return out;
}

function newGameState() {
  const defaultModel = FALLBACK_FREE_MODELS[0].id;
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
    distanceToNext: Math.floor(Math.random() * 50) + 30, // 30–80
    milesPerDay: 0,
    gameStartTime: Date.now(),
    difficulty: "normal",
    apiStats: {
      connected: false,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalTokensUsed: 0,
      lastCallTime: null,
      currentModel: defaultModel,
      lastError: null
    }
  };
}

const shopItems = [
  { id: "supplies", name: "Underground Rations", description: "Black market food supplies to keep your party fed.", basePrice: 50, effect: { supplies: 30 }, icon: Package },
  { id: "medicine", name: "Bootleg Medicine", description: "Illegal healthcare supplies (banned by the regime).", basePrice: 80, effect: { health: 25, partyHealth: 15 }, icon: Heart },
  { id: "morale_boost", name: "Forbidden Books", description: "Banned literature to boost party morale.", basePrice: 40, effect: { morale: 20, partyMorale: 10 }, icon: Battery },
  { id: "energy_drink", name: "Resistance Energy Drink", description: "Caffeinated rebellion in a can.", basePrice: 25, effect: { health: 10, morale: 10 }, icon: Zap },
  { id: "survival_kit", name: "Prepper's Survival Kit", description: "Everything you need to survive the wasteland.", basePrice: 150, effect: { supplies: 40, health: 15, partyHealth: 10 }, icon: AlertCircle }
];

/** Simple stat block */
function Stat({ label, value, max = 100, icon: Icon, color = "#999" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Icon size={18} color={color} />
        <div style={{ fontSize: 14, color: "#cfd6e4" }}>{label}</div>
        <div style={{ marginLeft: "auto", fontWeight: 700, color }}>{max === 100 ? `${value}%` : value}</div>
      </div>
      <div className="bar"><div style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

/** -------------------------------------------------------------------------
 * App
 * ------------------------------------------------------------------------- */
export default function App() {
  const [g, setG] = useState(newGameState());
  const [models, setModels] = useState(FALLBACK_FREE_MODELS);
  const [modelsLoading, setModelsLoading] = useState(true);

  const currentLocation = g.locations[g.currentLocationIndex];
  const progressPct = Math.round((g.currentLocationIndex / (g.locations.length - 1)) * 100);
  const isWin = currentLocation === "Safe Haven of Vermont" && g.health > 0;
  const isGameOver = g.health <= 0 || currentLocation === "Safe Haven of Vermont" || g.party.every(p => p.health <= 0);

  // Fetch free models from /api/models on mount
  useEffect(() => {
    (async () => {
      try {
        setModelsLoading(true);
        const r = await fetch("/api/models");
        const j = await r.json();
        const list = Array.isArray(j?.models) ? j.models : [];
        if (list.length > 0) {
          setModels(list);
          // if current model not in list, switch to the first free option
          setG(prev => {
            const has = list.some(m => m.id === prev.selectedModel);
            const nextId = has ? prev.selectedModel : list[0].id;
            return {
              ...prev,
              selectedModel: nextId,
              apiStats: { ...prev.apiStats, currentModel: nextId }
            };
          });
        }
      } catch {
        // keep fallback silently
      } finally {
        setModelsLoading(false);
      }
    })();
  }, []);

  async function testAPIConnection() {
    setG(prev => ({ ...prev, apiStats: { ...prev.apiStats, lastError: "Testing connection..." } }));
    try {
      const data = await chat({
        model: g.selectedModel,
        messages: [{ role: "user", content: "Respond with only: OK" }],
        max_tokens: 5
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
          totalTokensUsed: prev.apiStats.totalTokensUsed + (data?.usage?.total_tokens || 5)
        }
      }));
    } catch (e) {
      const msg = e?.message || "Connection failed";
      const noEndpoints = /no endpoints found/i.test(msg);
      setG(prev => {
        // Auto-switch to next free model if the chosen one has no live endpoints
        let nextModel = prev.selectedModel;
        if (noEndpoints && models.length > 1) {
          const idx = models.findIndex(m => m.id === prev.selectedModel);
          nextModel = models[(idx + 1) % models.length].id;
        }
        return {
          ...prev,
          selectedModel: nextModel,
          apiStats: {
            ...prev.apiStats,
            connected: false,
            lastError: msg + (noEndpoints ? " (try another free model from the list)" : ""),
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
    if (effect.miles) parts.push(`Miles +${effect.miles}`);
    return parts.join(" • ");
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
        difficulty: g.difficulty
      };

      const prompt =
        `You are generating a satirical event for a dystopian Oregon Trail-style game called "The Modern American Trail" set in a conservative-controlled America in ${new Date().getFullYear() + 1}.
Current game state: ${JSON.stringify(stateForPrompt)}
Generate a sarcastic, darkly humorous event that mocks conservative extremism and authoritarianism. The event should be relevant to the current location "${currentLocation}".
Consider the party's health/morale. Include 2-3 meaningful choices that affect game stats realistically.
Make effects proportional to the current state—if health/morale is low, avoid overly harsh penalties. If supplies are critical, offer a way to find some.
Respond with ONLY valid JSON in this exact format:
{
  "title": "Event Title",
  "description": "2-3 sentences",
  "choices": [
    { "text": "Choice 1", "effect": { "health": -5, "morale": 5, "supplies": 0, "money": -25, "partyHealth": -3, "partyMorale": 2, "miles": 0, "message": "Result" } },
    { "text": "Choice 2", "effect": { "health": 0, "morale": -10, "supplies": 5, "money": 0, "partyHealth": 0, "partyMorale": -5, "miles": 0, "message": "Result" } }
  ]
}`;

      const data = await chat({
        model: g.selectedModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 900
      });

      const text = data?.choices?.[0]?.message?.content ?? "";
      const eventData = parseJSONFromText(text);

      if (!eventData?.title || !eventData?.description || !Array.isArray(eventData?.choices)) {
        throw new Error("Event missing required fields");
      }

      setG(prev => ({
        ...prev,
        currentEvent: eventData,
        isLoading: false,
        apiStats: {
          ...prev.apiStats,
          connected: true,
          totalCalls: prev.apiStats.totalCalls + 1,
          successfulCalls: prev.apiStats.successfulCalls + 1,
          totalTokensUsed: prev.apiStats.totalTokensUsed + (data?.usage?.total_tokens || 0),
          lastCallTime: new Date().toLocaleTimeString()
        }
      }));
    } catch (e) {
      const fallbackEvents = [
        {
          title: "Mandatory Patriotism Test",
          description: `At ${currentLocation}, officials demand you prove your loyalty by reciting the pledge to a flag made entirely of corporate logos. Your party exchanges nervous glances.`,
          choices: [
            { text: "Recite it with exaggerated enthusiasm", effect: { health: 0, morale: -10, supplies: 0, money: 0, partyHealth: 0, partyMorale: -5, miles: 0, message: "You pass the test but feel your soul shrinking." } },
            { text: "Try to slip them a bribe", effect: { health: -5, morale: 5, supplies: 0, money: -50, partyHealth: 0, partyMorale: 3, miles: 0, message: "Money talks, even in a dystopia." } },
            { text: "Refuse and argue about constitutional rights", effect: { health: -15, morale: 10, supplies: 0, money: -25, partyHealth: 0, partyMorale: 5, miles: 0, message: "Your principles cost you time and a fine." } }
          ]
        },
        {
          title: "Corporate Checkpoint Inspection",
          description: "Amazon-Walmart Security Forces demand to search your vehicle for 'unauthorized merchandise' and 'anti-corporate sentiment materials.' They look very serious about their corporate loyalty.",
          choices: [
            { text: "Submit to full search and praise the corporations", effect: { health: 0, morale: -15, supplies: -20, money: 0, partyHealth: 0, partyMorale: -10, miles: 0, message: "They confiscate 'suspicious' items but let you pass." } },
            { text: "Offer to buy overpriced corporate merchandise", effect: { health: 0, morale: -5, supplies: 0, money: -150, partyHealth: 0, partyMorale: 0, miles: 0, message: "Capitalism solves another problem through commerce." } },
            { text: "Challenge their authority", effect: { health: -25, morale: 0, supplies: 0, money: -200, partyHealth: -15, partyMorale: 0, miles: 0, message: "Corporate justice is swift and expensive." } }
          ]
        },
        {
          title: "Regime Propaganda Broadcast",
          description: "Loudspeakers force you to listen to a 3-hour speech about the 'dangers of independent thought.' Covering your ears is illegal.",
          choices: [
            { text: "Endure the propaganda session", effect: { health: -5, morale: -30, supplies: 0, money: 0, partyHealth: 0, partyMorale: -25, miles: 0, message: "Your brain feels violated by the forced indoctrination." } },
            { text: "Pretend to be sick and leave", effect: { health: -15, morale: 0, supplies: 0, money: -50, partyHealth: 0, partyMorale: 0, miles: 0, message: "Fake illness costs money for medical exemption." } }
          ]
        }
      ];
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
          lastCallTime: new Date().toLocaleTimeString(),
          lastError: e.message
        }
      }));
    }
  }

  function handleChoice(choice) {
    const e = choice.effect || {};
    setG(prev => {
      const party = prev.party.map(m => ({
        ...m,
        health: Math.max(0, Math.min(100, m.health + (e.partyHealth || 0))),
        morale: Math.max(0, Math.min(100, m.morale + (e.partyMorale || 0))),
      }));

      let { currentLocationIndex, distanceToNext, totalDistance } = prev;

      // forward movement if the choice grants miles
      const miles = e.miles || 0;
      if (miles > 0) {
        distanceToNext = Math.max(0, distanceToNext - miles);
        totalDistance += miles;
        if (distanceToNext === 0 && currentLocationIndex < prev.locations.length - 1) {
          currentLocationIndex += 1;
          distanceToNext = Math.floor(Math.random() * 60) + 40;
        }
      }

      const newState = {
        ...prev,
        health: Math.max(0, Math.min(100, prev.health + (e.health || 0))),
        morale: Math.max(0, Math.min(100, prev.morale + (e.morale || 0))),
        supplies: Math.max(0, Math.min(100, prev.supplies + (e.supplies || 0))),
        money: Math.max(0, prev.money + (e.money || 0)),
        party,
        totalDistance,
        distanceToNext,
        currentLocationIndex,
        currentEvent: null
      };

      const msg = `${e.message || "You made your choice."}${outcomeSummary(e) ? " — " + outcomeSummary(e) : ""}`;
      return { ...newState, gameLog: [...prev.gameLog, { day: prev.day, event: prev.currentEvent.title, result: msg }] };
    });
  }

  function buyItem(item) {
    const price = item.basePrice + Math.floor(Math.random() * 20) - 10;
    if (g.money < price) return;
    setG(prev => {
      const party = prev.party.map(m => ({
        ...m,
        health: Math.min(100, m.health + (item.effect.partyHealth || 0)),
        morale: Math.min(100, m.morale + (item.effect.partyMorale || 0)),
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
        morale: Math.max(0, m.morale - (3 + Math.floor(Math.random() * 6))),
      }));

      const next = {
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
      return next;
    });

    // Try to create a narrative event after travel
    setTimeout(() => {
      setG(curr => {
        if (!curr.currentEvent) generateEvent();
        return curr;
      });
    }, 600);
  }

  const upcoming = useMemo(
    () => g.locations.slice(g.currentLocationIndex + 1, g.currentLocationIndex + 4),
    [g.locations, g.currentLocationIndex]
  );

  return (
    <div className="container" style={{ minHeight: "100vh", background: "linear-gradient(to bottom,#7f1d1d,#111827)", color: "#fff", padding: 16 }}>
      {/* Header */}
      <div className="hdr" style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 32, color: "#f87171" }}>The Modern American Trail</h1>
        <div style={{ color: "#cbd5e1" }}>Escape the Dystopia • Survive the Journey • Find Freedom</div>
        <div style={{ marginTop: 6, fontSize: 14, color: "#a3aab8" }}>
          Day {g.day} • {g.health > 70 ? "☀️ Fair Weather" : g.health > 40 ? "⛅ Overcast" : "🌧️ Stormy"}
        </div>
        <div style={{ marginTop: 8, fontSize: 12 }}>
          <span className="tag" style={{ marginRight: 8, padding: "4px 8px", background: g.apiStats.connected ? "#064e3b" : "#7f1d1d", borderRadius: 6 }}>
            {g.apiStats.connected ? "🟢 AI Connected" : "🔴 Fallback Events"}
          </span>
          <span className="tag" style={{ padding: "4px 8px", background: "#1f2937", borderRadius: 6 }}>
            Model: {g.selectedModel}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="btn" onClick={() => setG(p => ({ ...p, showMap: true }))} title="Map" style={btn()}>
          <MapIcon size={18} />
        </button>
        <button className="btn" onClick={() => setG(p => ({ ...p, showShop: true }))} title="Black Market" style={btn("#16a34a")}>
          <ShoppingCart size={18} />
        </button>
        <button className="btn" onClick={() => setG(p => ({ ...p, showSettings: true }))} title="Settings" style={btn("#3b82f6")}>
          <Settings size={18} />
        </button>
        <button className="btn" onClick={() => setG(newGameState())} title="New Game" style={btn("#ea580c")}>
          <Upload size={18} />
        </button>
        <button
          className="btn"
          onClick={() => {
            const blob = new Blob([JSON.stringify(g, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `modern_trail_${isWin ? "victory" : "run"}_${g.day}days.json`;
            a.click();
          }}
          title="Export Save"
          style={btn("#8b5cf6")}
        >
          <Save size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="row cols-4" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginBottom: 16 }}>
        <Stat label="Health" value={g.health} icon={Heart} color="#ef4444" />
        <Stat label="Morale" value={g.morale} icon={Battery} color="#3b82f6" />
        <Stat label="Supplies" value={g.supplies} icon={AlertCircle} color="#f59e0b" />
        <Stat label="Money" value={g.money} max={1000} icon={DollarSign} color="#10b981" />
      </div>

      {/* Location + progress */}
      <div className="row cols-2" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", marginBottom: 16 }}>
        <div className="card" style={card()}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <MapPin size={18} color="#f87171" />
            <div style={{ fontWeight: 700, color: "#fde68a" }}>{currentLocation}</div>
            <div className="tag" style={{ marginLeft: "auto", background: "#1f2937", borderRadius: 6, padding: "2px 8px" }}>Day {g.day}</div>
          </div>
          <div style={{ fontSize: 14, color: "#aeb6c7", display: "grid", gap: 6 }}>
            <Row label="Distance to next" value={<span className="mono" style={{ color: "#60a5fa" }}>{g.distanceToNext} miles</span>} />
            <Row label="Total traveled" value={<span className="mono" style={{ color: "#34d399" }}>{g.totalDistance} miles</span>} />
            <Row label="Progress" value={<span style={{ color: "#c084fc" }}>{g.currentLocationIndex}/{g.locations.length - 1}</span>} />
          </div>
        </div>
        <div className="card" style={card()}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <MapIcon size={18} color="#60a5fa" /><div style={{ fontWeight: 600 }}>Journey Progress</div>
          </div>
          <div className="bar" style={{ background: "#374151", borderRadius: 999, height: 12, overflow: "hidden", marginBottom: 6 }}>
            <div style={{
              width: `${Math.max(6, progressPct)}%`,
              background: "linear-gradient(90deg,#ef4444,#f59e0b,#10b981)",
              height: "100%"
            }} />
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>{progressPct}% Complete</div>
        </div>
      </div>

      {/* Main panel */}
      {isGameOver ? (
        <div className="card" style={{ ...card(), textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{isWin ? "🏆" : "💀"}</div>
          <h2 style={{ marginTop: 0 }}>{isWin ? "Victory!" : "Game Over"}</h2>
          <p style={{ color: "#cbd5e1" }}>
            {isWin
              ? `Congratulations! You reached the Safe Haven of Vermont after ${g.day} days and ${g.totalDistance} miles.`
              : "The dystopian regime has claimed another victim. Your journey ends in the wasteland."}
          </p>
          <div className="row cols-2" style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", marginTop: 12 }}>
            <button className="btn" style={btn("#ef4444")} onClick={() => setG(newGameState())}>New Journey</button>
            <button className="btn" style={btn("#3b82f6")} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to Top</button>
          </div>
        </div>
      ) : g.currentEvent ? (
        <div className="card" style={card()}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <AlertCircle size={20} color="#f87171" />
            <h3 style={{ margin: 0, color: "#fca5a5" }}>{g.currentEvent.title}</h3>
          </div>
          <div className="card" style={{ ...card(), borderColor: "#7f1d1d" }}>
            <p style={{ margin: 0, color: "#e5e7eb" }}>{g.currentEvent.description}</p>
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {g.currentEvent.choices.map((c, idx) => (
              <button key={idx} className="btn" style={btn()} onClick={() => handleChoice(c)}>
                <strong style={{ marginRight: 8 }}>{["🅰️","🅱️","🅲️","🅳️"][idx] || "➕"}</strong>{c.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ ...card(), textAlign: "center" }}>
          {g.isLoading ? (
            <div>
              <div style={{ fontSize: 24, marginBottom: 12 }}>🔄</div>
              <div style={{ fontSize: 14, color: "#fde68a" }}>Consulting the resistance network...</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🌅</div>
              <p style={{ color: "#cbd5e1" }}>
                Another day dawns in this authoritarian wasteland. What challenges await at{" "}
                <span style={{ color: "#fde68a", fontWeight: 700 }}>{currentLocation}</span>?
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="btn" style={btn("#ef4444")} onClick={generateEvent}>Face the Day</button>
                <button className="btn" style={btn("#3b82f6")} onClick={advanceDay}>Travel Forward</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Party */}
      <div className="card" style={{ ...card(), marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Users size={18} color="#60a5fa" /><div style={{ fontWeight: 600, color: "#93c5fd" }}>Your Party</div>
        </div>
        <div className="row cols-2" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {g.party.map((m, i) => {
            let icon = "👤";
            if (m.profession.includes("Tech")) icon = "💻";
            else if (m.profession.includes("Teacher")) icon = "📚";
            else if (m.profession.includes("Fact")) icon = "🔍";

            return (
              <div key={i} className="card" style={card()}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700 }}>{icon} {m.name}</div>
                  <div>{m.health <= 0 ? "💀" : "💚"}</div>
                </div>
                <div style={{ color: "#cbd5e1", fontSize: 14, marginTop: 4 }}>{m.profession}</div>
                <div style={{ display: "grid", gap: 4, fontSize: 14, marginTop: 6 }}>
                  <Row label="Health:" value={<strong style={{ color: m.health <= 30 ? "#f87171" : "#34d399" }}>{m.health}%</strong>} />
                  <Row label="Morale:" value={<strong style={{ color: m.morale <= 30 ? "#fbbf24" : "#60a5fa" }}>{m.morale}%</strong>} />
                </div>
                {m.health <= 0 && <div className="tag" style={{ marginTop: 8, border: "1px solid #7f1d1d", color: "#fca5a5", padding: "3px 6px", borderRadius: 6 }}>Incapacitated</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log */}
      {g.gameLog.length > 0 && (
        <div className="card" style={{ ...card(), marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Journey Log</div>
          <div className="grid-log" style={{ display: "grid", gap: 6, maxHeight: 180, overflowY: "auto" }}>
            {g.gameLog.slice(-10).map((line, i) => (
              <div key={i} className="log-line" style={{ color: "#cbd5e1", fontSize: 14 }}>
                <strong>Day {line.day}:</strong> {line.event} — {line.result}
              </div>
            ))}
          </div>
        </div>
      )}
