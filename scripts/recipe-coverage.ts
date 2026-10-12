import assert from "node:assert/strict";
import { NPCS } from "../src/data/npcs";
import { FOOD_BY_ID } from "../src/data/foodItems";
import { RECIPES } from "../src/data/recipes";
import { findRecipe, isStaple } from "../src/game/recipes";
import { generateSolvableRound, findClearingBasket, basketCost } from "../src/game/solver";
import { usableFood } from "../src/game/meals";
import { allRequirementsMet } from "../src/game/requirements";
import { budgetMultiplierForRound, FINAL_ROUND } from "../src/game/progression";
import { powerUpExtraBudgetCents, drawPowerUps } from "../src/game/powerups";
import { MIN_STAPLE_SHARE } from "../src/game/generateInventory";
import { POWER_UP_STOPS } from "../src/game/shops";
import { createRng, shuffle } from "../src/game/seededRandom";
import type { BasketItem } from "../src/types/game";

const policies = { economical: { completed: 0, recipes: 0 }, swaps: { completed: 0, recipes: 0 }, shuffled: { completed: 0, recipes: 0 } };
let shops = 0;
for (const npc of NPCS) {
  for (let roundNumber = 1; roundNumber <= FINAL_ROUND; roundNumber++) {
    for (let seedIndex = 0; seedIndex < 25; seedIndex++) {
      for (const upgrades of [false, true]) {
        const seed = 104729 + seedIndex * 7919 + roundNumber;
        const rng = createRng(seed);
        const powerUps = drawPowerUps(rng, [], upgrades ? POWER_UP_STOPS.filter((stop) => stop < roundNumber).length : 0);
        const base = Math.round(npc.baseBudgetCents * budgetMultiplierForRound(roundNumber)) + powerUpExtraBudgetCents(powerUps);
        const { inventory, budgetCents } = generateSolvableRound(npc, base, seed, roundNumber, powerUps);
        assert.ok(inventory.filter((item) => isStaple(FOOD_BY_ID[item.foodItemId])).length >= Math.ceil(inventory.length * MIN_STAPLE_SHARE));
        shops++;
        const basket = findClearingBasket(npc, inventory, budgetCents)!;
        assert.ok(basket && allRequirementsMet(basket, npc));
        const count = (policy: keyof typeof policies, attempt: BasketItem[]) => {
          assert.ok(allRequirementsMet(attempt, npc) && basketCost(attempt) <= budgetCents);
          policies[policy].completed++;
          if (findRecipe(attempt, npc)) policies[policy].recipes++;
        };
        count("economical", basket);
        // Make valid, affordable swaps without looking at the recipe catalogue.
        let swapped = basket;
        for (const item of shuffle(rng, inventory)) {
          if (swapped.some((entry) => entry.foodItemId === item.foodItemId)) continue;
          for (const entry of shuffle(rng, swapped)) {
            const trial = [...swapped.filter((old) => old.foodItemId !== entry.foodItemId), { foodItemId: item.foodItemId, quantity: 1, pricePaidCents: item.currentPriceCents }];
            if (basketCost(trial) <= budgetCents && allRequirementsMet(trial, npc)) { swapped = trial; break; }
          }
        }
        count("swaps", swapped);
        // Random shelf order; buy affordable dietary-safe food until the checklist is done.
        const random: BasketItem[] = [];
        for (const item of shuffle(rng, inventory)) {
          const trial = [...random, { foodItemId: item.foodItemId, quantity: 1, pricePaidCents: item.currentPriceCents }];
          // No taste, meal-role or recipe ranking in this policy.
          if (basketCost(trial) > budgetCents || !usableFood(FOOD_BY_ID[item.foodItemId], npc)) continue;
          random.push(trial[trial.length - 1]);
          if (allRequirementsMet(random, npc)) { count("shuffled", random); break; }
        }
      }
    }
  }
}
console.log(`${RECIPES.length} recipes; ${shops} shops, all with at least 40% staples.`);
for (const [name, stats] of Object.entries(policies)) {
  const rate = stats.recipes / stats.completed;
  console.log(`${name}: ${stats.recipes}/${stats.completed} completed baskets (${(rate * 100).toFixed(1)}%) made a recipe.`);
  assert.ok(rate >= 0.7, `${name} recipe coverage must reach 70%`);

}
