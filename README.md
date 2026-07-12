# Mental Math Trainer

A Tradermath-inspired mental arithmetic trainer for quant/trading-interview-style drills — timed sessions with configurable operations, number types, and question formats, scored on speed and accuracy.

**Live**: [anthony-mental-math-trainer.vercel.app](https://anthony-mental-math-trainer.vercel.app/)

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Zustand · Auth.js (Google OAuth) · Prisma · PostgreSQL (Supabase) · Vitest

## Features

- **Realistic quant-assessment number distributions** — not uniform random. Integer add/sub uses 10 weighted digit-count tiers (2-digit through 7-digit), multiplication favors "easy" 2x2 pairs and near-square hard pairs, division always resolves cleanly, decimals use exact scaled-integer arithmetic (no float drift), and fractions are always strictly reduced/improper (never mixed numbers). See `src/lib/mathEngine/` and its 95+ Vitest unit tests.
- **Configurable sessions** — toggle Addition/Subtraction/Multiplication/Division and Integer/Decimal/Fraction/Percentage independently, 1-10 minute duration, 20-120 questions (or unlimited), Open or Multiple Choice answers. Duration and question count both apply — a session ends at whichever limit is hit first.
- **Keyboard-first** — typing the exact correct answer auto-submits (no Enter needed) in Open mode; digit keys 1-5 select an MCQ option.
- **Progress tracking, guest or signed in** — a GitHub-style activity grid, lifetime stats, and last-session results. Works immediately with no account (persisted to `localStorage`). Sign in with Google to persist the same stats to a database instead, and unlock a `/history` dashboard with a score-over-time chart and a full per-session log.

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # Vitest suite for the math engine
npm run lint
npm run build
```

Guest mode works out of the box with no setup. To enable Google sign-in and database-backed history locally, create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://<pooled-connection>?pgbouncer=true"   # Supabase transaction pooler (port 6543)
DIRECT_URL="postgresql://<direct-or-session-pooler-connection>"  # used only by Prisma Migrate
AUTH_GOOGLE_ID="..."       # Google Cloud Console OAuth client
AUTH_GOOGLE_SECRET="..."
AUTH_SECRET="..."          # generate with: npx auth secret   (or: openssl rand -base64 33)
```

Then apply the schema and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

In Google Cloud Console, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI on the OAuth client.

## Architecture notes

- `src/lib/mathEngine/` — pure, dependency-free question generators. `generateQuestion(config, rng?)` is the single entry point; each generator takes an injectable RNG for deterministic testing.
- `src/lib/stats/statsRepository.ts` — a `StatsRepository` interface with two implementations: `localStorageStatsRepository.ts` (guest) and `dbStatsRepository.ts` (signed-in, backed by Prisma/Postgres via the `/api/scores*` routes). `src/stores/statsStore.ts` depends only on the interface; `StatsHydrator.tsx` is the single place that picks which implementation is active, based on auth state.
- `src/auth.ts` + `src/app/api/auth/[...nextauth]/route.ts` — Auth.js v5 configuration and route handler (Google OAuth, database session strategy).
- `prisma/schema.prisma` — `User`/`Account`/`Session`/`VerificationToken` (Auth.js adapter models) plus `TrainingSession` (one row per completed drill).
- `src/stores/` — Zustand: `configStore` (persisted dashboard toggles), `statsStore` (reactive cache over the active `StatsRepository`), `sessionStore` (ephemeral active-session runtime).

See `CLAUDE.md` for further detail on these decisions and a few non-obvious Supabase/Prisma gotchas.

## Deployment

Zero-config Vercel deploy — no `vercel.json` needed. Set the five env vars listed above on the Vercel project (Production, and any other environments you deploy to), and add each deployed origin's `/api/auth/callback/google` as an authorized redirect URI on the Google OAuth client.
