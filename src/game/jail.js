// Centralized jail logic: plug into your main Continue flow.
export const DEFAULT_JAIL = {
isJailed: false,
daysInJail: 0,
maxJailDays: 5, // hard cap to avoid infinite jail
escapeChancePerDay: 0.35 // base chance on first jail day
};


// Prevent insta-jail: disallow arrests for first few days, then ramp.
export function maybeArrest(state) {
const EARLY_DAY_GUARD = 3; // no arrests on days 1..3
if (state.day <= EARLY_DAY_GUARD) return false;
const base = 0.04; // 4% after day 3
const growth = Math.min(0.01 * Math.max(0, state.day - EARLY_DAY_GUARD), 0.08); // +1%/day up to +8%
const arrestChance = base + growth; // max ~12%
return Math.random() < arrestChance;
}


export function enterJail(state) {
return {
...state,
jail: { ...state.jail, isJailed: true, daysInJail: 0 }
};
}


export function resolveJailDay(state) {
if (!state.jail?.isJailed) return state;
const nextDay = state.day + 1;
const daysInJail = (state.jail.daysInJail || 0) + 1;
const base = state.jail.escapeChancePerDay ?? DEFAULT_JAIL.escapeChancePerDay;
const bonus = 0.10 * (daysInJail - 1); // +10% each jail day
const chance = Math.min(0.95, base + bonus);
const escaped = Math.random() < chance || daysInJail >= (state.jail.maxJailDays ?? DEFAULT_JAIL.maxJailDays);
return {
...state,
day: nextDay, // ✅ day always advances while jailed
jail: escaped
? { ...(state.jail || DEFAULT_JAIL), isJailed: false, daysInJail: 0 }
: { ...(state.jail || DEFAULT_JAIL), isJailed: true, daysInJail }
};
}
