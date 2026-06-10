# Cost of Living

A mobile-first browser strategy game about feeding someone on a budget that keeps getting worse.

Each round you're handed a randomly selected NPC — a uni student with one saucepan, a retiree who refuses beige rectangles, a vegetarian illustrator paid in exposure — and 90 seconds to fill their **nutrition** and **happiness** meters from a 16-item store inventory without blowing the budget or pushing calories, fat, sugar, carbs, or sodium past a fatal threshold. Win, and the next round's budget shrinks. The run ends when the maths wins.

This is a satirical strategy game about constrained choices. It is not a diet app, a health app, or nutrition advice.

Built from [PRD_COST_OF_LIVING.md](./PRD_COST_OF_LIVING.md).

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Deploys to Vercel as a fully static app — no database, no auth, no APIs. Scores and settings persist in LocalStorage.

## How it's put together

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **State:** a pure reducer (`src/game/reducer.ts`) driven by React `useReducer`; the timer is the only effect
- **Data:** 12 NPCs (`src/data/npcs.ts`) and 63 food items (`src/data/foodItems.ts`) as local TypeScript files
- **Game logic:** `src/game/` — seeded inventory generation, per-item nutrition/happiness impact (preferences, restrictions, equipment mismatches, repetition penalties), danger thresholds, progressive budget multiplier (1.00 → 0.60), scoring and ratings

## Balance checking

A dev-only simulation plays a greedy bot through every NPC at every budget multiplier (PRD §29.1):

```bash
npm run balance
```

It fails if round 1 is not reliably winnable or any NPC becomes effectively impossible before Checkout Goblin Mode.
