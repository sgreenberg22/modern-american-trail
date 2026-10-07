import type { GameState, Member } from "../../engine";

const SKILL_LABEL: Record<Member["skill"], string> = {
  hacking: "Hacking", persuasion: "Persuasion", survival: "Survival", mechanical: "Mechanical",
  medical: "Medical", negotiation: "Negotiation", intimidation: "Intimidation", stealth: "Stealth"
};

export const skillLabel = (s: Member["skill"]) => SKILL_LABEL[s];

function Meter({ label, value, kind }: { label: string; value: number; kind: "health" | "morale" }) {
  const level = value <= 25 ? "low" : value <= 50 ? "mid" : "ok";
  return (
    <div className="meter">
      <span className="meter-label">{label}</span>
      <div className={`bar ${kind} ${level}`} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <div style={{ width: `${value}%` }} />
      </div>
      <span className="meter-value">{value}</span>
    </div>
  );
}

export function Party({ state }: { state: GameState }) {
  return (
    <section className="panel" aria-labelledby="party-h">
      <h2 id="party-h" className="panel-title">Party</h2>
      <ul className="party">
        {state.party.map(m => (
          <li key={m.id} className={`member${m.alive ? "" : " dead"}`}>
            <div className="member-head">
              <strong>{m.name}</strong>
              <span className="muted small">{m.profession}</span>
            </div>
            <div className="tag">{skillLabel(m.skill)}</div>
            {m.alive ? (
              <>
                <Meter label="Health" value={m.health} kind="health" />
                <Meter label="Morale" value={m.morale} kind="morale" />
              </>
            ) : (
              <p className="small muted">Lost on day {m.diedOnDay} ({m.causeOfDeath}).</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
