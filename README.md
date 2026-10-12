# Cost of Living

A mobile-first shopping strategy game about making a lunch brief work within a budget. **Version 2.17** focuses on consumer decision-making for ages 12–15: planning, checking constraints, comparing costs and learning from feedback.

The splash screen offers difficulty 1 (more budget room), 2 (balanced) and 3 (tighter budgets). Enable power-ups starts checked; Allow retries starts unchecked. These choices are saved on this device. How to play opens only when selected.

## Play loop

1. Meet and plan in one view. The customer, lunch wishes and dietary rule, budget, then active power-ups arrive in a short animated sequence alongside the shelves. All four sections stay available to read at your own pace, with background stories always visible under “About”. The first round includes a five-step guided tour: customer, wishes and needs, budget, power-ups, then the start button. The surrounding interface dims while the current section stays highlighted and scrolls into view when needed. Players advance with Next, finish with Done, or leave with the adjacent Skip button. There is no automatic progression or dismissal when clicking elsewhere; shopping can still start at any time. Later rounds and retries keep the short section reveals; the clock stays off during planning.
2. Browse the exact foods and optionally estimate the spend. Prices appear when shopping starts. The clock is off during planning.
3. Filter shelves by lunch part or food wish. Cover a base, protein, fruit or vegetables and all wishes within budget. Review the basket, adjust it, then check out.
4. See the dish made from your basket, with spare items beside the plate. A recipe match earns 50 bonus points. Read the compact receipt and read the always-visible spending tip for a verified saving or a next step.
5. Continue along the neighbourhood trail after each cleared shop. A timed-out shop can be retried when Allow retries is enabled. Power-ups appear at stops 1, 3, 5, 8, 12, 16 and 19; stop 20 finishes the challenge.

**Learning mode** has no timer, no revision penalty and no speed bonus. **Timed challenge** keeps the 90-second clock, speed bonus and three-second cost for putting an item back. Records are separate for the two modes.

When enabled, retries after a timeout restore the original character, prices, foods, budget and upgrades. The receipt can compare the new basket with the previous attempt. Successful rounds offer the next shop, or a new game after the final round, without a retry button. Historical personal bests remain personal bests.

## Visual shopping

Each store has a quiet SVG backdrop: brickwork, a striped awning and a shop window for the corner shop; canvas stalls and produce crates for the market; fridges, stocked shelves and a trolley for the supermarket. The same art appears in the shop sign. Illustrations stay behind the interface, cannot receive clicks or screen-reader focus, and use softer detail on mobile. Reduced-transparency and forced-colour preferences hide the decorative scenes.

Planning combines the introduction and order in a single ticket beside the shelves, with one start button and an optional spending estimate that is always expanded. On mobile the ticket sits above the food, with a browse link and a fixed start button. Reduced-motion settings show the entire ticket immediately and keep the first-round highlights without animated pulses or smooth scrolling. There is no separate intro dialog or duplicate customer/power-up panel. Starting shopping slides the planning panel out to the left and brings the order and basket in from the right on the same page. The shelves stay mounted, open food details carry through, and starting shopping does not reset the scroll. Hidden panels cannot receive keyboard focus. Reduced-motion settings skip the slide; timed mode starts immediately after the transition, without a round-start countdown. Shopping gives the shelves more room, with the order and basket in a desktop side panel or a compact mobile checklist and budget dock. Basket review becomes available only when every requirement is met and the basket is within budget. Until then, the basket dock shows its contents and item count without a review label or action. Review shows every goal, a Remove control for each food and the total before checkout. The clock pauses during review in timed mode and resumes when returning to the shelves. Putting food back still costs three seconds.

Foods to avoid remain visible and clearly marked; they can be added, but selected unsuitable cards and the basket button turn red until those foods are removed. Unsuitable foods do not count towards meal parts or wishes, and prevent checkout. Shopping filters narrow the shelves by lunch part or food wish and stay below the header as you scroll on mobile, tablet and desktop. Shelf groups and filters share the same order: Base, Protein, Fruit / veg, Wishes, Extras. Each item appears once in All; foods covering two lunch parts still match both filters. The Wishes filter also finds matches in other groups. Aisle labels on food cards support the variety goal, which still counts food categories, not shelf groups. The corner shop, market and supermarket rotate each round, with different colours, signage and quiet optional soundscapes. Sound starts off; enable it from the speaker button. Pausing or muting suspends audio. Reduced-motion preferences disable the decorative animations and shorten the money counter transition.

Each food can be bought once per basket, enforced by the game rules even if inventory reports more stock. The price sits to the left of Add at the top-right of each food card. Add becomes Remove once selected. Removing the food restores Add. Group Order and Camp Chef are not available power-ups. The basket visibly fills and returns items, the budget meter shows spending and refunds, and short reactions celebrate new food wishes and lunch slots. A two-slot celebration only happens when both slots were previously empty. Prices on sale are yellow; ordinary price tickets are white. Planning has no Add or Pause button, item prices, group filters or lunch-slot boxes below the customer.

Receipt tips suggest savings only when a cheaper basket has been checked against the shop’s foods, dietary rules, wishes and lunch slots.

The item pool contains 92 foods (84 standard items and 8 premium variants). The 21 new cooking staples expand the previous 71-item pool by 29.6%, while normal shelves now offer 20 items, up 25% from 16. Transport pass shelves offer 26, up from 21. Pasta, rice, flour, eggs, milk, meat, fish, beans and flavour ingredients add choices for familiar dishes. Herbs, spices, garlic, lemons and tomato paste are labelled “Flavour extra”; they can match food wishes but do not fill a main lunch slot.

## Educational model

The local catalogue in `src/data/recipes.ts` contains 108 simplified recipes, each requiring at least two different ingredients. The 30 additions each require a base, protein and fruit or vegetable component. Matching uses only bought foods that meet the customer’s dietary rules. Premium and standard versions are interchangeable ingredients, not two different foods. The plate shows one pack of each matched ingredient; unused foods appear on the right. Optional ingredients count only when the recipe lists them. A basket without a match displays a mix-and-match lunch without a recipe bonus. Recipes are simplified ingredient combinations, not cooking instructions or portions; water and cooking oil are assumed kitchen basics.

A matched recipe adds **50 points**, including on the final round. Shop selection guarantees at least 40% staples; its current target is 75% (15 of 20 items, or 20 of 26 with the larger-shop power-up), to help familiar dishes occur naturally.

Recipe coverage is checked across 12,000 shops in full runs covering all three difficulties and power-ups on/off. The October 2026 audit found matches in 78.7% of cheapest completed baskets, 71.1% after affordable valid swaps and 79.5% of completed random-order baskets. The random policy completed 1,181 of the 12,000 shops; only completed baskets count towards recipe coverage. None of these shopping policies consults the recipe catalogue. These simulations exceed the 70% target; actual player choices can produce different results.

The game practises shopping decisions. A lunch component is a simplified role, not a nutrient score, prescribed portion or claim that every combination is a complete real-world meal. Real nutrition instruction would need specialist review. Prices are fictional.

Nutrition meters, calorie/macro danger thresholds and price-based nutrition multipliers have been removed. Premium branding provides no meal-coverage advantage. Expired food and upgrades that remove allergies or nutrients are no longer part of play.

Kitchen equipment and cold-storage limits have been removed from purchases, customer selection and upgrades. Every customer can select any food; checkout still requires meeting their dietary rules. Upgrades offer transport, co-op prices, coupons, savings and price comparisons. Dietary boundaries never change. The price scout compares pack prices for the simplified game brief, not unit prices or real nutritional value.

Wishes grow from one in rounds 1–5, to two in 6–10, three in 11–15 and four in 16–20. Each person keeps their favourite wishes and gains stable, distinct wishes later. Difficulty 1/4 through 4/4 appears below their name and reflects their current wish count.

Budgets are calibrated against an exact cheapest valid basket using dynamic programming over meal roles, wishes and aisle variety. Before earned boosts, budget-to-cost ratios start at 2.50, 2.15 and 1.80 for difficulty levels 1, 2 and 3, falling by 0.04 per round. A second limit keeps the actual ratio at least 0.025 below the previous shop, even after discounts, vouchers and carried savings. A valid solution is always affordable. Budget power-ups therefore offer **up to** their stated amount, within this limit; their copy makes that explicit. This provides an objectively increasing spending challenge, while perceived difficulty still depends on player choices and familiarity. Prices and these budgets are fictional.

On game over, the player sees a certified solution using the exact shelf items and prices, its total, leftover money and the needs it meets. This appears whether retries are enabled or disabled. The navbar restart button opens a warning, pauses timed play while it is open, and returns to the splash screen only after confirmation. Best scores and saved preferences remain. More than two owned power-ups use compact, tappable chips in planning and shopping, with descriptions available on selection.

The full-run playtest passed **1,200 runs / 24,000 shops**, including 6,000 four-wish rounds, across both modes, all difficulties and power-up settings. Every run had strictly decreasing actual budget room relative to the cheapest valid basket. A further **8,400 stress shops** covered all 70 four-wish combinations, six dietary rules, 10 seeds and two upgrade states. All had valid solutions. Browser checks completed all 20 rounds and covered mobile/desktop layouts, compact power-ups, immediate timed starts, restart/cancel, timeout solutions and saved retry settings.

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
npm run playtest
```

Built with Next.js, React, TypeScript and Tailwind. No accounts, database or external APIs. Scores, difficulty, power-up and retry settings persist locally; estimates and attempt details stay in memory. Version 1 records are preserved under their old storage keys and excluded from the new scoreboards.

`npm test` checks planning/timing, dietary boundaries, unrestricted kitchen access, retries, scoring, feedback, recipes, staple shares and full-run progression. `npm run balance` checks 25 seeds across all 12 customers and 20 rounds with accumulated upgrades, plus no-upgrade paths. `npm run playtest` exercises full runs, monotonic spending difficulty and every four-wish/dietary-rule combination. `npm run recipes` verifies the staple minimum and requires at least 70% recipe coverage for each of three simulated shopping policies.

## Versioning

The version is defined in `src/game/version.ts` and displayed on the start screen.

- Increment the minor version for player-visible UI, content, balance, scoring or gameplay changes.
- Increment the major version for save-breaking changes, major ruleset changes or changes that substantially redefine the game.
- Do not bump the version for docs, tests, refactors or internal tooling that does not affect the player experience.

[The original PRD](./PRD_COST_OF_LIVING.md) records the historical v1 design. This README describes the current rules.
