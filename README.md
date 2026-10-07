# The Modern American Trail

A satirical Oregon Trail. Three friends escape the Liberal Paradise of Portland in a van and drive about 4,000 miles through a hostile regime, stopping at other safe havens, to reach the Safe Haven of Vermont. Manage food, cash, health and morale; make choices at checkpoints and roadside events; get at least one person across the state line.

React + Vite + TypeScript, hosted on Cloudflare Pages (free tier). The game runs entirely in the browser; there is no server code.

## Quick start

```bash
npm install
npm run dev          # Vite dev server at http://localhost:5173
```

To run it the way Cloudflare serves it:

```bash
npm run pages:dev    # builds, then `wrangler pages dev` at http://localhost:8788
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run pages:dev` | Build and serve with Wrangler, as on Cloudflare |
| `npm test` | Vitest engine tests |
| `npm run validate` | Check event content (schema, effect bounds, chains, flags) and print a coverage report |
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
scripts/           sim.ts, bots.ts, validate-content.ts
```

**The engine is the game.** The UI only dispatches actions (`travel`, `choose`, `continue`, `buy`, `buyUpgrade`, `rest`, `leaveTown`) and renders state. The same reducer runs in the browser, the tests and the simulator. Given the same seed and actions, a run is identical everywhere.

**Saves** contain game state only, never UI state. The game autosaves to `localStorage` after every action. Players can download a save file and load it from the title screen. Loading validates the whole file; saves from the pre-rebuild version are rejected with a clear message.

## Balance

Tuned with `npm run sim` (10,000 runs per difficulty). The **smart** bot plays like a careful player using only what's on screen, including the displayed odds. **Casual** approximates a first-timer. **Random** is a floor.

| Difficulty | Target | Smart | Casual | Random |
|---|---|---|---|---|
| Easy | ~60% | 61.3% | 32.2% | 1.8% |
| Normal | 30–40% | 39.2% | 15.2% | 0.8% |
| Hard | 10–15% | 12.0% | 3.3% | 0.1% |

Most deaths are starvation (about 55%) or the road wearing people down (about 35%), with events making up the rest. Winning runs take roughly 45–49 days.

## Adding events

Events live in `src/engine/data/events.ts`. Each has an `id`, `where` (`road`, `paradise`, or `chain` for quest beats reached only via `next`), optional `regions` and `conditions`, `tags`, and up to four `choices`. A choice can require a skill, cost money, roll a skill check (`check` + `success`/`failure` outcomes), or have plain weighted `outcomes`. Outcomes carry `effects`, can set or clear flags, and can queue the next beat of a chain with `next`.

Text tokens: `{stop}`, `{leader}`, `{member}`, `{skilled}`. Run `npm run validate` after editing; the tests also run it.

## Deploying

The Pages project is connected to GitHub. Pushing to `main` deploys production. Pushing any other branch deploys a preview at `https://<branch>.modern-american-trail.pages.dev`.

Build settings: build command `npm run build`, output directory `dist`. `wrangler.toml` is the source of truth for Pages configuration.

### Environment variables

None are required right now; the game has no server code. `OPENROUTER_API_KEY` can stay set in the dashboard. It will be used again when optional AI flavor text returns in Phase 3.
