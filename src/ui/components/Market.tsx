import { BookOpen, Cross, Fuel, Package, Pill, ShoppingBag, Wheat } from "lucide-react";
import { cantBuy, SHOP_ITEMS, shopPrice, shopStock, type Action, type GameState } from "../../engine";

const ICON: Record<string, typeof Wheat> = { rations: Wheat, gas: Fuel, medkit: Cross, antibiotics: Pill, parts: Package, books: BookOpen };

export function Market({ state, dispatch, title = "Market" }: { state: GameState; dispatch: (a: Action) => void; title?: string }) {
  const stock = shopStock(state);
  return (
    <>
      <h3 className="sub"><ShoppingBag size={16} aria-hidden /> {title}</h3>
      <ul className="shop">
        {SHOP_ITEMS.filter(i => stock.includes(i.id)).map(item => {
          const price = shopPrice(state, item.id);
          const why = cantBuy(state, item.id);
          const Icon = ICON[item.id] ?? Package;
          return (
            <li key={item.id}>
              <Icon size={18} aria-hidden className="shop-icon" />
              <div className="shop-body">
                <strong>{item.name}</strong>
                <span className="muted small">{item.description}</span>
              </div>
              <button className="btn" disabled={!!why} title={why ?? undefined} aria-label={`Buy ${item.name} for $${price}${why ? ` (${why})` : ""}`} onClick={() => dispatch({ type: "buy", item: item.id })}>
                ${price}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
