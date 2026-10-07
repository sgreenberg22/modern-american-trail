import { BookOpen, Coins, Cross, Fuel, Package, Pill, ShoppingBag, Wheat, Wrench } from "lucide-react";
import {
  cantBuy, ITEMS_BY_ID, SHOP_ITEMS, sellPrice, shopPrice, shopStock, type Action, type GameState
} from "../../engine";

const ICON: Record<string, typeof Wheat> = { rations: Wheat, gas: Fuel, medkit: Cross, antibiotics: Pill, parts: Package, books: BookOpen };

export function Market({ state, dispatch, title = "Market" }: { state: GameState; dispatch: (a: Action) => void; title?: string }) {
  const stock = shopStock(state);
  const sellable = Object.entries(state.items)
    .filter(([id, n]) => n > 0 && sellPrice(state, id) > 0)
    .map(([id, n]) => ({ def: ITEMS_BY_ID.get(id)!, n, price: sellPrice(state, id) }))
    .sort((a, b) => b.price - a.price);

  return (
    <>
      <h3 className="sub"><ShoppingBag size={16} aria-hidden /> {title}</h3>
      <ul className="shop">
        {stock.map(id => SHOP_ITEMS.find(i => i.id === id)!).map(item => {
          const price = shopPrice(state, item.id);
          const why = cantBuy(state, item.id);
          const kind = item.item ? ITEMS_BY_ID.get(item.item)?.kind : undefined;
          const Icon = ICON[item.id] ?? (kind === "tool" ? Wrench : Package);
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
      {sellable.length > 0 && (
        <>
          <h3 className="sub"><Coins size={16} aria-hidden /> Sell</h3>
          <ul className="shop">
            {sellable.map(({ def, n, price }) => (
              <li key={def.id}>
                <div className="shop-body">
                  <strong>{def.name}{n > 1 ? ` ×${n}` : ""}</strong>
                  {def.wantedAt === state.stops[state.stopIndex].kind && <span className="small good-text">In demand here</span>}
                </div>
                <button className="btn" aria-label={`Sell ${def.name} for $${price}`} onClick={() => dispatch({ type: "sell", item: def.id })}>+${price}</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
