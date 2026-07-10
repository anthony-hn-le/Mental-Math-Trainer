@AGENTS.md

# Project: Mental Math Trainer

Tradermath-inspired mental arithmetic trainer for quant/trading-interview-style drills. Standalone project — not part of the `portfolio/` repo. Live at https://mental-math-trainer-dun.vercel.app/, GitHub `anthony-hn-le/Mental-Math-Trainer` — not yet linked from `portfolio/src/data/projects.ts`.

## Stack (as actually installed)
- Next.js 16.2.10, App Router, React 19.2.4, TypeScript ^5
- Tailwind CSS v4 — CSS-first config, no `tailwind.config.ts`
- shadcn/ui (initialized fresh in this project — first use in this environment). Uses `@base-ui/react` primitives (shadcn's current default), not Radix.
- Zustand for state (first use in this environment) — no Context, no Redux/Jotai
- `next-themes` for dark/light
- Vitest for unit tests (`npm test`), node environment, no jsdom — `src/lib/mathEngine` is pure logic

Per `AGENTS.md`: this Next.js version has real breaking changes vs. training data — check `node_modules/next/dist/docs/` before writing App Router code you haven't verified against this version.

## Scope: guest-only MVP
This build ships a fully working trainer with **no authentication** — all stats/config persist to `localStorage` via Zustand's `persist` middleware. Auth (NextAuth.js + Google) and DB persistence (Prisma on Supabase Postgres, used purely as a Postgres host — NextAuth would still handle the Google OAuth flow itself) were deliberately deferred, **not built**.

The seam for that future work is `src/lib/stats/statsRepository.ts` — a `StatsRepository` interface (`recordSession`, `getLastSession`, `getActivity`, `getLifetimeStats`) that `src/lib/stats/localStorageStatsRepository.ts` implements for guest mode. `src/stores/statsStore.ts` only depends on this interface, never on `localStorage` directly — a future DB-backed implementation (behind an API route, once a logged-in user exists) can drop in without touching any UI component.

## Key design decisions
- **Session end rule**: Duration (1-10 min, a slider) and Question Count (20–120 or ∞) both apply simultaneously — the session ends at whichever limit is hit first. See `src/stores/sessionStore.ts`'s `tick()`.
- **3-second countdown**: `sessionStore` has a `"countdown"` status between `"idle"` and `"running"` — `startSession()` pre-generates the first question and enters `"countdown"` but does *not* start the clock (`endsAt` stays `null`); `CountdownOverlay.tsx` ticks 3→2→1 locally then calls `beginRunning()`, which starts `endsAt` and resets `questionShownAt` (so the countdown itself is never counted as the first question's response time).
- **Fraction answers** must always be reduced, improper-form strings (`8/3` not `2 2/3`; `1/3` not `6/18`) — enforced by `src/lib/mathEngine/fraction.ts`'s `Fraction` class (always reduced by construction) and `checkAnswer.ts`'s strict parsing.
- **Subtraction never goes negative** — both integer and fraction subtraction generators swap operands to keep the result ≥ 0. One-line change in the relevant generator if negative results are ever wanted.
- **Decimal arithmetic uses scaled integers**, not `parseFloat`, to avoid float drift (`0.1 + 0.2` style bugs) — see `src/lib/mathEngine/decimalUtils.ts`.
- `QuestionConfig.difficulty` exists in the type for forward-compat but is **not wired to any dashboard control** in this MVP — the spec's fixed weighted-tier percentages are the default/medium behavior.
- **Independent Add/Subtract toggles**: the math engine's 9 `OperationKey`s bundle add and subtract into one generator per number type (`integer-add-sub`, etc.), but the dashboard exposes them as separate switches per the spec. `QuestionConfig.addSubMode: { add, subtract }` threads through the three `*-add-sub` generators (default: both `true`, i.e. the original 50/50 mix) so unchecking one restricts to the other. `configStore.toQuestionConfig()` derives this from the toggle state.
- **Fractions have no dedicated divide generator** — the spec's third fraction category is "conversions/fill-in-the-blank" (`fractionConversion.ts`), not division. The dashboard's "Division" toggle maps to `fraction-conversion` when Fractions is active, since those blank-multiply questions are structurally division problems.

## Known gotchas
- **Deriving store state in a component: subscribe to primitives, not a fresh derived object.** `ControlPanel.tsx` originally did `useConfigStore((s) => s.toQuestionConfig())` to keep the launched config in sync with sibling toggles (`OperationToggles`, `SessionSettings`). Two failure modes in order: (1) selecting the bare `toQuestionConfig` function meant its identity never changes, so the component never re-rendered when siblings changed `operations`/`numberTypes`/`questionType` — the Start button silently launched a stale config (e.g. picking Multiple Choice still started an Open session). (2) The fix-that-wasn't — calling `toQuestionConfig()` *inside* the selector — returns a brand-new object every call, and zustand's default equality is reference-based, so it looked "changed" on every render: infinite render loop. The actual fix: subscribe to the individual primitive slices (`operations`, `numberTypes`, `questionType`, `mcqChoiceCount`) and derive the config with `useMemo` keyed on them.

## Structure
- `src/app/page.tsx` — dashboard ("/"), 3-column layout
- `src/app/train/` — full-bleed training session route (own bare `layout.tsx`, no dashboard chrome)
- `src/lib/mathEngine/` — pure question generator (types, `Fraction`, `decimalUtils`, `weightedPick`, `checkAnswer`, per-operation generators) — see unit tests in `src/test/mathEngine/`
- `src/lib/stats/` — `StatsRepository` interface + guest localStorage implementation
- `src/stores/` — Zustand: `configStore` (dashboard toggles, persisted via `zustand/middleware`'s `persist`), `statsStore` (reactive cache wrapping `StatsRepository` — deliberately *not* using `persist`, since the repository itself owns the actual `localStorage` I/O; call `hydrate()` once on mount, see `StatsHydrator.tsx`), `sessionStore` (ephemeral active-session runtime state, no persistence)
- `src/components/dashboard/`, `src/components/training/`, `src/components/ui/` (shadcn primitives), `src/components/shared/`

## Known gaps / placeholders
- No auth, no DB — see "Scope" above.
- Not yet linked from `portfolio/src/data/projects.ts` — add `liveUrl`/`githubUrl` there.
