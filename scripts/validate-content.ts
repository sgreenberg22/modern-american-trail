// npm run validate: checks event content and prints a coverage report.
import { TARGETS, validateContent } from "../src/engine/content";

const r = validateContent();

console.log(`${r.total} events: ${r.standalone}/${TARGETS.standalone} standalone, ${r.chains.length}/${TARGETS.chains} quest chains (${r.chains.map(c => `${c.start} ${c.beats}`).join(", ")})\n`);
console.log("Region      road  paradise");
for (const c of r.coverage) console.log(`${c.region.padEnd(11)} ${String(c.road).padStart(4)}  ${String(c.paradise).padStart(8)}`);
console.log("\nTags: " + Object.entries(r.tags).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(", "));
if (r.errors.length) {
  console.error(`\n${r.errors.length} error(s):\n- ` + r.errors.join("\n- "));
  process.exit(1);
}
console.log("\nOK");
