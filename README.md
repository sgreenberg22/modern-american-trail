# The Modern American Trail

A satirical Oregon Trail. Three friends escape the Liberal Paradise of Portland in a van and drive about 4,000 miles through a hostile regime, stopping at other safe havens, to reach the Safe Haven of Vermont. Manage food, cash, health and morale; make choices at checkpoints and roadside events; get at least one person across the state line.

React + Vite + TypeScript, hosted on Cloudflare Pages (free tier). The game runs entirely in the browser; there is no server code.

## Quick start

```bash
npm install
npm run dev          # Vite dev server at http://localhost:5173 (no AI; authored text only)
```

To run it the way Cloudflare serves it (static assets plus the Worker):

```bash
npm run worker:dev   # builds, then `wrangler dev` at http://localhost:8787
```

Workers AI calls from `wrangler dev` go to your Cloudflare account, so run `npx wrangler login` first if you want AI text locally. Without it the game falls back to authored text.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run worker:dev` | Build and serve with Wrangler (assets + Worker), as on Cloudflare |
| `npm run deploy` | Build and `wrangler deploy` (normally Workers Builds does this from GitHub) |
| `npm test` | Vitest engine tests |
| `npm run validate` | Check content (events, chains, banter, vignettes, items) and print a coverage report |
| `npm run sim` | 10,000 seeded headless runs per difficulty with three bots; reports win rates against targets |
| `npm run check` | Typecheck + validate + test |

`npm run sim -- --runs 2000 --bot smart --difficulty normal` narrows a run. Add `--strict` to exit non-zero if the smart bot misses a target.

## How it's built

```
src/engine/        Pure game engine: no React, no Math.random, no DOM
  engine.ts        applyAction(state, action) reducer, newGame()
  selectors.ts     Read-only queries (odds, prices, ETA) shared by UI, bots and tests
  rng.ts           Seeded mulberry32; generator state lives in GameState.rng
  save.ts          Versioned, zod-validated save format with a migration hook
  content.ts       Content validator
  config.ts        Difficulty settings and rules
  data/            Route (real coordinates), characters, items, events
src/ui/            React components; useGame() wires the engine to React
worker/            Cloudflare Worker: static assets + optional /api/flavor
scripts/           sim.ts, bots.ts, validate-content.ts
```

**The engine is the game.** The UI only dispatches actions (`travel`, `choose`, `continue`, `buy`, `buyUpgrade`, `rest`, `leaveTown`) and renders state. The same reducer runs in the browser, the tests and the simulator. Given the same seed and actions, a run is identical everywhere.

**Saves** contain game state only, never UI state. The game autosaves to `localStorage` after every action. Players can download a save file and load it from the title screen. Loading validates the whole file; saves from the pre-rebuild version are rejected with a clear message.

## How a run works

You start in Portland with a van, three travelers, some food, gas and cash, and drive about 4,000 miles to Vermont.

- **Pace and rations** trade speed against health, morale, food and gas.
- **The van** burns gas (25 gal tank, about 24 mpg) and wears down. Below 30% it can break down; at 0% it crawls. Run out of gas and you're on foot until you find a way to get more.
- **Paradises** (Seattle, Twin Cities, Madison, Chicago, Baltimore, Philadelphia) are safe stops with a market that has its own stock and stable prices, a garage, upgrades, and a safe house to rest in. You can also stay for good, which ends the run with a partial score.
- **Landmarks** (Boise, Helena, Bismarck, Indianapolis, Louisville, Charleston, Richmond) are hostile stops. They have an overpriced gas station, and you can do two of: talk to locals, scavenge, pick up odd jobs, lay low, or take a motel room.
- **Heat** rises at checkpoints and from risky choices, and cools over time. At 60 you're wanted: checkpoints get harder and pursuit events start. At 100 you're arrested; you can post bail, use a lawyer, try to escape, or wait it out.
- **Conditions** (injured, sick, exhausted) drain people and lower the odds of checks they make. Medkits, antibiotics and rest treat them.
- **Factions** (Resistance, Faithful, Militia) remember you. Reputation shifts odds, prices and donations.
- **Weather** follows region and season, so a fall departure meets snow in the mountains.

Eight endings: everyone makes it, some make it, one makes it, settling down early, detained, starved, worn down, and lost. Runs earn a score; Hard is worth 2.5×.

Between runs, five characters and four starting kits unlock (reach Chicago, escape jail, win on Normal, and so on). The **Daily Run** gives everyone the same seed, party and month each UTC day, and produces a shareable result.

## Balance

Tuned with `npm run sim` (10,000 runs per difficulty). The **smart** bot plays like a careful player using only what's on screen, including the displayed odds. **Casual** approximates a first-timer who keeps food and gas stocked but ignores pace, rations and landmarks. **Random** is a floor.

| Difficulty | Target | Smart | Casual | Random |
|---|---|---|---|---|
| Easy | ~60% | 62.5% | 21.3% | 0.1% |
| Normal | 30–40% | 36.1% | 8.1% | 0.0% |
| Hard | 10–15% | 12.3% | 1.8% | 0.0% |

Event effects run at about 1.0× on every difficulty, so the numbers in the text are what happens. Difficulty comes from food, daily wear and money. Careful players mostly lose to wear; careless ones mostly starve. Winning runs take about 48–53 days.

## Content

All content is data in `src/engine/data/`, checked by `npm run validate` (and by the tests):

- **Events** (`events/`): 289 in themed files. That's 265 standalone, 12 quest chains of 3–4 beats whose flags carry across the run, and per-city paradise scenes. Nothing repeats within a run until its pool is exhausted. Read `docs/tone.md` before writing any.
- **Items** (`items.ts`): 60, sold at stops with seeded stock and prices, or found on the road.
- **Banter** (`banter.ts`): 20+ lines per character, many tied to the moment (hunger, heat, weather, grief, a particular companion).
- **Vignettes** (`vignettes.ts`, `landmarks.ts`): a scene for every checkpoint, city and landmark.
- **Headlines** (`headlines.ts`): the authored news ticker, by region.

An event has an `id`, `where` (`road`, `paradise`, or `chain` for beats reached only via `next`), optional `regions` and `conditions` (day, flags, skills, items, heat, reputation, weather, season, specific stops), `tags`, and up to four `choices`. A choice can require a skill or item, cost money, food, gas or items, roll a skill check (`check` + `success`/`failure`), or have weighted `outcomes`. Outcomes carry `effects`, set or clear flags, and can queue the next chain beat with `next` and `nextIn` (days). Text tokens: `{stop}`, `{leader}`, `{member}`, `{skilled}`.

## Deploying

The site is a Cloudflare **Worker with static assets** (`wrangler.toml`): `dist/` is served as-is, and `worker/index.ts` runs only for `/api/*`.

**One-time setup (Workers Builds, connected to GitHub):**
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → pick `sgreenberg22/modern-american-trail`.
2. Build command `npm run build`, deploy command `npx wrangler deploy`. Leave "non-production branch deploy command" as `npx wrangler versions upload` so other branches get preview URLs.
3. Optional: under the Worker's **Settings → Variables and Secrets**, add the secret `OPENROUTER_API_KEY` (only used as a fallback; Workers AI needs no key).
4. Once the Worker is live, the old Pages project can be deleted. Until then, Pages ignores `wrangler.toml` (it has no `pages_build_output_dir`) and keeps serving the static game without AI.

### Environment

| Name | Kind | Purpose |
|---|---|---|
| `AI` | Workers AI binding | Headlines and epilogues. Free daily allocation; stops (doesn't bill) when used up on the free plan. |
| `FLAVOR_LIMITER` | Rate limit binding | 10 requests per minute per IP on `/api/flavor`. Falls back to an in-memory limiter if unavailable. |
| `OPENROUTER_MODELS` | Var | Comma-separated fallback models. Anything not ending in `:free` is ignored. |
| `OPENROUTER_API_KEY` | Secret (optional) | Enables the OpenRouter fallback. |

### AI is optional

Everything AI writes is garnish: news-ticker headlines and an end-of-run epilogue. The ticker always has authored headlines, the first AI error turns AI off for the session, and players can switch it off on the title screen. The endpoint only accepts structured game context (no prompts, no model choice), caps body size, rate-limits by IP, caches shared headlines at the edge, and uses only free models, so the cost of abuse is $0.
