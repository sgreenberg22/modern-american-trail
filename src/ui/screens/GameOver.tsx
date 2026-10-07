import { useState } from "react";
import { Share2, Unlock } from "lucide-react";
import { endingOf, fillEndingText, living, score, shareText, type GameState, type UnlockDef } from "../../engine";

export function GameOver({ state, newUnlocks, onNewGame }: { state: GameState; newUnlocks: UnlockDef[]; onNewGame: () => void }) {
  const [copied, setCopied] = useState(false);
  const ending = endingOf(state);
  if (!ending) return null;
  const s = score(state);
  const share = shareText(state);

  async function doShare() {
    try {
      if (navigator.share) await navigator.share({ text: share });
      else { await navigator.clipboard.writeText(share); setCopied(true); }
    } catch { /* user cancelled the share sheet */ }
  }

  return (
    <section className={`panel card-over ${ending.kind}`} aria-labelledby="over-h">
      {state.daily && <p className="muted small">Daily Run · {state.daily}</p>}
      <h2 id="over-h">{ending.title}</h2>
      <p className="prose">{fillEndingText(state, ending.id)}</p>

      <div className="score">
        <div className="score-total"><span className="muted small">Score</span><strong>{s.total.toLocaleString("en-US")}</strong></div>
        <ul className="score-parts">
          {s.parts.map(p => <li key={p.label}><span>{p.label}</span><span>{p.value >= 0 ? "+" : "−"}{Math.abs(p.value).toLocaleString("en-US")}</span></li>)}
        </ul>
      </div>

      <dl className="summary">
        <div><dt>Survivors</dt><dd>{living(state).length} of {state.party.length}</dd></div>
        <div><dt>Days</dt><dd>{state.day}</dd></div>
        <div><dt>Miles</dt><dd>{state.totalMiles.toLocaleString("en-US")}</dd></div>
        <div><dt>Skill checks</dt><dd>{state.stats.checksPassed} passed, {state.stats.checksFailed} failed</dd></div>
        <div><dt>Hungry days</dt><dd>{state.stats.foodShortDays}</dd></div>
        <div><dt>Arrests</dt><dd>{state.stats.arrests}</dd></div>
      </dl>

      {newUnlocks.length > 0 && (
        <div className="unlocks" role="status">
          <h3 className="sub"><Unlock size={16} aria-hidden /> Unlocked</h3>
          <ul>{newUnlocks.map(u => <li key={u.id}><strong>{u.label}</strong></li>)}</ul>
          <p className="muted small">New characters and starting kits are on the setup screen.</p>
        </div>
      )}

      <pre className="share-preview" aria-label="Shareable result">{share}</pre>
      <div className="town-actions">
        <button className="btn" onClick={doShare}><Share2 size={16} aria-hidden /> {copied ? "Copied" : "Share result"}</button>
        <button className="btn primary" autoFocus onClick={onNewGame}>Try again</button>
      </div>
    </section>
  );
}
