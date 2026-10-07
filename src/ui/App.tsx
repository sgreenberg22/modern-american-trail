import { useRef, useState } from "react";
import { Download, LogOut, Map as MapIcon, Upload } from "lucide-react";
import { DIFFICULTY, type Difficulty } from "../engine";
import { exportSave, importSave, readSavedGame, useGame } from "./useGame";
import { Hud } from "./components/Hud";
import { Party } from "./components/Party";
import { Journal } from "./components/Journal";
import { RouteMap } from "./components/RouteMap";
import { EventCard, OutcomeCard } from "./screens/Encounter";
import { Road } from "./screens/Road";
import { Town } from "./screens/Town";
import { GameOver } from "./screens/GameOver";

const DIFFICULTY_BLURB: Record<Difficulty, string> = {
  easy: "More forgiving roads and better odds.",
  normal: "The trip as intended. Most parties don't make it.",
  hard: "Less food, less money, meaner checkpoints."
};

function Title({ onStart, onResume }: { onStart: (d: Difficulty) => void; onResume: ReturnType<typeof useGame>["resume"] }) {
  const saved = readSavedGame();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="title">
      <h1>The Modern American Trail</h1>
      <p className="tagline">Portland to Vermont. Three friends, one van, and roughly four thousand miles of hellhole in between.</p>

      {saved && (
        <button className="btn primary wide" onClick={() => onResume(saved)}>
          Continue: day {saved.day}, {saved.totalMiles.toLocaleString("en-US")} miles
        </button>
      )}

      <h2 className="sub">New run</h2>
      <div className="difficulty">
        {(Object.keys(DIFFICULTY) as Difficulty[]).map(d => (
          <button key={d} className={`btn wide${!saved && d === "normal" ? " primary" : ""}`} onClick={() => onStart(d)}>
            <strong>{DIFFICULTY[d].label}</strong>
            <span className="small">{DIFFICULTY_BLURB[d]}</span>
          </button>
        ))}
      </div>

      <button className="btn link" onClick={() => fileRef.current?.click()}><Upload size={14} aria-hidden /> Load a save file</button>
      <input
        ref={fileRef} type="file" accept="application/json,.json" hidden
        onChange={async e => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          const r = await importSave(f);
          if (r.ok) onResume(r.state); else setError(r.error);
        }}
      />
      {error && <p className="error" role="alert">{error}</p>}
      <p className="muted small footnote">A satirical road-trip game. Everything here is fictional commentary.</p>
    </main>
  );
}

export default function App() {
  const { state, dispatch, start, resume, quit } = useGame();
  const [showMap, setShowMap] = useState(false);

  if (!state) return <Title onStart={d => start(d)} onResume={resume} />;

  const phase = state.phase.kind;
  return (
    <div className="app">
      <nav className="topbar" aria-label="Game menu">
        <span className="brand">The Modern American Trail</span>
        <div className="topbar-actions">
          <button className="icon-btn" aria-pressed={showMap} aria-label="Toggle map" title="Map" onClick={() => setShowMap(v => !v)}><MapIcon size={18} /></button>
          <button className="icon-btn" aria-label="Download save file" title="Download save" onClick={() => exportSave(state)}><Download size={18} /></button>
          <button className="icon-btn" aria-label="Quit to title" title="Quit to title (progress is saved)" onClick={quit}><LogOut size={18} /></button>
        </div>
      </nav>

      <Hud state={state} />
      {showMap && <RouteMap state={state} />}

      <div className="layout">
        <main className="main">
          {phase === "road" && <Road state={state} dispatch={dispatch} />}
          {phase === "event" && <EventCard state={state} dispatch={dispatch} />}
          {phase === "outcome" && <OutcomeCard state={state} dispatch={dispatch} />}
          {phase === "town" && <Town state={state} dispatch={dispatch} />}
          {phase === "over" && <GameOver state={state} onNewGame={quit} />}
        </main>
        <aside className="side">
          <Party state={state} />
          <Journal state={state} />
        </aside>
      </div>
    </div>
  );
}
