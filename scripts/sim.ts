// npm run sim [-- --runs 10000 --bot smart|casual|random|all --difficulty easy|normal|hard] [--strict]
// Plays seeded headless runs and reports win rates against the targets.
import { newGame, type Difficulty } from "../src/engine";
import { hashString } from "../src/engine/rng";
import { BOTS, playRun, type BotName, type RunResult } from "./bots";

const TARGETS: Record<Difficulty, [number, number]> = { easy: [0.55, 0.65], normal: [0.3, 0.4], hard: [0.1, 0.15] };

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const runs = Number(arg("runs", "10000"));
const botArg = arg("bot", "all");
const bots: BotName[] = botArg === "all" ? ["smart", "casual", "random"] : [botArg as BotName];
const diffArg = arg("difficulty", "all");
const difficulties: Difficulty[] = diffArg === "all" ? ["easy", "normal", "hard"] : [diffArg as Difficulty];

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
let outOfTarget = 0;

for (const bot of bots) {
  console.log(`\n=== ${bot} bot, ${runs.toLocaleString()} runs per difficulty ===`);
  console.log("difficulty  win rate  target       avg days (win / all)  survivors  starving days  unique events  top causes of death");
  for (const difficulty of difficulties) {
    const results: RunResult[] = [];
    const t0 = performance.now();
    for (let i = 0; i < runs; i++) {
      const seed = `sim-${difficulty}-${i}`;
      results.push(playRun(newGame({ seed, difficulty }), BOTS[bot], hashString(`${seed}-bot`)));
    }
    const wins = results.filter(r => r.win);
    const rate = wins.length / runs;
    const causes: Record<string, number> = {};
    for (const r of results) if (!r.win) causes[r.cause ?? "unknown"] = (causes[r.cause ?? "unknown"] ?? 0) + 1;
    const top = Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 4)
      .map(([c, n]) => `${c} ${pct(n / Math.max(1, runs - wins.length))}`).join(", ");
    const [lo, hi] = TARGETS[difficulty];
    const inTarget = rate >= lo && rate <= hi;
    if (bot === "smart" && !inTarget) outOfTarget++;
    console.log(
      `${difficulty.padEnd(10)}  ${pct(rate).padStart(8)}  ${`${pct(lo)}-${pct(hi)}`.padEnd(11)}${bot === "smart" ? (inTarget ? "✓" : "✗") : " "}` +
      `  ${mean(wins.map(r => r.days)).toFixed(1).padStart(8)} / ${mean(results.map(r => r.days)).toFixed(1).padEnd(9)}` +
      `  ${mean(wins.map(r => r.survivors)).toFixed(2).padStart(9)}  ${mean(results.map(r => r.starvingDays)).toFixed(1).padStart(13)}` +
      `  ${mean(results.map(r => r.uniqueEvents)).toFixed(1).padStart(13)}  ${top}` +
      `   (${((performance.now() - t0) / 1000).toFixed(1)}s)`
    );
  }
}
console.log("\nTargets apply to the smart bot (a careful player). Casual approximates a first-timer; random is a floor.");
if (process.argv.includes("--strict") && outOfTarget) process.exit(1);
