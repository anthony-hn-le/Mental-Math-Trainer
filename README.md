# Mental Math Trainer

A Tradermath-inspired mental arithmetic trainer for quant/trading-interview-style drills — timed sessions with configurable operations, number types, and question formats, scored on speed and accuracy.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Zustand · Vitest

## Features

- **Realistic quant-assessment number distributions** — not uniform random. Integer add/sub uses 10 weighted digit-count tiers (2-digit through 7-digit), multiplication favors "easy" 2x2 pairs and near-square hard pairs, division always resolves cleanly, decimals use exact scaled-integer arithmetic (no float drift), and fractions are always strictly reduced/improper (never mixed numbers). See `src/lib/mathEngine/` and its 80+ Vitest unit tests.
- **Configurable sessions** — toggle Addition/Subtraction/Multiplication/Division and Integer/Decimal/Fraction independently, 1 or 10 minute duration, 20-120 questions (or unlimited), Open or Multiple Choice answers. Duration and question count both apply — a session ends at whichever limit is hit first.
- **Keyboard-first** — typing the exact correct answer auto-submits (no Enter needed) in Open mode; digit keys 1-5 select an MCQ option.
- **Guest-mode progress tracking** — a GitHub-style activity grid, lifetime stats, and last-session results, all persisted to `localStorage`. No account required.

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # Vitest suite for the math engine
npm run lint
npm run build
```

## Architecture notes

- `src/lib/mathEngine/` — pure, dependency-free question generators. `generateQuestion(config, rng?)` is the single entry point; each generator takes an injectable RNG for deterministic testing.
- `src/lib/stats/statsRepository.ts` — the seam for a future authenticated/DB-backed persistence layer (NextAuth + Prisma + Supabase Postgres). Not implemented in this MVP; `localStorageStatsRepository.ts` is the only implementation today, and `src/stores/statsStore.ts` depends only on the interface.
- `src/stores/` — Zustand: `configStore` (persisted dashboard toggles), `statsStore` (reactive cache over `StatsRepository`), `sessionStore` (ephemeral active-session runtime).

See `CLAUDE.md` for more detail on these decisions.

## Deployment

Zero-config Vercel deploy — no `vercel.json` needed.
