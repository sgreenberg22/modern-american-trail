import { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import {
  CHARACTERS, DIFFICULTY, KITS, MONTH_NAMES, PARTY_SIZE, UNLOCKS, isUnlocked,
  type Difficulty, type MetaState, type NewGameOptions
} from "../../engine";
import { skillLabel } from "../components/Party";

const DIFFICULTY_BLURB: Record<Difficulty, string> = {
  easy: "More money, more forgiving roads.",
  normal: "The trip as intended. Most parties don't make it.",
  hard: "Less of everything, meaner checkpoints. Triple-ish score."
};

const MONTHS: { month: number; note: string }[] = [
  { month: 4, note: "Spring rain in the Northwest, storms on the plains." },
  { month: 6, note: "Summer heat and thunderstorms. The classic." },
  { month: 8, note: "Heat waves early, cooler by the end." },
  { month: 10, note: "Snow in the mountains and maybe Vermont. For the brave." }
];

const hintFor = (unlock?: string) => UNLOCKS.find(u => u.id === unlock)?.hint ?? "";

export function Setup({ meta, onStart, onBack }: { meta: MetaState; onStart: (o: Omit<NewGameOptions, "seed">) => void; onBack: () => void }) {
  const available = CHARACTERS.filter(c => isUnlocked(meta, c.unlock));
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [month, setMonth] = useState(6);
  const [party, setParty] = useState<string[]>(() => available.slice(0, PARTY_SIZE).map(c => c.id));
  const [kit, setKit] = useState("cooler");

  const toggle = (id: string) =>
    setParty(p => (p.includes(id) ? p.filter(x => x !== id) : p.length < PARTY_SIZE ? [...p, id] : [...p.slice(1), id]));

  return (
    <main className="setup">
      <button className="btn link" onClick={onBack}><ArrowLeft size={14} aria-hidden /> Back</button>
      <h1>New run</h1>

      <fieldset>
        <legend className="sub">Difficulty</legend>
        <div className="segmented" role="radiogroup">
          {(Object.keys(DIFFICULTY) as Difficulty[]).map(d => (
            <button key={d} role="radio" aria-checked={difficulty === d} className={difficulty === d ? "on" : ""} onClick={() => setDifficulty(d)}>
              {DIFFICULTY[d].label}
            </button>
          ))}
        </div>
        <p className="muted small">{DIFFICULTY_BLURB[difficulty]}</p>
      </fieldset>

      <fieldset>
        <legend className="sub">Leave in</legend>
        <div className="segmented" role="radiogroup">
          {MONTHS.map(m => (
            <button key={m.month} role="radio" aria-checked={month === m.month} className={month === m.month ? "on" : ""} onClick={() => setMonth(m.month)}>
              {MONTH_NAMES[m.month - 1]}
            </button>
          ))}
        </div>
        <p className="muted small">{MONTHS.find(m => m.month === month)?.note}</p>
      </fieldset>

      <fieldset>
        <legend className="sub">Party ({party.length}/{PARTY_SIZE})</legend>
        <ul className="picker">
          {CHARACTERS.map(c => {
            const open = isUnlocked(meta, c.unlock);
            const on = party.includes(c.id);
            return (
              <li key={c.id}>
                <button className={`pick${on ? " on" : ""}`} disabled={!open} aria-pressed={on} onClick={() => toggle(c.id)}>
                  <span className="pick-head">
                    <strong>{c.name}</strong> <span className="muted small">{c.profession}</span>
                    {open ? <span className="tag">{skillLabel(c.skill)}</span> : <Lock size={14} aria-label="Locked" />}
                  </span>
                  <span className="small muted">{open ? c.blurb : hintFor(c.unlock)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="sub">Starting kit</legend>
        <ul className="picker">
          {KITS.map(k => {
            const open = isUnlocked(meta, k.unlock);
            return (
              <li key={k.id}>
                <button className={`pick${kit === k.id ? " on" : ""}`} disabled={!open} aria-pressed={kit === k.id} onClick={() => setKit(k.id)}>
                  <span className="pick-head"><strong>{k.name}</strong>{!open && <Lock size={14} aria-label="Locked" />}</span>
                  <span className="small muted">{open ? k.description : hintFor(k.unlock)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <button className="btn primary wide-center" disabled={party.length !== PARTY_SIZE} onClick={() => onStart({ difficulty, startMonth: month, party, kit })}>
        {party.length === PARTY_SIZE ? "Load the van" : `Pick ${PARTY_SIZE - party.length} more`}
      </button>
    </main>
  );
}
