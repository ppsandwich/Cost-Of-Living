# PRD: Cost of Living

## 1. Product Summary

**Product name:** Cost of Living  
**Type:** Mobile-first browser strategy / resource management game  
**Core concept:** The player must buy food for an NPC within a fixed budget and time limit, balancing nutrition and happiness while avoiding dangerous nutritional excesses.

Each round gives the player a randomly selected NPC with different needs, preferences, restrictions, budget pressure, and survival thresholds. The player buys food items from a limited store inventory. Each food item affects the NPC’s nutrition, happiness, macros, vitamins, minerals, and budget.

The round ends when:

- The timer runs out.
- The player can no longer afford any available food item.
- The NPC dies because a nutrient or macro exceeds a dangerous threshold.
- The player manually submits their basket.

If the player succeeds, they move to the next round. Difficulty increases after each successful round by reducing the available budget.

The game should be fun, readable, and slightly stressful, while highlighting how tight budgets make meal planning harder, less healthy, and less dignified.

This is not a diet app, health app, calorie tracker, or medical simulator. It is a satirical strategy game about constrained choices.

---

## 2. Product Goals

The game should:

- Be fully playable on a small phone screen.
- Be immediately understandable.
- Feel like a fast, tactical shopping puzzle.
- Make budget constraints meaningful.
- Make cheap, high-calorie, low-nutrient food tempting.
- Make “healthy” choices feel harder under pressure.
- Use NPC variation to create replayability.
- Increase difficulty through successful play.
- Show how happiness and nutrition can conflict.
- Avoid moralising about food choices.
- Avoid shaming poverty, weight, disability, culture, or diet.
- Work fully in-browser.
- Be deployable on Vercel with minimal backend requirements.

---

## 3. Player Goal

For each round, the player must meet the NPC’s needs before the round ends.

A successful round requires:

- Nutrition target met.
- Happiness target met.
- Budget not exceeded.
- No macro or nutrient exceeds a fatal threshold.
- NPC remains alive.

The player wins the round if the NPC survives and their core needs are met.

The player loses the run if:

- The NPC dies.
- The timer ends before needs are met.
- The player runs out of affordable options before needs are met.
- The player submits a basket that does not meet the NPC’s needs.

---

## 4. Core Game Loop

1. Player starts a new run at Round 1.
2. Game randomly selects an NPC.
3. NPC displays:
   - Name
   - Short description
   - Budget
   - Nutrition need
   - Happiness need
   - Relevant preferences or restrictions
   - Danger thresholds
4. Store inventory is generated.
5. Timer starts.
6. Player buys food items.
7. Each purchase updates:
   - Remaining budget
   - Nutrition
   - Happiness
   - Calories
   - Fat
   - Sugar
   - Carbs
   - Protein
   - Fibre
   - Vitamins
   - Minerals
8. Player adjusts basket while time remains.
9. Round ends when:
   - Player submits basket.
   - Timer runs out.
   - Player cannot afford any available item.
   - NPC dies from exceeding a threshold.
10. Game evaluates outcome.
11. If successful, player advances to the next round.
12. Next round selects a new NPC and reduces the available budget.
13. The run continues until the player loses.
14. After loss, game shows a run summary and replay button.

---

## 5. Tone and Design Intent

The game should be funny, sharp, and humane.

It should feel like:

- A supermarket basket puzzle.
- A tiny survival sim.
- A budget spreadsheet having a panic attack in the cereal aisle.
- A game about trade-offs, not “good” and “bad” people.

Avoid:

- Fat-shaming.
- Health moralising.
- Poverty tourism.
- Grim charity-poster sadness.
- Treating happiness as silly or optional.
- Treating nutrition as simple.

The message should emerge from play: when the player has $14 left, 23 seconds on the clock, and every affordable item is either instant noodles or sadness with a barcode, the point is already made.

---

## 6. Target Platform

### 6.1 Runtime

- Browser-based game.
- Mobile-first.
- Fully playable on small phone screens.
- Must work in Chrome, Safari, Firefox, and Edge.

### 6.2 Minimum Supported Viewport

The game must be playable at:

```txt
360px wide x 640px high
```

The player must be able to complete a full run using only touch input.

The game must not require:

- Hover states.
- Right-click.
- Drag-and-drop precision.
- Tiny controls.
- Horizontal scrolling.
- Desktop-only layouts.

### 6.3 Deployment

- Vercel-compatible.
- Static-first preferred.
- No database required for v1.
- No authentication required for v1.
- No paid APIs.
- Game state should run client-side.

### 6.4 Recommended Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React reducer or Zustand
- **Data:** Local TypeScript or JSON files
- **Persistence:** LocalStorage for settings and local high scores
- **Deployment:** Vercel

---

## 7. Non-Goals

The game should not:

- Provide real medical advice.
- Recommend real diets.
- Use real individual health data.
- Require user login.
- Require a backend database.
- Require real grocery prices.
- Claim nutritional precision.
- Present “death” in a medically realistic way.
- Use real supermarket branding unless explicitly added later.
- Shame players for choosing cheap food.

---

## 8. Game Mode

Cost of Living uses progressive difficulty rather than fixed difficulty selection.

There is one main mode in v1:

```ts
type GameMode = "standard_run";
```

The player begins at Round 1.

Each time the player successfully meets an NPC’s nutrition and happiness needs, they advance to the next round.

Difficulty increases each round by reducing the budget available for the next NPC.

The timer should remain fixed at 90 seconds in v1 unless later playtesting shows the game needs more pressure.

This keeps the game readable: the player understands that the world is not changing in twelve different invisible ways. The money is just getting worse, which is unfortunately a very clean game mechanic.

---

## 9. Progressive Round Difficulty

### 9.1 Round Progression

Each successful round advances the player to the next round.

```ts
interface ProgressionState {
  roundNumber: number;
  successfulRounds: number;
  currentBudgetMultiplier: number;
  previousNPCIds: string[];
}
```

Round 1 starts at normal budget.

After each win, the next round becomes harder.

### 9.2 Budget Reduction Formula

Each NPC has a base budget.

```ts
adjustedBudget = Math.round(npc.baseBudgetCents * budgetMultiplier);
```

The budget multiplier decreases each round.

Recommended v1 progression:

| Round | Budget Multiplier |
|---:|---:|
| 1 | 1.00 |
| 2 | 0.95 |
| 3 | 0.90 |
| 4 | 0.85 |
| 5 | 0.80 |
| 6 | 0.75 |
| 7 | 0.70 |
| 8 | 0.65 |
| 9+ | 0.60 |

The multiplier should not go below `0.60` in v1 unless the user explicitly requests a more punishing mode.

Alternative formula:

```ts
budgetMultiplier = Math.max(0.6, 1 - ((roundNumber - 1) * 0.05));
```

### 9.3 NPC Selection During Progression

Each round should select a new random NPC.

NPCs should not repeat until all available NPCs have been used, where possible.

```ts
selectNPC({
  previousNPCIds,
  npcPool,
  seed
});
```

If the NPC pool is exhausted, reset the pool and allow repeats.

### 9.4 Store Inventory During Progression

As rounds progress, the store inventory should remain readable and fair.

Difficulty should primarily increase through reduced budgets, not by making the store useless.

Later rounds may also slightly increase pressure by:

- Showing fewer discounted items.
- Increasing the chance of tempting low-nutrition food.
- Increasing price variation.
- Reducing perfect-fit options.

These should be secondary. The primary difficulty lever is budget reduction.

### 9.5 Round Number Display

The UI should clearly show the current round.

Example:

```txt
Round 4
Budget pressure: unpleasant
```

Suggested budget pressure labels:

| Budget Multiplier | Label |
|---:|---|
| 1.00–0.95 | Manageable |
| 0.94–0.85 | Tight |
| 0.84–0.75 | Grim |
| 0.74–0.65 | Hostile |
| 0.64–0.60 | Checkout Goblin Mode |

### 9.6 Timer

Budget reduction is the main difficulty curve.

Timer should stay fixed at 90 seconds for v1.

Do not reduce both budget and timer aggressively, or the game may feel like being mugged by a spreadsheet.

Optional later progression:

| Round | Timer |
|---:|---:|
| 1–3 | 90 seconds |
| 4–6 | 85 seconds |
| 7–9 | 80 seconds |
| 10+ | 75 seconds |

This is optional and should not be implemented unless the budget-only curve feels too flat.

### 9.7 End of Run

When the player loses, the game should show a run summary.

Run summary should include:

- Rounds survived
- Final NPC
- Final reason for loss
- Best basket
- Total NPCs successfully helped
- Highest score
- Replay button

Example copy:

> You survived 6 rounds. Then the budget became decorative.

---

## 10. NPC System

Each round starts with a randomly selected NPC.

NPCs are fictional and should be written with warmth and restraint. They should represent different constraints without becoming stereotypes.

### 10.1 NPC Data Model

```ts
export interface NPC {
  id: string;
  name: string;
  ageLabel: string;
  description: string;
  baseBudgetCents: number;
  nutritionTarget: number;
  happinessTarget: number;
  startingStats: NutritionStats;
  maxThresholds: DangerThresholds;
  preferences: FoodPreference[];
  restrictions: FoodRestriction[];
  sensitivity: NPCSensitivity;
  roundModifier?: RoundModifier;
}
```

### 10.2 NPC Stats

```ts
export interface NutritionStats {
  calories: number;
  protein: number;
  fat: number;
  sugar: number;
  carbs: number;
  fibre: number;
  vitamins: number;
  minerals: number;
  sodium?: number;
  nutrition: number;
  happiness: number;
}
```

### 10.3 Danger Thresholds

```ts
export interface DangerThresholds {
  caloriesMax: number;
  fatMax: number;
  sugarMax: number;
  carbsMax: number;
  sodiumMax?: number;
}
```

If any stat exceeds its max threshold, the NPC dies and the game ends.

The death state should be stylised and game-like, not graphic.

Example message:

> Milo has been defeated by the $2.20 pudding economy.

### 10.4 NPC Sensitivity

NPCs should react differently to foods.

```ts
export interface NPCSensitivity {
  happinessFromTreatsMultiplier: number;
  nutritionFromVegetablesMultiplier: number;
  sugarPenaltyMultiplier: number;
  fatPenaltyMultiplier: number;
  carbPenaltyMultiplier: number;
  vitaminNeedMultiplier: number;
  mineralNeedMultiplier: number;
}
```

### 10.5 Food Preferences

```ts
export type FoodPreference =
  | "likes_sweet_food"
  | "likes_salty_food"
  | "likes_fresh_food"
  | "likes_comfort_food"
  | "likes_spicy_food"
  | "likes_crunchy_food"
  | "likes_familiar_food"
  | "likes_variety"
  | "dislikes_bland_food"
  | "dislikes_repetition";
```

### 10.6 Food Restrictions

```ts
export type FoodRestriction =
  | "vegetarian"
  | "no_pork"
  | "low_sugar"
  | "low_fat"
  | "low_sodium"
  | "high_protein_need"
  | "high_fibre_need"
  | "limited_cooking_equipment"
  | "no_fridge"
  | "no_microwave";
```

Restrictions do not need to be framed as medical. They can represent access, preference, culture, circumstance, or equipment.

Minimum v1 NPC count: **12 NPCs**.

---

## 11. Example NPCs

### 11.1 Milo

```ts
{
  id: "milo",
  name: "Milo",
  ageLabel: "Uni student",
  description: "Has one saucepan and the haunted confidence of someone who thinks sleep counts as dinner.",
  baseBudgetCents: 1800,
  nutritionTarget: 65,
  happinessTarget: 45,
  preferences: ["likes_comfort_food", "likes_salty_food"],
  restrictions: ["limited_cooking_equipment"],
  sensitivity: {
    happinessFromTreatsMultiplier: 1.1,
    nutritionFromVegetablesMultiplier: 0.9,
    sugarPenaltyMultiplier: 1.0,
    fatPenaltyMultiplier: 1.0,
    carbPenaltyMultiplier: 1.0,
    vitaminNeedMultiplier: 1.0,
    mineralNeedMultiplier: 1.0
  }
}
```

### 11.2 Jan

```ts
{
  id: "jan",
  name: "Jan",
  ageLabel: "Retired",
  description: "Wants proper food, not beige rectangles. Unfortunately, beige rectangles are on special.",
  baseBudgetCents: 2200,
  nutritionTarget: 75,
  happinessTarget: 55,
  preferences: ["likes_fresh_food", "dislikes_bland_food"],
  restrictions: ["low_sodium", "high_fibre_need"],
  sensitivity: {
    happinessFromTreatsMultiplier: 0.8,
    nutritionFromVegetablesMultiplier: 1.3,
    sugarPenaltyMultiplier: 1.1,
    fatPenaltyMultiplier: 1.0,
    carbPenaltyMultiplier: 1.0,
    vitaminNeedMultiplier: 1.2,
    mineralNeedMultiplier: 1.2
  }
}
```

### 11.3 Priya

```ts
{
  id: "priya",
  name: "Priya",
  ageLabel: "Parent with two kids",
  description: "Needs food that is cheap, filling, acceptable to children, and not made entirely of bargaining with the universe.",
  baseBudgetCents: 3000,
  nutritionTarget: 85,
  happinessTarget: 70,
  preferences: ["likes_familiar_food", "likes_variety"],
  restrictions: [],
  sensitivity: {
    happinessFromTreatsMultiplier: 1.2,
    nutritionFromVegetablesMultiplier: 1.0,
    sugarPenaltyMultiplier: 1.2,
    fatPenaltyMultiplier: 1.0,
    carbPenaltyMultiplier: 0.9,
    vitaminNeedMultiplier: 1.0,
    mineralNeedMultiplier: 1.0
  }
}
```

### 11.4 Theo

```ts
{
  id: "theo",
  name: "Theo",
  ageLabel: "Shift worker",
  description: "Needs something filling before work. Has the energy of a phone on 11 percent.",
  baseBudgetCents: 1600,
  nutritionTarget: 60,
  happinessTarget: 40,
  preferences: ["likes_comfort_food", "likes_salty_food"],
  restrictions: ["high_protein_need", "limited_cooking_equipment"],
  sensitivity: {
    happinessFromTreatsMultiplier: 1.0,
    nutritionFromVegetablesMultiplier: 0.8,
    sugarPenaltyMultiplier: 1.0,
    fatPenaltyMultiplier: 1.1,
    carbPenaltyMultiplier: 1.0,
    vitaminNeedMultiplier: 0.9,
    mineralNeedMultiplier: 1.0
  }
}
```

---

## 12. Food Item System

Food items are purchasable objects that affect NPC stats.

### 12.1 Food Item Data Model

```ts
export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  basePriceCents: number;
  calories: number;
  protein: number;
  fat: number;
  sugar: number;
  carbs: number;
  fibre: number;
  vitamins: number;
  minerals: number;
  sodium?: number;
  baseNutrition: number;
  baseHappiness: number;
  tags: FoodTag[];
  requiresEquipment?: EquipmentRequirement[];
  maxQuantity?: number;
  imagePath?: string;
}
```

### 12.2 Food Categories

```ts
export type FoodCategory =
  | "fruit"
  | "vegetable"
  | "grain"
  | "protein"
  | "dairy"
  | "snack"
  | "frozen"
  | "ready_meal"
  | "drink"
  | "pantry"
  | "treat";
```

### 12.3 Food Tags

```ts
export type FoodTag =
  | "cheap"
  | "filling"
  | "fresh"
  | "processed"
  | "comfort"
  | "sweet"
  | "salty"
  | "high_protein"
  | "high_fibre"
  | "high_sugar"
  | "high_fat"
  | "high_carb"
  | "vitamin_rich"
  | "mineral_rich"
  | "low_prep"
  | "requires_fridge"
  | "requires_microwave"
  | "requires_stove"
  | "family_friendly";
```

### 12.4 Equipment Requirements

```ts
export type EquipmentRequirement =
  | "fridge"
  | "freezer"
  | "microwave"
  | "stove"
  | "oven"
  | "kettle";
```

If an NPC has a restriction like `no_microwave`, food requiring a microwave should be purchasable but penalised, unavailable, or marked as impractical depending on implementation choice.

Recommended v1 behaviour:

- Show the item.
- Allow purchase.
- Apply reduced happiness or nutrition if the NPC cannot reasonably use it.
- Display a warning after purchase.

Example:

> Hard to enjoy frozen lasagne when your cooking equipment is “optimism”.

Minimum v1 food item count: **60 items**.

Recommended distribution:

| Category | Minimum Items |
|---|---:|
| Fruit | 6 |
| Vegetables | 8 |
| Grains / pantry staples | 10 |
| Protein | 10 |
| Dairy | 5 |
| Snacks | 8 |
| Ready meals | 6 |
| Drinks | 4 |
| Treats | 6 |

---

## 13. Example Food Items

### 13.1 Cheap and Filling

```ts
{
  id: "instant-noodles",
  name: "Instant noodles",
  category: "pantry",
  basePriceCents: 120,
  calories: 380,
  protein: 8,
  fat: 14,
  sugar: 3,
  carbs: 52,
  fibre: 2,
  vitamins: 4,
  minerals: 5,
  sodium: 70,
  baseNutrition: 8,
  baseHappiness: 12,
  tags: ["cheap", "filling", "processed", "salty", "high_carb", "low_prep"],
  maxQuantity: 3
}
```

### 13.2 Healthy but Less Cheap

```ts
{
  id: "bag-of-apples",
  name: "Bag of apples",
  category: "fruit",
  basePriceCents: 450,
  calories: 260,
  protein: 1,
  fat: 1,
  sugar: 48,
  carbs: 68,
  fibre: 12,
  vitamins: 18,
  minerals: 8,
  baseNutrition: 22,
  baseHappiness: 8,
  tags: ["fresh", "vitamin_rich", "high_fibre"]
}
```

### 13.3 Happiness Trap

```ts
{
  id: "chocolate-biscuits",
  name: "Chocolate biscuits",
  category: "treat",
  basePriceCents: 250,
  calories: 720,
  protein: 6,
  fat: 34,
  sugar: 52,
  carbs: 86,
  fibre: 3,
  vitamins: 2,
  minerals: 4,
  baseNutrition: 4,
  baseHappiness: 24,
  tags: ["cheap", "sweet", "comfort", "high_sugar", "high_fat"]
}
```

### 13.4 Good Value

```ts
{
  id: "lentils",
  name: "Dried lentils",
  category: "pantry",
  basePriceCents: 320,
  calories: 680,
  protein: 44,
  fat: 2,
  sugar: 4,
  carbs: 112,
  fibre: 30,
  vitamins: 12,
  minerals: 24,
  baseNutrition: 34,
  baseHappiness: 6,
  tags: ["cheap", "filling", "high_protein", "high_fibre", "mineral_rich", "requires_stove"],
  requiresEquipment: ["stove"],
  maxQuantity: 2
}
```

---

## 14. Nutrition and Happiness Calculations

### 14.1 Core Stats

The player is trying to increase:

- Nutrition
- Happiness

The player must avoid exceeding fatal thresholds for:

- Calories
- Fat
- Sugar
- Carbs
- Sodium, if implemented

Protein, fibre, vitamins, and minerals should generally be beneficial, but extreme excess can optionally trigger warnings rather than death.

### 14.2 Purchase Calculation

When the player buys a food item:

```ts
updatedStats = applyFoodItemToNPC(currentStats, foodItem, npc);
```

The item’s impact should be modified by:

- NPC preferences
- NPC restrictions
- NPC sensitivities
- Food tags
- Equipment mismatch
- Repetition penalty

### 14.3 Happiness Formula

Suggested formula:

```ts
happinessGain =
  food.baseHappiness
  * preferenceMultiplier
  * varietyMultiplier
  * equipmentMultiplier
  - restrictionPenalty;
```

Food happiness should not always correlate with nutrition.

A cheap packet of biscuits might make happiness jump and nutrition barely move. A bag of lentils might improve nutrition but do very little emotionally unless the NPC likes that kind of food and can cook it.

### 14.4 Nutrition Formula

Suggested formula:

```ts
nutritionGain =
  food.baseNutrition
  + proteinContribution
  + fibreContribution
  + vitaminContribution
  + mineralContribution
  - excessSugarPenalty
  - excessFatPenalty
  - excessSodiumPenalty;
```

### 14.5 Macro Thresholds

Each NPC has fatal thresholds.

Example:

```ts
if (
  stats.calories > thresholds.caloriesMax ||
  stats.fat > thresholds.fatMax ||
  stats.sugar > thresholds.sugarMax ||
  stats.carbs > thresholds.carbsMax ||
  stats.sodium > thresholds.sodiumMax
) {
  endRound("npc_died");
}
```

### 14.6 Threshold Warnings

When a stat reaches 80% of its fatal threshold:

- Show warning state.
- Use amber/orange UI.
- Add short warning copy.

Example:

> Sugar is getting dangerous. The bargain dessert aisle is making eye contact.

When a stat reaches 100%:

- End game immediately.
- Show game-over state.

---

## 15. Budget System

### 15.1 Budget

Each NPC has a base budget. The round budget is modified by the current round’s budget multiplier.

```ts
roundBudgetCents = Math.round(npc.baseBudgetCents * budgetMultiplier);
remainingBudget = roundBudgetCents - basketTotalCents;
```

The player cannot buy an item if it costs more than the remaining budget.

### 15.2 Affordability

Food cards should clearly show whether they are affordable.

States:

- Affordable
- Unaffordable
- Already purchased
- Limited quantity exhausted

### 15.3 Round-End Affordability Rule

The round ends automatically if:

- The player has not met the goals.
- The player can no longer afford any available food item.
- No valid purchases remain.

Outcome:

```ts
endRound("out_of_money");
```

Example message:

> The basket is done. Not because it is good. Because capitalism has closed the tab.

---

## 16. Timer System

Each round has a countdown timer.

Default v1 timer:

- 90 seconds

The timer starts when the round begins.

When the timer reaches zero:

- The round ends.
- Game evaluates current basket.
- If goals are met and NPC is alive, player wins.
- Otherwise, player loses.

Timer pressure should matter, but the main difficulty curve should come from shrinking budgets.

---

## 17. Store Inventory

### 17.1 Inventory Generation

At the start of each round, generate a limited store inventory from the full food database.

Inventory should be partly random and partly balanced.

Required inventory properties:

- Includes cheap low-nutrition options.
- Includes at least some nutritious options.
- Includes at least one happiness-heavy option.
- Includes at least one protein source.
- Includes at least one fruit or vegetable.
- Includes at least one risky item.
- Includes several items the NPC can afford at round start.

### 17.2 Inventory Size

Recommended v1 inventory size:

```ts
const INVENTORY_SIZE = 16;
```

Inventory size should remain stable for v1. Difficulty should primarily increase by reducing budget.

### 17.3 Price Variation

Optional but recommended:

- Apply small price variation each round.
- Keep prices plausible.

```ts
finalPrice = basePrice * randomMultiplierBetween(0.85, 1.25);
```

Use seeded randomness if deterministic rounds are desired.

### 17.4 Specials

Some items may appear with special labels:

- Half price
- Clearance
- Bulk value
- Manager’s special
- Fancy but unaffordable
- Shrinkflated

Specials should affect price, happiness, quantity, or availability.

---

## 18. Basket System

The basket shows all selected food items.

### 18.1 Basket Features

The player can:

- Add item.
- Remove item.
- See total cost.
- See remaining budget.
- See combined stat impacts.
- Submit basket manually.

### 18.2 Quantity Rules

For v1, use simple quantity rules:

- Most items can be bought once.
- Some staple items can be bought multiple times.
- Each item defines `maxQuantity`.

```ts
maxQuantity?: number;
```

Default:

```ts
maxQuantity = 1;
```

Staples may allow:

```ts
maxQuantity = 3;
```

### 18.3 Repetition Penalty

If the player buys too many similar items:

- Nutrition may still increase.
- Happiness may decrease.
- NPCs with `dislikes_repetition` are more affected.

Example message:

> That is technically food. It is also the third beige carbohydrate in a row.

---

## 19. Mobile-First UI Requirements

The game must be designed mobile-first.

The player must be able to complete a full round using only one thumb.

### 19.1 Small Screen Layout

On small screens, the UI should use a stacked, thumb-friendly layout:

1. **Sticky top status bar**
   - NPC name
   - Remaining budget
   - Timer
   - Current round number

2. **Compact needs panel**
   - Nutrition meter
   - Happiness meter
   - Macro danger summary

3. **Scrollable food list**
   - Food cards stacked vertically
   - Large tap targets
   - Clear price and impact summary

4. **Sticky bottom basket drawer**
   - Basket total
   - Remaining budget
   - Submit button
   - Expand/collapse control

The player should not need to keep the full basket open while shopping.

The collapsed basket should still show:

- Number of items
- Total spend
- Remaining budget
- Whether current goals are met

### 19.2 Mobile Food Cards

Food cards on small screens should be compact but readable.

Each card should show:

- Food name
- Price
- Key effects only
- Add button
- Affordability state

Example:

```txt
Instant noodles
$1.20

+8 nutrition · +12 happiness
+52 carbs · +14 fat

[Add]
```

Detailed stats can be shown in an expandable section or tap detail panel.

### 19.3 Mobile Stat Display

Nutrition and happiness should remain visible enough that the player can make decisions quickly.

Macro danger meters should collapse into a compact warning row on small screens:

```txt
Risk: Sugar 72% · Fat 41% · Carbs 66%
```

If any danger stat reaches 80%, it should become visually prominent.

Example:

```txt
⚠ Sugar 84% — getting risky
```

### 19.4 Mobile Basket Behaviour

The basket should be a sticky bottom drawer.

Collapsed state:

```txt
Basket: 4 items · $13.40 spent · $3.60 left · [Review]
```

Expanded state:

- Shows selected items
- Allows quantity changes
- Allows removal
- Shows final stat preview
- Includes large Submit button

The Submit button should be disabled only if the basket is illegal, meaning:

- Budget is exceeded.
- NPC is already dead.
- Round has already ended.

It may remain enabled even if goals are not met, but submitting early should trigger a failed outcome unless nutrition and happiness targets are both satisfied.

### 19.5 Desktop Layout

Desktop should use the same core components in a wider layout:

- NPC and stats on left
- Store in centre
- Basket on right

Desktop should not be the source layout. Mobile should be the source layout.

---

## 20. UI Requirements

### 20.1 Main Game Screen

The main game screen should include:

- NPC panel
- Round number
- Budget display
- Timer
- Nutrition meter
- Happiness meter
- Macro risk meters
- Store inventory list/grid
- Basket panel/drawer
- Round status / feedback area

### 20.2 NPC Panel

Display:

- NPC name
- Short description
- Budget
- Needs
- Preferences
- Restrictions
- Current mood/state

Example:

```txt
Milo
Uni student

Round budget: $18.00
Needs: Nutrition 65 / Happiness 45

Current mood:
Trying to remember whether coffee is a meal.
```

### 20.3 Stat Meters

Required meters:

- Nutrition
- Happiness
- Calories
- Fat
- Sugar
- Carbs

Optional meters:

- Protein
- Fibre
- Vitamins
- Minerals
- Sodium

Recommended display:

- Nutrition and happiness are goal meters.
- Macros are danger meters.
- Vitamins and minerals can be shown as positive support stats.

### 20.4 Food Cards

Each food card should show:

- Name
- Price
- Category
- Short description or flavour text
- Key stat impacts
- Tags
- Add button
- Affordability state

Example card:

```txt
Instant noodles
$1.20

+8 nutrition
+12 happiness
+380 calories
+14 fat
+52 carbs

Cheap. Salty. Legally adjacent to dinner.
[Add]
```

### 20.5 Basket Panel

Display:

- Selected items
- Quantity
- Remove button
- Basket total
- Remaining budget
- Submit basket button

### 20.6 Feedback Area

After each purchase, show short feedback.

Examples:

- “Nutrition improved. Happiness looked at it and shrugged.”
- “Cheap, filling, and spiritually beige.”
- “Sugar is getting risky.”
- “Budget remaining: technically money, emotionally confetti.”

---

## 21. Round Outcomes

### 21.1 Win

The player wins the round if:

- Nutrition target met.
- Happiness target met.
- No danger threshold exceeded.
- Budget not exceeded.

Win screen should show:

- NPC survived.
- Goals met.
- Final basket.
- Final stats.
- Remaining budget.
- Score.
- Button to continue to next round.

Example:

> You did it. Jan is fed, broadly content, and only mildly suspicious of the lentils.

### 21.2 Lose: Timer

If timer runs out and goals are not met:

> Time’s up. The basket contains food, technically, but not a plan.

### 21.3 Lose: Out of Money

If player cannot afford any remaining item and goals are not met:

> You are out of money and still short on nutrition. The game is over, which is rude but accurate.

### 21.4 Lose: NPC Death

If a macro threshold is exceeded:

- Immediately end the game.
- Show which stat caused it.
- Use stylised non-graphic copy.

Example:

> Game over. Priya has been defeated by sugar, which arrived in multipack form.

Avoid detailed medical language.

### 21.5 Run Summary

After any loss, show:

- Rounds survived
- Successful rounds
- Final NPC
- Final reason for loss
- Final basket
- Highest round reached
- Best score
- Replay button

---

## 22. Scoring

Scoring should reward success under constraint.

### 22.1 Score Inputs

Score should consider:

- Nutrition achieved
- Happiness achieved
- Remaining budget
- Time remaining
- Number of danger warnings avoided
- Variety
- NPC preference match
- Round number

### 22.2 Suggested Formula

```ts
score =
  nutritionScore
  + happinessScore
  + remainingBudgetBonus
  + timeBonus
  + varietyBonus
  + roundBonus
  - dangerPenalty
  - wastePenalty;
```

### 22.3 Ratings

Show a rating after each successful round.

Examples:

| Rating | Meaning |
|---|---|
| Barely Fed | Won with very low margin |
| Budget Wizard | Won with strong budget efficiency |
| Actually Balanced | Good nutrition and happiness |
| Treat Goblin Economist | High happiness, just enough nutrition |
| Lentil Diplomat | High nutrition, acceptable happiness |
| Supermarket Tactician | Excellent overall result |

---

## 23. Game State Model

```ts
export interface GameState {
  status: GameStatus;
  mode: GameMode;
  roundNumber: number;
  successfulRounds: number;
  budgetMultiplier: number;
  npc: NPC;
  inventory: StoreItem[];
  basket: BasketItem[];
  stats: NutritionStats;
  roundBudgetCents: number;
  remainingBudgetCents: number;
  startedAt: number;
  timeRemainingSeconds: number;
  previousNPCIds: string[];
  endReason?: EndReason;
  score?: number;
  bestScore?: number;
}
```

```ts
export type GameStatus =
  | "idle"
  | "playing"
  | "round_won"
  | "lost";
```

```ts
export type EndReason =
  | "submitted_success"
  | "submitted_failed"
  | "timer_expired"
  | "out_of_money"
  | "npc_died";
```

```ts
export interface StoreItem {
  foodItemId: string;
  currentPriceCents: number;
  quantityAvailable: number;
  specialLabel?: string;
}
```

```ts
export interface BasketItem {
  foodItemId: string;
  quantity: number;
  pricePaidCents: number;
}
```

---

## 24. Data Files

Recommended structure:

```txt
/src
  /app
    /page.tsx
    /layout.tsx
    /globals.css
  /components
    NPCPanel.tsx
    StatsPanel.tsx
    StoreList.tsx
    FoodCard.tsx
    BasketDrawer.tsx
    Timer.tsx
    OutcomeModal.tsx
    RunSummary.tsx
  /data
    npcs.ts
    foodItems.ts
    flavourText.ts
  /game
    applyFoodItem.ts
    calculateStats.ts
    generateInventory.ts
    progression.ts
    scoring.ts
    thresholds.ts
    roundEnd.ts
    seededRandom.ts
  /types
    npc.ts
    food.ts
    game.ts
  /utils
    money.ts
    localStorage.ts
```

---

## 25. Art and Visual Direction

The game should look like a charming supermarket survival board.

Suggested visual style:

- Bright but slightly tired supermarket colours.
- Receipt-like panels.
- Product cards.
- Stickers for specials.
- Rounded meters.
- Slightly imperfect layout details.
- Friendly NPC portraits.
- UI that feels tactile and playful, not SaaS-clean.

Avoid:

- Sterile dashboards.
- Fitness-app aesthetics.
- Medical app aesthetics.
- Guilt-heavy charity visuals.

### 25.1 NPC Art

NPC portraits are optional for v1.

If included:

- Use fictional illustrated portraits.
- Avoid photorealistic real-person style.
- Keep expressions readable:
  - Neutral
  - Happy
  - Worried
  - Danger
  - Defeated

### 25.2 Food Art

Food items can use:

- Emoji
- Simple icons
- Illustrated item cards
- Placeholder shapes

V1 can ship without custom art if the UI is strong.

---

## 26. Accessibility

The game must support:

- Mouse
- Keyboard
- Touch

### 26.1 Keyboard

Required:

- Tab through food cards.
- Enter / Space to add selected item.
- Remove basket items by keyboard.
- Submit basket by keyboard.
- Pause or open menu by keyboard if pause is implemented.

### 26.2 Screen Readers

Food cards should expose:

- Name
- Price
- Main effects
- Whether affordable
- Add/remove actions

Timers should avoid overly noisy live announcements.

### 26.3 Reduced Motion

Respect `prefers-reduced-motion`.

Animations should be decorative only.

### 26.4 Touch Targets

All primary touch targets must be at least:

```txt
44px x 44px
```

---

## 27. LocalStorage

Use LocalStorage for:

- Local high scores.
- Highest round reached.
- Tutorial dismissed state.
- Audio on/off setting, if audio is added.

Suggested keys:

```txt
cost-of-living:high-scores
cost-of-living:highest-round
cost-of-living:tutorial-dismissed
cost-of-living:settings
```

---

## 28. Tutorial

V1 should include a short tutorial.

Tutorial content:

1. Meet the NPC.
2. Watch nutrition and happiness.
3. Avoid overloading dangerous macros.
4. Stay within budget.
5. Timer or empty wallet ends the round.
6. Winning moves you to the next round with a smaller budget.
7. Submit when ready.

Suggested copy:

> Buy food. Keep them fed. Keep them happy. Do not accidentally turn the snack aisle into a boss fight. Every round you survive makes the next budget worse, because apparently this game has read the news.

---

## 29. Balancing Requirements

The game must be balanced so that:

- Round 1 is winnable for new players.
- Early rounds teach the system.
- Later rounds become tighter through reduced budgets.
- Every NPC has at least one viable path to success at full budget.
- At lower budget multipliers, some NPCs should become very difficult but not instantly impossible.
- Some viable paths should feel ugly, compromised, or weird.
- Cheap food should be useful but risky.
- Expensive healthy food should not be an automatic win.
- Happiness should matter enough that “just buy vegetables” is not always optimal.
- Nutrition should matter enough that “just buy biscuits” is not always viable.

### 29.1 Balance Testing

Create internal debug tools or test functions to simulate:

- Whether each NPC can be won at budget multipliers from 1.00 to 0.60.
- Whether each generated inventory has at least one viable solution.
- Whether budget reduction produces meaningful progression.
- Whether the game is still playable on a 360px-wide viewport.

This can be a dev-only utility.

---

## 30. Acceptance Criteria

### 30.1 Core Gameplay

- Player can start a new run.
- Run starts at Round 1.
- Random NPC is selected each round.
- NPC has budget, nutrition target, happiness target, preferences, restrictions, and thresholds.
- Store inventory is generated.
- Player can buy food items.
- Player can remove food items from basket.
- Budget updates correctly.
- Nutrition and happiness update correctly.
- Macro and nutrient meters update correctly.
- Player cannot buy unaffordable items.
- Round timer counts down.
- Round ends when timer runs out.
- Round ends when player can no longer afford any available food item.
- Round ends immediately if a danger threshold is exceeded.
- Player can submit basket manually.
- Win/loss result is calculated correctly.
- Successful round advances to the next round.
- Budget decreases after each successful round.
- Run ends when the player loses.
- Replay starts a new run from Round 1.

### 30.2 Game Rules

- Nutrition and happiness must both meet NPC targets to win.
- Budget cannot go below zero.
- Exceeding fatal macro thresholds causes immediate game over.
- Calories, fat, sugar, and carbs must be tracked.
- Vitamins and minerals must influence nutrition.
- NPC preferences and restrictions must modify food item effects.
- Happiness and nutrition must be separate systems.
- Budget reduction is the primary difficulty mechanism.

### 30.3 Mobile UI

- Game is fully playable at 360px wide.
- No required action depends on hover.
- No required action depends on right-click.
- No horizontal scrolling is required.
- Food cards have tap targets of at least 44px high.
- Basket can be opened, reviewed, edited, and submitted on a small phone screen.
- Nutrition, happiness, budget, timer, and round number are visible or accessible at all times.
- Player can complete multiple rounds on mobile without layout breaking.

### 30.4 General UI

- NPC panel is visible.
- Budget is visible.
- Timer is visible.
- Round number is visible.
- Nutrition and happiness meters are visible.
- Macro danger meters are visible.
- Store inventory is readable.
- Basket is readable.
- Outcome modal shows win/loss result.
- Run summary appears after loss.
- Replay button starts a new run.

### 30.5 Technical

- App runs in browser.
- App deploys to Vercel.
- No database required.
- No authentication required.
- Game logic is written in TypeScript.
- Food and NPC data are stored in local files.
- Build passes TypeScript checks.

---

## 31. Implementation Phases

### Phase 1: Mobile Game Shell

Build:

- Next.js app
- Mobile-first layout
- Sticky top status bar
- Sticky bottom basket drawer
- Placeholder NPC panel
- Placeholder store
- Placeholder basket

### Phase 2: Data Models

Build:

- NPC types
- Food item types
- Game state types
- Example NPC data
- Example food item data

### Phase 3: Core Game Logic

Build:

- Random NPC selection
- Inventory generation
- Add/remove basket item
- Budget calculation
- Stat calculation
- Win/loss evaluation
- Timer

### Phase 4: Progression

Build:

- Round number state
- Budget multiplier calculation
- New NPC per successful round
- Continue-to-next-round flow
- Run summary after loss

### Phase 5: UI and Feedback

Build:

- Food cards
- Stat meters
- Danger warnings
- Basket drawer
- Outcome modal
- Replay button
- Flavour text system

### Phase 6: Balance and Polish

Build:

- More NPCs
- More food items
- Budget tuning
- Local high scores
- Small-phone layout pass
- Accessibility pass

---

## 32. Agent Notes

The central design rule is:

```txt
The player is not trying to buy the “best” food. They are trying to make a constrained life work under pressure.
```

Do not make healthy food automatically good, cheap food automatically bad, or happiness irrelevant.

The second design rule is:

```txt
Difficulty should increase mainly because the budget gets worse.
```

Do not hide the difficulty curve behind too many invisible systems.

The best version of this game is funny because the choices are absurd, and uncomfortable because the absurdity is recognisable.
