import { useRef, useState } from "react";
import { CalendarCheck, Download, LogOut, Map as MapIcon, Upload } from "lucide-react";
import type { MetaState } from "../engine";
import { exportSave, importSave, readSavedGame, todayUTC, useGame } from "./useGame";
import { aiPreference, setAiPreference } from "./flavor";
import { Hud } from "./components/Hud";
import { Party } from "./components/Party";
import { Journal } from "./components/Journal";
import { RouteMap } from "./components/RouteMap";
import { Controls } from "./components/Controls";
import { EventCard, OutcomeCard } from "./screens/Encounter";
import { Road } from "./screens/Road";
import { Town } from "./screens/Town";
import { Landmark } from "./screens/Landmark";
import { GameOver } from "./screens/GameOver";
import { Setup } from "./screens/Setup";

type Game = ReturnType<typeof useGame>;

function Title({ meta, onNew, onDaily, onResume }: { meta: MetaState; onNew: () => void; onDaily: () => void; onResume: Game["resume"] }) {
  const saved = readSavedGame();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ai, setAi] = useState(aiPreference());
  const today = todayUTC();
  const daily = meta.daily[today];

  return (
    <main className="title">
      <h1>The Modern American Trail</h1>
      <p className="tagline">Portland to Vermont. Three friends, one van, and about four thousand miles of hellhole in between.</p>

      {saved && (
        <button className="btn primary wide" onClick={() => onResume(saved)}>
          <strong>Continue</strong>
          <span className="small">Day {saved.day}, {saved.totalMiles.toLocaleString("en-US")} miles{saved.daily ? " · Daily Run" : ""}</span>
        </button>
      )}
      <button className={`btn wide${saved ? "" : " primary"}`} onClick={onNew}>
        <strong>New run</strong>
        <span className="small">Pick your party, difficulty and departure month.</span>
      </button>
      <button className="btn wide" onClick={onDaily}>
        <strong><CalendarCheck size={14} aria-hidden /> Daily Run · {today}</strong>
        <span className="small">{daily ? `You scored ${daily.score.toLocaleString("en-US")} today. Replays don't count.` : "Same party, same roads, same luck as everyone else today."}</span>
      </button>

      {meta.runs > 0 && (
        <p className="muted small">
          {meta.runs} run{meta.runs === 1 ? "" : "s"}, {meta.wins} reached Vermont. Best: {Math.max(meta.bestScore.easy, meta.bestScore.normal, meta.bestScore.hard).toLocaleString("en-US")}.
        </p>
      )}

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
      <label className="toggle small">
        <input type="checkbox" checked={ai} onChange={e => { setAi(e.target.checked); setAiPreference(e.target.checked); }} />
        AI-written news headlines and epilogues (optional; the game is fully playable without them)
      </label>
      <p className="muted small footnote">A satirical road-trip game. Everything here is fictional commentary.</p>
    </main>
  );
}

export default function App() {
  const game = useGame();
  const { state, dispatch, meta, newUnlocks } = game;
  const [screen, setScreen] = useState<"title" | "setup">("title");
  const [showMap, setShowMap] = useState(false);

  if (!state) {
    return screen === "setup"
      ? <Setup meta={meta} onBack={() => setScreen("title")} onStart={o => { game.start(o); setScreen("title"); }} />
      : <Title meta={meta} onNew={() => setScreen("setup")} onDaily={game.startDaily} onResume={game.resume} />;
  }

  const phase = state.phase.kind;
  return (
    <div className="app">
      <nav className="topbar" aria-label="Game menu">
        <span className="brand">The Modern American Trail{state.daily ? <span className="muted small"> · Daily</span> : null}</span>
        <div className="topbar-actions">
          <button className="icon-btn" aria-pressed={showMap} aria-label="Toggle map" title="Map" onClick={() => setShowMap(v => !v)}><MapIcon size={18} /></button>
          <button className="icon-btn" aria-label="Download save file" title="Download save" onClick={() => exportSave(state)}><Download size={18} /></button>
          <button className="icon-btn" aria-label="Quit to title" title="Quit to title (progress is saved)" onClick={game.quit}><LogOut size={18} /></button>
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
          {phase === "landmark" && <Landmark state={state} dispatch={dispatch} />}
          {phase === "over" && <GameOver state={state} newUnlocks={newUnlocks} onNewGame={game.quit} />}
          <Controls state={state} dispatch={dispatch} />
        </main>
        <aside className="side">
          <Party state={state} />
          <Journal state={state} />
        </aside>
      </div>
    </div>
  );
}
