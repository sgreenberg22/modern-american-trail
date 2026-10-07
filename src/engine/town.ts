// Stops: shopping, upgrades, repairs, resting, settling down, landmark actions, and using items.
import { HEAT, RULES, VAN } from "./config";
import { endOfDay } from "./day";
import { LANDMARKS } from "./data/landmarks";
import { ITEM_USES, SHOP_ITEMS, UPGRADES } from "./data/items";
import { render } from "./encounter";
import type { Rng } from "./rng";
import { cantBuy, checkOdds, currentStop, garageCost, living, shopPrice, skilledMember } from "./selectors";
import type { Delta, GameState, ItemId, LandmarkActionId } from "./types";
import { addHeat, checkWipe, clamp, finish, log, round1 } from "./util";

export function buy(s: GameState, itemId: string): boolean {
  if (cantBuy(s, itemId)) return false;
  const item = SHOP_ITEMS.find(i => i.id === itemId)!;
  const price = shopPrice(s, itemId);
  s.money -= price;
  if (item.food) s.food = round1(s.food + item.food);
  if (item.fuel) s.fuel = round1(s.fuel + item.fuel);
  if (item.item) s.items[item.item] += 1;
  log(s, { title: "Market", text: `Bought ${item.name} for $${price}.` });
  return true;
}

export function buyUpgrade(s: GameState, id: string): boolean {
  const up = UPGRADES.find(u => u.id === id);
  if (!up || s.upgrades.includes(id) || s.money < up.price) return false;
  s.money -= up.price;
  s.upgrades.push(id);
  log(s, { title: "Upgrade", text: `Bought ${up.name}: ${up.description}` });
  return true;
}

export function repair(s: GameState): boolean {
  const cost = garageCost(s);
  if (s.van >= 100 || s.money < cost) return false;
  s.money -= cost;
  s.van = 100;
  log(s, { title: "Garage", text: `A mechanic in a \"Science Is Real\" cap fixes the van for $${cost}.` });
  return true;
}

export function rest(s: GameState, rng: Rng): boolean {
  if (s.money < RULES.restCost) return false;
  s.money -= RULES.restCost;
  s.day += 1;
  const r = endOfDay(s, rng, "rest");
  addHeat(s, -HEAT.restCooldown);
  log(s, { title: "Rest", text: r.starving ? "A day of rest on empty stomachs." : `A day off at a safe house ($${RULES.restCost}). Everyone sleeps in a real bed, and the heat dies down.` });
  checkWipe(s);
  return true;
}

export function settle(s: GameState): boolean {
  if (s.stopIndex === 0 || currentStop(s).kind !== "paradise") return false;
  finish(s, "settled");
  return true;
}

export function useItem(s: GameState, item: ItemId, memberId?: string): boolean {
  if (!ITEM_USES[item] || s.items[item] <= 0) return false;
  const target = ITEM_USES[item].targeted ? s.party.find(m => m.id === memberId && m.alive) : undefined;
  if (ITEM_USES[item].targeted && !target) return false;

  let text = "";
  switch (item) {
    case "medkit":
      target!.health = clamp(target!.health + 25, 0, 100);
      target!.conditions = target!.conditions.filter(c => c !== "injured");
      text = `${target!.name} gets patched up.`;
      break;
    case "antibiotics":
      target!.health = clamp(target!.health + 10, 0, 100);
      target!.conditions = target!.conditions.filter(c => c !== "sick");
      text = `${target!.name} takes the full course, as directed by nobody.`;
      break;
    case "parts": {
      if (s.van >= 100) return false;
      const mech = living(s).some(m => m.skill === "mechanical");
      s.van = clamp(s.van + VAN.partsRepair + (mech ? VAN.mechanicPartsBonus : 0), 0, 100);
      text = mech ? "Your mechanic installs the parts properly." : "You install the parts, mostly where they go.";
      break;
    }
    case "books":
      for (const m of living(s)) m.morale = clamp(m.morale + 15, 0, 100);
      text = "Everyone reads something with more than one point of view. Spirits lift.";
      break;
  }
  s.items[item] -= 1;
  log(s, { title: ITEM_USES[item].name, text });
  return true;
}

// ------------------------------------------------------------------ landmarks

export function landmarkAction(s: GameState, action: LandmarkActionId, rng: Rng): boolean {
  const stop = currentStop(s);
  const lm = LANDMARKS[stop.id];
  if (!lm || s.landmarkUsed.includes(action) || s.landmarkUsed.length >= RULES.landmarkActions) return false;
  if (action === "motel" && s.money < RULES.motelCost) return false;

  const member = rng.pick(living(s));
  const ctx = { memberId: member.id, stopName: stop.name };
  const deltas: Delta[] = [];
  let title = "";
  let text = "";
  let success: boolean | undefined;
  const heat = (n: number) => { const b = s.heat; addHeat(s, n); if (s.heat !== b) deltas.push({ label: "Heat", value: s.heat - b }); };

  switch (action) {
    case "talk": {
      // Whoever is better at talking does the talking.
      const options = (["persuasion", "negotiation"] as const).map(skill => ({ skill, odds: checkOdds(s, { skill, difficulty: "medium", faction: lm.faction }) }));
      const best = options.sort((a, b) => b.odds - a.odds)[0];
      success = rng.float() * 100 < best.odds;
      title = "Talking to Locals";
      text = render(s, success ? lm.talk.success : lm.talk.failure, ctx, skilledMember(s, best.skill)?.name);
      if (success) {
        heat(-15);
        s.rep[lm.faction] = clamp(s.rep[lm.faction] + 10, -100, 100);
        deltas.push({ label: `${lm.faction[0].toUpperCase()}${lm.faction.slice(1)} rep`, value: 10 });
      } else {
        heat(12);
        s.rep[lm.faction] = clamp(s.rep[lm.faction] - 5, -100, 100);
        deltas.push({ label: `${lm.faction[0].toUpperCase()}${lm.faction.slice(1)} rep`, value: -5 });
      }
      break;
    }
    case "scavenge": {
      success = rng.float() * 100 < checkOdds(s, { skill: "survival", difficulty: "medium" });
      title = "Scavenging";
      text = render(s, success ? lm.scavenge.success : lm.scavenge.failure, ctx, skilledMember(s, "survival")?.name);
      if (success) {
        s.food = round1(s.food + 15);
        deltas.push({ label: "Food", value: 15 });
        if (rng.chance(0.5)) { s.items.parts += 1; deltas.push({ label: "Spare parts", value: 1 }); }
      } else {
        if (!member.conditions.includes("injured")) member.conditions.push("injured");
        member.health = clamp(member.health - 8, 0, 100);
        deltas.push({ label: `${member.name} injured`, value: -1, unit: "tag" });
        heat(5);
      }
      break;
    }
    case "layLow": {
      title = "Laying Low";
      s.day += 1;
      const r = endOfDay(s, rng, "road");
      heat(-HEAT.layLowCooldown);
      deltas.push({ label: "Waited", value: 1, unit: "days" });
      text = r.deaths.length ? `You hide out for a day. ${r.deaths.join(" and ")} doesn't make it through.` : "You park behind a feed store and stay out of sight for a day. The heat dies down.";
      break;
    }
    case "work": {
      title = "Odd Jobs";
      s.day += 1;
      const r = endOfDay(s, rng, "road");
      const pay = rng.int(RULES.workPay[0], RULES.workPay[1]);
      s.money += pay;
      deltas.push({ label: "Money", value: pay, unit: "$" }, { label: "Worked", value: 1, unit: "days" });
      heat(RULES.workHeat);
      text = render(s, lm.work, ctx) + (r.deaths.length ? ` ${r.deaths.join(" and ")} doesn't make it through the day.` : "");
      break;
    }
    case "motel": {
      title = "Roadside Motel";
      s.money -= RULES.motelCost;
      deltas.push({ label: "Money", value: -RULES.motelCost, unit: "$" });
      s.day += 1;
      endOfDay(s, rng, "motel");
      heat(HEAT.motelHeat);
      text = "Real beds, thin walls, and a desk clerk who photocopies everyone's ID \"for the binder.\" Everyone sleeps; nobody's exhausted anymore.";
      break;
    }
  }

  s.landmarkUsed.push(action);
  log(s, { title, text, deltas });
  if (checkWipe(s)) return true;
  s.phase = { kind: "outcome", outcome: { title, text, deltas, success, deaths: [] }, then: "landmark" };
  return true;
}
