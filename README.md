# Cost of Living

A mobile-first shopping strategy game about making a lunch brief work within a budget. **Version 2.0** focuses on consumer decision-making for ages 12–15: planning, checking constraints, comparing costs and learning from a second attempt.

## Play loop

1. Meet a fictional customer and inspect their dietary boundaries, preferences and kitchen access.
2. Inspect the exact shop, optionally estimate the spend, and choose a shopping strategy. The clock is off during planning.
3. Cover a lunch base, a protein option, fruit or vegetables and two customer wants within budget.
4. Read the learning receipt: actual spend versus estimate, unmet requirements, and a verified saving or a next step.
5. Retry the identical shop, or choose a practical upgrade and continue. Round 20 is the final shop.

**Learning mode** has no timer, no revision penalty and no speed bonus. **Timed challenge** keeps the 90-second clock, countdown, speed bonus and three-second cost for putting an item back. Records are separate for the two modes.

Retries restore the original character, prices, stock, budget and upgrades. They replace the round result rather than adding another win or another upgrade. A previous completed attempt can be compared with the new basket's cost. Historical personal bests remain personal bests.

## Educational model

The game practises shopping decisions. A lunch component is a simplified role, not a nutrient score, prescribed portion or claim that every combination is a complete real-world meal. Real nutrition instruction would need specialist review. Prices are fictional.

Nutrition meters, calorie/macro danger thresholds and price-based nutrition multipliers have been removed. Premium branding provides no meal-coverage advantage. Expired food and upgrades that remove allergies or nutrients are no longer part of play.

Upgrades offer kitchen or cold-storage access, transport, co-op prices, coupons, savings and price comparisons. Dietary boundaries never change. The price scout compares pack prices for the simplified game brief, not unit prices or real nutritional value.

Budget pressure increases across the run. Generation uses a clearing basket as a witness and raises a generated budget when needed to retain at least one legal solution. This is a game difficulty system, not a claim that every real household budget can meet its needs. The solver does not claim to find the cheapest possible basket.

## Running and checking

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
npm test
npm run balance
```

Built with Next.js, React, TypeScript and Tailwind. No accounts, database or external APIs. Only scores and tutorial preferences persist locally; estimates and attempt details stay in memory. Version 1 records are preserved under their old storage keys and excluded from the new scoreboards.

`npm test` checks planning/timing, dietary and equipment constraints, retries, scoring, feedback and full-run progression. `npm run balance` checks 25 seeds across all 12 customers and 20 rounds with accumulated upgrades, plus no-upgrade paths.

## Versioning

The version is defined in `src/game/version.ts` and displayed on the start screen.

- Increment the minor version for player-visible UI, content, balance, scoring or gameplay changes.
- Increment the major version for save-breaking changes, major ruleset changes or changes that substantially redefine the game.
- Do not bump the version for docs, tests, refactors or internal tooling that does not affect the player experience.

[The original PRD](./PRD_COST_OF_LIVING.md) records the historical v1 design. This README describes the current rules.
