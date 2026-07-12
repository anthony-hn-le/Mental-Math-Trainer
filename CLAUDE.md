@AGENTS.md

# Project: Mental Math Trainer

Tradermath-inspired mental arithmetic trainer for quant/trading-interview-style drills. Standalone project — not part of the `portfolio/` repo. Live at https://anthony-mental-math-trainer.vercel.app/, GitHub `anthony-hn-le/Mental-Math-Trainer`, linked from `portfolio/src/data/projects.ts` as `mental-math-trainer`.

## Stack (as actually installed)
- Next.js 16.2.10, App Router, React 19.2.4, TypeScript ^5
- Tailwind CSS v4 — CSS-first config, no `tailwind.config.ts`
- shadcn/ui (initialized fresh in this project — first use in this environment). Uses `@base-ui/react` primitives (shadcn's current default), not Radix.
- Zustand for state (first use in this environment) — no Context, no Redux/Jotai
- `next-themes` for dark/light
- `next-auth@beta` (Auth.js v5) + `@auth/prisma-adapter` — Google OAuth, database session strategy
- `prisma` / `@prisma/client` (pinned to 6.x, not 7 — see below) on Supabase Postgres, used purely as a Postgres host
- Vitest for unit tests (`npm test`), node environment, no jsdom — `src/lib/mathEngine` is pure logic

Per `AGENTS.md`: this Next.js version has real breaking changes vs. training data — check `node_modules/next/dist/docs/` before writing App Router code you haven't verified against this version.

## Auth + DB-backed history (Phase 2, now built)
Google sign-in is optional — guest mode still works exactly as before, with stats persisted to `localStorage` via Zustand's `persist` middleware. Signing in switches persistence to Postgres (Supabase) via Prisma; signing out reverts to the (separate, untouched) guest localStorage stats. No migration of guest history into the DB on sign-in — deliberately a fresh start.

The seam this was built on: `src/lib/stats/statsRepository.ts` is a `StatsRepository` interface (`recordSession`, `getLastSession`, `getActivity`, `getLifetimeStats`) with two implementations — `localStorageStatsRepository.ts` (guest) and `dbStatsRepository.ts` (signed-in, calls the `/api/scores*` routes). `src/stores/statsStore.ts` holds the active repository in state (`setRepository`); `src/components/shared/StatsHydrator.tsx` is the one place that knows about auth — it watches `useSession()` and swaps the repository + re-hydrates on status change. No other component changed to support this.

- **Prisma pinned to 6.x, not 7** — Prisma 7 changed default client generation (explicit output path, ESM-first) and was less proven with `@auth/prisma-adapter` at the time this was built.
- **Two Supabase connection strings**: `DATABASE_URL` (pooled, port 6543, `pgbouncer=true`) for the app at runtime, `DIRECT_URL` (session-mode pooler, port 6543→5432 via `aws-0-<region>.pooler.supabase.com:5432`, *not* the raw `db.<ref>.supabase.co:5432` host) for Prisma Migrate — Supabase's direct-connection host is IPv6-only by default and unreachable from plain IPv4 networks, so the session-mode pooler is used as the IPv4-compatible substitute for migrations.
- Both live in a root **`.env`** (not `.env.local`) since the Prisma CLI auto-loads `.env` but not `.env.local`.
- **RLS is disabled on all Prisma-managed tables** (`User`, `Account`, `Session`, `VerificationToken`, `TrainingSession`) — intentional, not an oversight. Nothing in this app ever uses `supabase-js` or exposes a Supabase key client-side; all DB access is server-side Prisma via `DATABASE_URL`, with access control enforced by API routes checking the Auth.js session. RLS only matters the moment something queries these tables through Supabase's REST/client API — don't add that without enabling RLS + policies first.
- Vercel Production has all 5 env vars set (`DATABASE_URL`, `DIRECT_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`) via `vercel env add`. Preview deployments do **not** have a matching Google OAuth redirect URI registered — sign-in will fail on preview URLs until one's added in Google Cloud Console.

## Key design decisions
- **Session end rule**: Duration (1-10 min, a slider) and Question Count (20–120 or ∞) both apply simultaneously — the session ends at whichever limit is hit first. See `src/stores/sessionStore.ts`'s `tick()`.
- **3-second countdown**: `sessionStore` has a `"countdown"` status between `"idle"` and `"running"` — `startSession()` pre-generates the first question and enters `"countdown"` but does *not* start the clock (`endsAt` stays `null`); `CountdownOverlay.tsx` ticks 3→2→1 locally then calls `beginRunning()`, which starts `endsAt` and resets `questionShownAt` (so the countdown itself is never counted as the first question's response time).
- **Fraction answers** must always be reduced, improper-form strings (`8/3` not `2 2/3`; `1/3` not `6/18`) — enforced by `src/lib/mathEngine/fraction.ts`'s `Fraction` class (always reduced by construction) and `checkAnswer.ts`'s strict parsing.
- **Subtraction never goes negative** — both integer and fraction subtraction generators swap operands to keep the result ≥ 0. One-line change in the relevant generator if negative results are ever wanted.
- **Decimal arithmetic uses scaled integers**, not `parseFloat`, to avoid float drift (`0.1 + 0.2` style bugs) — see `src/lib/mathEngine/decimalUtils.ts`.
- `QuestionConfig.difficulty` exists in the type for forward-compat but is **not wired to any dashboard control** in this MVP — the spec's fixed weighted-tier percentages are the default/medium behavior.
- **Independent Add/Subtract toggles**: the math engine's 9 `OperationKey`s bundle add and subtract into one generator per number type (`integer-add-sub`, etc.), but the dashboard exposes them as separate switches per the spec. `QuestionConfig.addSubMode: { add, subtract }` threads through the three `*-add-sub` generators (default: both `true`, i.e. the original 50/50 mix) so unchecking one restricts to the other. `configStore.toQuestionConfig()` derives this from the toggle state.
- **Fractions have no dedicated divide generator** — the spec's third fraction category is "conversions/fill-in-the-blank" (`fractionConversion.ts`), not division. The dashboard's "Division" toggle maps to `fraction-conversion` when Fractions is active, since those blank-multiply questions are structurally division problems.
- **Percentages reuse the `Fraction` class for clean-number construction, not weighted tiers.** `percentage-multiply.ts` builds the integer operand as a multiple of the percentage's reduced denominator (`Fraction(p, 100).den`), so `integer x percent` always lands on a whole number. `percentage-divide.ts` picks the clean integer quotient first, then computes the dividend as `quotient x percent` (same backwards-construction pattern as `integerDivide`/`decimalDivide`) — any percentage's reduced fraction has a denominator that only divides 100 (factors of 2 and 5), so the dividend is *always* a short terminating decimal with no rejection sampling needed. `percentage-add-sub.ts` just adds/subtracts the whole-number percentage values directly — no fraction machinery required since summing integers can't introduce fractional messiness.

## Known gotchas
- **Deriving store state in a component: subscribe to primitives, not a fresh derived object.** `ControlPanel.tsx` originally did `useConfigStore((s) => s.toQuestionConfig())` to keep the launched config in sync with sibling toggles (`OperationToggles`, `SessionSettings`). Two failure modes in order: (1) selecting the bare `toQuestionConfig` function meant its identity never changes, so the component never re-rendered when siblings changed `operations`/`numberTypes`/`questionType` — the Start button silently launched a stale config (e.g. picking Multiple Choice still started an Open session). (2) The fix-that-wasn't — calling `toQuestionConfig()` *inside* the selector — returns a brand-new object every call, and zustand's default equality is reference-based, so it looked "changed" on every render: infinite render loop. The actual fix: subscribe to the individual primitive slices (`operations`, `numberTypes`, `questionType`, `mcqChoiceCount`) and derive the config with `useMemo` keyed on them.

## Structure
- `src/app/page.tsx` — dashboard ("/"), 3-column layout
- `src/app/train/` — full-bleed training session route (own bare `layout.tsx`, no dashboard chrome)
- `src/app/history/page.tsx` — signed-in-only DB history dashboard (server component, redirects to `/` if no session)
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js handlers; `src/auth.ts` is the actual `NextAuth({...})` config (adapter, provider, session strategy, callbacks)
- `src/app/api/scores/` — `route.ts` (POST create / GET paginated list), `last/`, `activity/`, `lifetime/` — all session-gated via `auth()`
- `src/lib/mathEngine/` — pure question generator (types, `Fraction`, `decimalUtils`, `weightedPick`, `checkAnswer`, per-operation generators) — see unit tests in `src/test/mathEngine/`
- `src/lib/stats/` — `StatsRepository` interface, `localStorageStatsRepository.ts` (guest), `dbStatsRepository.ts` (signed-in, fetches `/api/scores*`), `sessionMapper.ts` (Prisma row → `SessionResult`)
- `src/lib/prisma.ts` — hot-reload-safe Prisma client singleton
- `prisma/schema.prisma` — Auth.js adapter models (`User`, `Account`, `Session`, `VerificationToken`) + `TrainingSession`
- `src/stores/` — Zustand: `configStore` (dashboard toggles, persisted via `zustand/middleware`'s `persist`), `statsStore` (reactive cache wrapping the active `StatsRepository`, held in state and swapped by `StatsHydrator.tsx`; deliberately *not* using `persist` itself, since each repository owns its own I/O), `sessionStore` (ephemeral active-session runtime state, no persistence)
- `src/components/dashboard/`, `src/components/training/`, `src/components/history/` (`ScoreHistoryChart.tsx` — dependency-free SVG chart), `src/components/ui/` (shadcn primitives), `src/components/shared/` (incl. `AuthButton.tsx`, `StatsHydrator.tsx`)

## Known gaps / placeholders
- Preview deployments' Google OAuth redirect URI isn't registered — sign-in only works on the production URL and `localhost:3000` (see "Auth + DB-backed history" above).
