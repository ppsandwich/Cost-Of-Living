import assert from "node:assert/strict";
import { gameReducer, INITIAL_STATE } from "../src/game/reducer";
import { FOOD_BY_ID } from "../src/data/foodItems";
import { NPCS } from "../src/data/npcs";
import { POWER_UPS } from "../src/data/powerups";
import { allRequirementsMet } from "../src/game/requirements";
import { basketCost, findClearingBasket, generateSolvableRound } from "../src/game/solver";
import { budgetHeadroomForRound, wishCountForRound } from "../src/game/progression";
import { violatesMustNot } from "../src/game/applyFoodItem";
import { isStaple } from "../src/game/recipes";
import type { FoodPreference } from "../src/types/npc";

let runs = 0, shops = 0, fourWishShops = 0;
const headroom = Array.from({ length: 20 }, () => ({ base: 0, actual: 0, count: 0 }));
for (const difficulty of [1, 2, 3] as const) for (const mode of ["learning", "standard_run"] as const) for (const powerUpsEnabled of [false, true]) {
  for (let seed = 1; seed <= 100; seed++) {
    let state = gameReducer(INITIAL_STATE, { type: "START_RUN", seed: seed * 7919, mode, difficulty, powerUpsEnabled, allowRetries: seed % 2 === 0, bestScore: 0, highestRound: 0 });
    let previousBaseRatio = Infinity;
    let previousActualRatio = Infinity;
    for (let round = 1; round <= 20; round++) {
      shops++;
      if (round > 15) fourWishShops++;
      assert.equal(state.status, "planning");
      assert.equal(state.npc!.wants.length, wishCountForRound(round));
      assert.equal(state.inventory.length, state.powerUps.includes("superstore") ? 26 : 20);
      assert.ok(state.inventory.filter((item) => isStaple(FOOD_BY_ID[item.foodItemId])).length >= Math.ceil(state.inventory.length * 0.4));
      assert.ok(allRequirementsMet(state.solution, state.npc!));
      assert.equal(new Set(state.solution.map((item) => item.foodItemId)).size, state.solution.length);
      for (const item of state.solution) assert.equal(item.pricePaidCents, state.inventory.find((shelf) => shelf.foodItemId === item.foodItemId)!.currentPriceCents);
      assert.ok(basketCost(state.solution) <= state.roundBudgetCents);
      const reference = state.inventory.map((item) => ({ ...item, currentPriceCents: item.referencePriceCents! }));
      const referenceCost = basketCost(findClearingBasket(state.npc!, reference, Infinity)!);
      const baseRatio = state.baseBudgetCents / referenceCost;
      assert.ok(baseRatio < previousBaseRatio, `Base difficulty must rise: seed ${seed}, round ${round}, level ${difficulty}`);
      previousBaseRatio = baseRatio;
      const actualRatio = state.roundBudgetCents / basketCost(state.solution);
      assert.ok(actualRatio < previousActualRatio, `Actual difficulty must rise: seed ${seed}, round ${round}, level ${difficulty}, power-ups ${powerUpsEnabled}`);
      previousActualRatio = actualRatio;
      assert.equal(state.baseBudgetCents, Math.floor(referenceCost * budgetHeadroomForRound(round, difficulty)));
      if (difficulty === 2) {
        const stats = headroom[round - 1]; stats.base += baseRatio; stats.actual += state.roundBudgetCents / basketCost(state.solution); stats.count++;
      }
      assert.equal(gameReducer(state, { type: "TICK" }), state);
      state = gameReducer(state, { type: "BEGIN_SHOPPING", estimateCents: null });
      if (mode === "standard_run") {
        const lost = gameReducer({ ...state, timeRemainingSeconds: 1 }, { type: "TICK" });
        assert.equal(lost.status, "lost");
        assert.deepEqual(lost.solution, state.solution);
        assert.equal(gameReducer(lost, { type: "RETRY_ROUND" }).status, state.allowRetries ? "planning" : "lost");
      }
      const unsuitable = state.inventory.find((item) => violatesMustNot(FOOD_BY_ID[item.foodItemId], state.npc!));
      if (unsuitable) {
        state = gameReducer(state, { type: "ADD_ITEM", foodItemId: unsuitable.foodItemId });
        assert.equal(gameReducer(state, { type: "CHECKOUT" }), state);
        state = gameReducer(state, { type: "REMOVE_ITEM", foodItemId: unsuitable.foodItemId });
      }
      for (const item of state.solution) {
        state = gameReducer(state, { type: "ADD_ITEM", foodItemId: item.foodItemId });
        state = gameReducer(state, { type: "TICK" });
      }
      state = gameReducer(state, { type: "OPEN_BASKET" });
      assert.equal(state.basketReviewOpen, true);
      assert.equal(gameReducer(state, { type: "TICK" }), state);
      state = gameReducer(state, { type: "CHECKOUT" });
      assert.equal(state.status, round === 20 ? "game_won" : "round_won");
      if (!powerUpsEnabled) assert.equal(state.powerUpChoices, null);
      if (round < 20) {
        if (state.powerUpChoices) state = gameReducer(state, { type: "CHOOSE_POWERUP", powerUpId: state.powerUpChoices[(seed + round) % state.powerUpChoices.length] });
        state = gameReducer(state, { type: "NEXT_ROUND" });
      }
    }
    assert.equal(state.successfulRounds, 20);
    runs++;
  }
}
console.log(`${runs} complete runs; ${shops} cleared shops; ${fourWishShops} four-wish shops. All levels, modes, power-ups on/off, timeout solutions and retry policies passed.`);
console.log("Round | Wishes | Baseline budget / minimum | With earned boosts (average)");
headroom.forEach((stat, i) => console.log(`${String(i + 1).padStart(5)} | ${wishCountForRound(i + 1)}      | ${(stat.base / stat.count).toFixed(3)}                     | ${(stat.actual / stat.count).toFixed(3)}`));

// Stress every four-wish combination against every dietary rule, not just the NPC presets.
const wishes: FoodPreference[] = ["likes_sweet_food", "likes_salty_food", "likes_fresh_food", "likes_comfort_food", "likes_spicy_food", "likes_crunchy_food", "likes_familiar_food", "likes_variety"];
let combinations = 0;
for (let mask = 0; mask < 256; mask++) {
  const wants = wishes.filter((_, i) => mask & (1 << i));
  if (wants.length !== 4) continue;
  for (const mustNot of [...new Set(NPCS.map((npc) => npc.mustNot))]) for (let seed = 1; seed <= 10; seed++) for (const upgraded of [false, true]) {
    const npc = { ...NPCS[0], mustNot, wants };
    const round = generateSolvableRound(npc, 1, seed, 20, upgraded ? POWER_UPS.map((p) => p.id) : []);
    assert.ok(allRequirementsMet(round.solution, npc));
    assert.ok(basketCost(round.solution) <= Math.floor(round.referenceCostCents * budgetHeadroomForRound(20, 3)));
    combinations++;
  }
}
console.log(`${combinations} stress shops passed: all 70 four-wish combinations × 6 dietary rules × 10 seeds × 2 upgrade states.`);
