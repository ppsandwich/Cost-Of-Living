import { assessTaste } from "../src/game/taste";
import assert from "node:assert/strict";
import { gameReducer, INITIAL_STATE } from "../src/game/reducer";
import { FOOD_BY_ID } from "../src/data/foodItems";
import { RECIPES } from "../src/data/recipes";
import { findRecipe, isStaple } from "../src/game/recipes";
import { findClearingBasket, basketCost } from "../src/game/solver";
import { usableFood } from "../src/game/meals";
import { allRequirementsMet } from "../src/game/requirements";
import { FINAL_ROUND } from "../src/game/progression";
import { MIN_STAPLE_SHARE } from "../src/game/generateInventory";
import { createRng, shuffle } from "../src/game/seededRandom";
import type { BasketItem } from "../src/types/game";

const policies = { economical: { completed: 0, recipes: 0, tasty: 0, dubious: 0 }, swaps: { completed: 0, recipes: 0, tasty: 0, dubious: 0 }, shuffled: { completed: 0, recipes: 0, tasty: 0, dubious: 0 } };
let shops = 0;
for (const difficulty of [1, 2, 3] as const) {
  for (const powerUpsEnabled of [false, true]) {
    for (let seedIndex = 0; seedIndex < 100; seedIndex++) {
      let state = gameReducer(INITIAL_STATE, { type: "START_RUN", mode: "learning", difficulty, powerUpsEnabled, seed: 104729 + seedIndex * 7919, bestScore: 0, highestRound: 0 });
      for (let roundNumber = 1; roundNumber <= FINAL_ROUND; roundNumber++) {
        const rng = createRng(state.seed + roundNumber);
        const npc = state.npc!;
        const inventory = state.inventory;
        const budgetCents = state.roundBudgetCents;
        assert.ok(inventory.filter((item) => isStaple(FOOD_BY_ID[item.foodItemId])).length >= Math.ceil(inventory.length * MIN_STAPLE_SHARE));
        shops++;
        const basket = findClearingBasket(npc, inventory, budgetCents)!;
        assert.ok(basket && allRequirementsMet(basket, npc));
        const count = (policy: keyof typeof policies, attempt: BasketItem[]) => {
          assert.ok(allRequirementsMet(attempt, npc) && basketCost(attempt) <= budgetCents);
          policies[policy].completed++;
          const taste = assessTaste(attempt, npc);
          if (taste.quality === "tasty") policies[policy].tasty++;
          if (taste.quality === "dubious") policies[policy].dubious++;
          if (taste.quality !== "dubious" && (taste.recipe || findRecipe(attempt, npc))) policies[policy].recipes++;
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
        state = gameReducer(state, { type: "BEGIN_SHOPPING", estimateCents: null });
        for (const entry of basket) state = gameReducer(state, { type: "ADD_ITEM", foodItemId: entry.foodItemId });
        state = gameReducer(state, { type: "CHECKOUT" });
        if (state.powerUpChoices) state = gameReducer(state, { type: "CHOOSE_POWERUP", powerUpId: state.powerUpChoices[(seedIndex + roundNumber) % state.powerUpChoices.length] });
        if (roundNumber < FINAL_ROUND) state = gameReducer(state, { type: "NEXT_ROUND" });
      }
    }
  }
}
console.log(`${RECIPES.length} recipes; ${shops} shops, all with at least 40% staples.`);
for (const [name, stats] of Object.entries(policies)) {
  const rate = stats.recipes / stats.completed;
  console.log(`${name}: ${stats.recipes}/${stats.completed} completed baskets (${(rate * 100).toFixed(1)}%) made a recipe.`);
  console.log(`  Tasty: ${stats.tasty}; dubious: ${stats.dubious}.`);
  assert.ok(rate >= 0.7, `${name} recipe coverage must reach 70%`);

}
