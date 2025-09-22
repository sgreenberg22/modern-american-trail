import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, Heart, Battery, DollarSign, Users, MapPin, Settings,
  ShoppingCart, Package, Zap, Save, Upload, Map as MapIcon
} from "lucide-react";

/** ---------- OpenRouter helper via Cloudflare Pages Function ---------- */
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

/** ---------- Utility: robustly extract JSON from an LLM reply ---------- */
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
      try { return JSON.parse(slice); } catch { /* fallthrough */ }
    }
    throw new Error("Could not parse JSON from model response");
  }
}

/** ---------- Free model fallback list (used if /api/models is unavailable) ---------- */
const FALLBACK_FREE_MODELS = [
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (Free)" },
  { id: "huggingfaceh4/zephyr-7b-beta:free", name: "Zephyr 7B (Free)" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini 128k (Free)" },
  { id: "qwen/qwen-2-7b-instruct:free", name: "Qwen 2 7B (Free)" },
  { id: "openchat/openchat-7b:free", name: "OpenChat 7B (Free)" }
];

/** ---------- Game: content and logic ---------- */
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
    const numProcedural = 2 + Math.floor(Math.random() * 3); // 2-4
    for (let j = 0; j < numProcedural; j++) {
      const suffix = proceduralSuffixes[Math.floor(Math.random() * proceduralSuffixes.length)];
      out.push(`${suffix} ${String.fromCharCode(65 + i)}-${j + 1}`);
    }
  }
  out.push(baseLocations[bas]()
