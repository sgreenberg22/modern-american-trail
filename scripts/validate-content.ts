// npm run validate: checks event content and prints a coverage report.
import { TARGETS, validateContent, validateFlavor } from "../src/engine/content";
import { ITEMS } from "../src/engine/data/items";

const r = validateContent();

console.log(`${r.total} events: ${r.standalone}/${TARGETS.standalone} standalone, ${r.chains.length}/${TARGETS.chains} quest chains (${r.chains.map(c => `${c.start} ${c.beats}`).join(", ")})\n`);
console.log("Region      road  paradise");
for (const c of r.coverage) console.log(`${c.region.padEnd(11)} ${String(c.road).padStart(4)}  ${String(c.paradise).padStart(8)}`);
console.log("\nTags: " + Object.entries(r.tags).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(", "));
const f = validateFlavor();
console.log(`\nBanter: ${Object.entries(f.banter).map(([c, n]) => `${c} ${n}`).join(", ")}`);
console.log(`Vignettes: ${f.vignettes}. Items: ${ITEMS.length}.`);
const errors = [...r.errors, ...f.errors];
if (errors.length) {
  console.error(`\n${errors.length} error(s):\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log("\nOK");
