# Cost of Living

A mobile-first shopping strategy game about making a lunch brief work within a budget. **Version 2.7** focuses on consumer decision-making for ages 12–15: planning, checking constraints, comparing costs and learning from a second attempt.

## Play loop

1. Meet the customer in a four-step animated introduction: person, lunch wishes and dietary rule, budget, then active power-ups. Advance at your own pace, go back, skip or replay it. Each round and retry starts a fresh introduction; the clock stays off.
2. Browse the exact foods and optionally estimate the spend. Prices appear when shopping starts. The clock is off during planning.
3. Filter shelves by lunch part or food wish. Cover a base, protein, fruit or vegetables and both wishes within budget. Review the basket, adjust it, then check out.
4. See the dish made from your basket, with spare items beside the plate. A recipe match earns 50 bonus points. Read the compact receipt and open the spending tip for a verified saving or a next step.
5. Retry the identical shop or continue along the neighbourhood trail. Power-ups appear at stops 1, 3, 5, 8, 12, 16 and 19; stop 20 finishes the challenge.

**Learning mode** has no timer, no revision penalty and no speed bonus. **Timed challenge** keeps the 90-second clock, countdown, speed bonus and three-second cost for putting an item back. Records are separate for the two modes.

Retries restore the original character, prices, stock, budget and upgrades. They replace the round result rather than adding another win or another upgrade. A previous completed attempt can be compared with the new basket's cost. Historical personal bests remain personal bests.

## Visual shopping

Planning places the order beside the shelves, with a direct start button and an optional spending estimate. Shopping gives the shelves more room, with the order and basket in a desktop side panel or a compact mobile checklist and budget dock. Basket review shows every goal, editable quantities and the total before checkout. The clock continues during review in timed mode.

Foods to avoid remain visible and clearly marked; their Add buttons are disabled. Shopping filters narrow the shelves by lunch part or food wish. Shelf groups and filters share the same order: Base, Protein, Fruit / veg, Wishes, Extras. Each item appears once in All; foods covering two lunch parts still match both filters. The Wishes filter also finds matches in other groups. Aisle labels on food cards support the variety goal, which still counts food categories, not shelf groups. The corner shop, market and supermarket rotate each round, with different colours, signage and quiet optional soundscapes. Sound starts off; enable it from the speaker button. Pausing or muting suspends audio. Reduced-motion preferences disable the decorative animations and shorten the money counter transition.

The basket visibly fills and returns items, the budget meter shows spending and refunds, and short reactions celebrate new food wishes and lunch slots. A two-slot celebration only happens when both slots were previously empty. Prices on sale are yellow; ordinary price tickets are white. Planning has no Add or Pause button, item prices, group filters or lunch-slot boxes below the customer.

A saving challenge is offered only when a concrete cheaper basket has been checked against the shop’s stock, food rules, wishes and lunch slots. Accept it with the “Save …?” retry button. The target stays visible while shopping; a completed checkout at or below it earns a comparison badge. It gives no extra win or score, and missing the optional target does not block a valid checkout.

The item pool contains 92 foods (84 standard items and 8 premium variants). The 21 new cooking staples expand the previous 71-item pool by 29.6%, while each normal shop still offers 16 items. Pasta, rice, flour, eggs, milk, meat, fish, beans and flavour ingredients add choices for familiar dishes. Herbs, spices, garlic, lemons and tomato paste are labelled “Flavour extra”; they can match food wishes but do not fill a main lunch slot.

## Educational model

The local catalogue in `src/data/recipes.ts` contains 78 simplified recipes, each requiring at least two different ingredients. Matching uses only bought foods that meet the customer’s dietary rules. Premium and standard versions are interchangeable ingredients, not two different foods. The plate shows one pack of each matched ingredient; extra packs and unused foods appear on the right. Optional ingredients count only when the recipe lists them. A basket without a match displays a mix-and-match lunch without a recipe bonus. Recipes are simplified ingredient combinations, not cooking instructions or portions; water and cooking oil are assumed kitchen basics.

A matched recipe adds **50 points**, including on the final round. Retrying replaces that round’s points and bonus. Shop selection guarantees at least 40% staples; its current target is 75% (12 of 16 items, or 16 of 21 with the larger-shop power-up), to help familiar dishes occur naturally.

Recipe coverage is checked across 12,000 seeded shops covering all 12 customers, all 20 rounds and paths with and without upgrades. The October 2026 audit found matches in 81.2% of economical completed baskets, 75.4% after affordable valid swaps, and 86.5% of completed random-order baskets. The random policy completed 2,445 of the 12,000 shops; only completed baskets count towards recipe coverage. None of these shopping policies consults the recipe catalogue. These simulations exceed the 70% target; actual player choices can produce different results.

The game practises shopping decisions. A lunch component is a simplified role, not a nutrient score, prescribed portion or claim that every combination is a complete real-world meal. Real nutrition instruction would need specialist review. Prices are fictional.

Nutrition meters, calorie/macro danger thresholds and price-based nutrition multipliers have been removed. Premium branding provides no meal-coverage advantage. Expired food and upgrades that remove allergies or nutrients are no longer part of play.

Kitchen equipment and cold-storage limits have been removed from purchases, customer selection and upgrades. Every customer can buy any food that meets their dietary rules. Upgrades offer transport, co-op prices, coupons, savings and price comparisons. Dietary boundaries never change. The price scout compares pack prices for the simplified game brief, not unit prices or real nutritional value.

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
npm run recipes
```

Built with Next.js, React, TypeScript and Tailwind. No accounts, database or external APIs. Only scores and tutorial preferences persist locally; estimates and attempt details stay in memory. Version 1 records are preserved under their old storage keys and excluded from the new scoreboards.

`npm test` checks planning/timing, dietary boundaries, unrestricted kitchen access, retries, scoring, feedback, recipes, staple shares and full-run progression. `npm run balance` checks 25 seeds across all 12 customers and 20 rounds with accumulated upgrades, plus no-upgrade paths. `npm run recipes` verifies the staple minimum and requires at least 70% recipe coverage for each of three simulated shopping policies.

## Versioning

The version is defined in `src/game/version.ts` and displayed on the start screen.

- Increment the minor version for player-visible UI, content, balance, scoring or gameplay changes.
- Increment the major version for save-breaking changes, major ruleset changes or changes that substantially redefine the game.
- Do not bump the version for docs, tests, refactors or internal tooling that does not affect the player experience.

[The original PRD](./PRD_COST_OF_LIVING.md) records the historical v1 design. This README describes the current rules.
