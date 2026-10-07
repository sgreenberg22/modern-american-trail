import { BedDouble, BookOpen, Cross, Package, ShoppingBag, Wheat } from "lucide-react";
import {
  currentStop, expectedMilesPerDay, foodPerDay, living, milesToNextTown, nextTown, shopPrice,
  RULES, SHOP_ITEMS, UPGRADES, type Action, type GameState
} from "../../engine";

const ITEM_ICON: Record<string, typeof Wheat> = { rations: Wheat, medkit: Cross, books: BookOpen, kit: Package };

export function Town({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const here = currentStop(state);
  const next = nextTown(state);
  const days = Math.ceil(milesToNextTown(state) / expectedMilesPerDay(state));
  const foodNeeded = Math.ceil(days * foodPerDay(state));
  const lowest = Math.min(...living(state).map(m => m.health));

  return (
    <section className="panel card-town" aria-labelledby="town-h">
      <h2 id="town-h">{here.name}</h2>
      <p className="prose">
        A safe stop. {next ? <>The next one is <strong>{next.name}</strong>, roughly {days} days of driving.
        You'll eat about <strong>{foodNeeded} food</strong> getting there and have <strong>{Math.floor(state.food)}</strong>.</> : null}
      </p>

      <h3 className="sub"><ShoppingBag size={16} aria-hidden /> Market</h3>
      <ul className="shop">
        {SHOP_ITEMS.map(item => {
          const price = shopPrice(state, item.id);
          const Icon = ITEM_ICON[item.id] ?? Package;
          return (
            <li key={item.id}>
              <Icon size={18} aria-hidden className="shop-icon" />
              <div className="shop-body">
                <strong>{item.name}</strong>
                <span className="muted small">{item.description}</span>
              </div>
              <button className="btn" disabled={state.money < price} onClick={() => dispatch({ type: "buy", item: item.id })}>
                ${price}
              </button>
            </li>
          );
        })}
      </ul>

      <h3 className="sub">Upgrades</h3>
      <ul className="shop">
        {UPGRADES.map(u => {
          const owned = state.upgrades.includes(u.id);
          return (
            <li key={u.id}>
              <div className="shop-body">
                <strong>{u.name}</strong>
                <span className="muted small">{u.description}</span>
              </div>
              <button className="btn" disabled={owned || state.money < u.price} onClick={() => dispatch({ type: "buyUpgrade", upgrade: u.id })}>
                {owned ? "Owned" : `$${u.price}`}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="town-actions">
        <button className="btn" disabled={state.money < RULES.restCost} onClick={() => dispatch({ type: "rest" })}>
          <BedDouble size={16} aria-hidden /> Rest a day (${RULES.restCost})
          <span className="muted small"> +{RULES.restHealth} health{lowest < 50 ? ", recommended" : ""}</span>
        </button>
        <button className="btn primary" onClick={() => dispatch({ type: "leaveTown" })}>Hit the road</button>
      </div>
    </section>
  );
}
