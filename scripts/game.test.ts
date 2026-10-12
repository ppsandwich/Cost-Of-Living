import { RECIPES, STAPLE_IDS } from "../src/data/recipes";
import { findRecipe, isStaple, RECIPE_BONUS } from "../src/game/recipes";
import { generateInventory, INVENTORY_SIZE } from "../src/game/generateInventory";
import { groupShelves, SHELF_GROUPS } from "../src/game/shelfGroups";
import { POWER_UP_STOPS, shopForRound } from "../src/game/shops";
import assert from "node:assert/strict";
import test from "node:test";
import { gameReducer, INITIAL_STATE } from "../src/game/reducer";
import {
  findClearingBasket,
  basketCost,
  generateSolvableRound,
} from "../src/game/solver";
import { allRequirementsMet } from "../src/game/requirements";
import { mealRoles, usableFood } from "../src/game/meals";
import { improvementTip, missingRequirements, findSaving, challengeAchieved } from "../src/game/feedback";
import { violatesMustNot } from "../src/game/applyFoodItem";
import { calculateRoundScore } from "../src/game/scoring";
import { POWER_UPS } from "../src/data/powerups";
import { NPCS } from "../src/data/npcs";
import { FOOD_ITEMS, FOOD_BY_ID } from "../src/data/foodItems";
import { FINAL_ROUND } from "../src/game/progression";
import type { GameState, GameMode, BasketItem } from "../src/types/game";

function start(mode: GameMode = "learning", seed = 12345): GameState {
  return gameReducer(INITIAL_STATE, {
    type: "START_RUN",
    mode,
    seed,
    bestScore: 0,
    highestRound: 0,
  });
}
function begin(state: GameState) {
  return gameReducer(state, {
    type: "BEGIN_SHOPPING",
    estimateCents: 1000,
  });
}
function fill(state: GameState): GameState {
  const witness = findClearingBasket(
    state.npc!,
    state.inventory,
    state.roundBudgetCents,
  );
  assert.ok(witness, "generated shop has a legal basket");
  let next = state;
  for (const item of witness)
    next = gameReducer(next, { type: "ADD_ITEM", foodItemId: item.foodItemId });
  return next;
}
function clear(state: GameState) {
  return gameReducer(fill(begin(state)), { type: "CHECKOUT" });
}

test("planning stops time and purchases; learning permits revisions without time penalties", () => {
  const plan = start();
  assert.equal(plan.status, "planning");
  assert.equal(gameReducer(plan, { type: "TICK" }), plan);
  assert.equal(
    gameReducer(plan, {
      type: "ADD_ITEM",
      foodItemId: plan.inventory[0].foodItemId,
    }),
    plan,
  );
  assert.equal(
    gameReducer(plan, {
      type: "BEGIN_SHOPPING",
      estimateCents: NaN,
    }),
    plan,
  );
  let shopping = fill(begin(plan));
  assert.equal(gameReducer(shopping, { type: "TICK" }), shopping);
  const before = shopping.timeRemainingSeconds;
  const entry = shopping.basket[0];
  const remaining = shopping.remainingBudgetCents;
  shopping = gameReducer(shopping, {
    type: "REMOVE_ITEM",
    foodItemId: entry.foodItemId,
  });
  assert.equal(shopping.timeRemainingSeconds, before);
  assert.equal(shopping.remainingBudgetCents, remaining + entry.pricePaidCents);
});

test("timed rounds tick, charge revision time and resolve timeout exactly once", () => {
  const shopping = fill(begin(start("standard_run")));
  const ticked = gameReducer(shopping, { type: "TICK" });
  assert.equal(ticked.timeRemainingSeconds, shopping.timeRemainingSeconds - 1);
  const revised = gameReducer(ticked, {
    type: "REMOVE_ITEM",
    foodItemId: shopping.basket[0].foodItemId,
  });
  assert.equal(revised.timeRemainingSeconds, ticked.timeRemainingSeconds - 3);
  const lost = gameReducer(
    { ...shopping, timeRemainingSeconds: 1 },
    { type: "TICK" },
  );
  assert.equal(lost.status, "lost");
  assert.equal(gameReducer(lost, { type: "CHECKOUT" }), lost);
  assert.equal(gameReducer(lost, { type: "TICK" }), lost);
  assert.equal(gameReducer(lost, { type: "RETRY_ROUND" }).status, "planning");
});

test("kitchen access never limits food; dietary boundaries still apply with every upgrade", () => {
  for (const npc of NPCS) {
    for (const food of Object.values(FOOD_BY_ID)) {
      assert.equal(usableFood(food, npc), !violatesMustNot(food, npc));
    }
  }
  for (const id of ["milo", "theo", "bert"]) {
    const npc = NPCS.find((n) => n.id === id)!;
    for (const foodItemId of ["tofu", "microwave-curry", "frozen-pizza"]) {
      for (const powerUps of [[], POWER_UPS.map((p) => p.id)]) {
        const state = { ...begin(start()), npc, powerUps,
          inventory: [{ foodItemId, currentPriceCents: 100, quantityAvailable: 3, onSale: false }] };
        const next = gameReducer(state, { type: "ADD_ITEM", foodItemId });
        assert.equal(next.basket.length, violatesMustNot(FOOD_BY_ID[foodItemId], npc) ? 0 : 1);
      }
    }
  }
});

test("checkout requires the entire brief and budget; stock and blocked items cannot be bypassed", () => {
  let state = begin(start());
  assert.equal(gameReducer(state, { type: "CHECKOUT" }), state);
  const forbidden = FOOD_BY_ID.bacon;
  state = {
    ...state,
    npc: { ...state.npc!, mustNot: "no_pork" },
    inventory: [
      ...state.inventory,
      {
        foodItemId: forbidden.id,
        quantityAvailable: 2,
        currentPriceCents: 100,
      },
    ],
  };
  assert.equal(
    gameReducer(state, { type: "ADD_ITEM", foodItemId: forbidden.id }),
    state,
  );
  const full = fill(state);
  assert.equal(
    gameReducer({ ...full, remainingBudgetCents: -1 }, { type: "CHECKOUT" })
      .status,
    "playing",
  );
  const first = full.inventory.find((i) =>
    usableFood(FOOD_BY_ID[i.foodItemId], full.npc!),
  )!;
  let stock = begin({ ...state, inventory: [first] });
  for (let i = 0; i < first.quantityAvailable + 2; i++)
    stock = gameReducer(stock, {
      type: "ADD_ITEM",
      foodItemId: first.foodItemId,
    });
  assert.equal(
    stock.basket.find((b) => b.foodItemId === first.foodItemId)?.quantity,
    first.quantityAvailable,
  );
});

test("retry restores the exact shop and replaces scores, wins and acquired upgrades", () => {
  const plan = start();
  const won = clear(plan);
  assert.equal(won.status, "round_won");
  const chosen = gameReducer(won, {
    type: "CHOOSE_POWERUP",
    powerUpId: won.powerUpChoices![0],
  });
  const retry = gameReducer(chosen, { type: "RETRY_ROUND" });
  assert.deepEqual(retry.inventory, plan.inventory);
  assert.deepEqual(retry.npc, plan.npc);
  assert.equal(retry.roundBudgetCents, plan.roundBudgetCents);
  assert.deepEqual(retry.powerUps, plan.powerUps);
  assert.equal(retry.totalScore, plan.totalScore);
  assert.equal(retry.successfulRounds, plan.successfulRounds);
  assert.equal(retry.previousAttempt?.cleared, true);
  assert.equal(retry.previousAttempt?.spentCents, basketCost(won.basket));
  const wonAgain = clear(retry);
  assert.equal(wonAgain.totalScore, won.totalScore);
  assert.equal(wonAgain.successfulRounds, 1);
  assert.equal(wonAgain.roundHistory.length, 1);
  assert.deepEqual(wonAgain.powerUpChoices, won.powerUpChoices);
  assert.equal(gameReducer(wonAgain, { type: "CHECKOUT" }), wonAgain);
  assert.equal(
    gameReducer(wonAgain, { type: "NEXT_ROUND" }),
    wonAgain,
    "must choose before moving on",
  );
});

test("premium prices cannot increase meal coverage and learning scores do not reward speed", () => {
  assert.deepEqual(
    mealRoles(FOOD_BY_ID["premium-bag-of-apples"]),
    mealRoles(FOOD_BY_ID["bag-of-apples"]),
  );
  const input = {
    mode: "learning" as const,
    remainingBudgetCents: 100,
    roundNumber: 1,
    timeRemainingSeconds: 90,
  };
  assert.equal(
    calculateRoundScore(input),
    calculateRoundScore({ ...input, timeRemainingSeconds: 1 }),
  );
  assert.equal(
    calculateRoundScore({ ...input, mode: "standard_run" }) -
      calculateRoundScore(input),
    90,
  );
});

test("receipt suggests a verified saving, with unmet requirements for incomplete baskets", () => {
  const npc = NPCS.find((n) => n.id === "jan")!;
  const basket: BasketItem[] = [
    { foodItemId: "white-bread", quantity: 2, pricePaidCents: 200 },
    { foodItemId: "chickpeas-tin", quantity: 1, pricePaidCents: 150 },
    { foodItemId: "carrots", quantity: 1, pricePaidCents: 200 },
  ];
  assert.equal(allRequirementsMet(basket, npc), true);
  const state = {
    ...start(),
    npc,
    basket,
    remainingBudgetCents: 1000,
    endReason: "goals_met" as const,
    inventory: [],
  };
  assert.match(
    improvementTip(state),
    /Put back one pack of White bread and save \$2\.00/,
  );
  assert.equal(
    allRequirementsMet(
      [{ ...basket[0], quantity: 1 }, ...basket.slice(1)],
      npc,
    ),
    true,
  );
  assert.deepEqual(missingRequirements(state), []);
  assert.ok(
    missingRequirements({ ...state, basket: [] }).includes("A lunch base"),
  );
});

test("all twenty rounds progress, final retry works, rain check cannot win the final shop", () => {
  let state = start();
  for (let round = 1; round <= FINAL_ROUND; round++) {
    assert.equal(state.status, "planning");
    state = clear(state);
    assert.equal(state.successfulRounds, round);
    if (round < FINAL_ROUND) {
      if (state.powerUpChoices?.length)
        state = gameReducer(state, {
          type: "CHOOSE_POWERUP",
          powerUpId: state.powerUpChoices[0],
        });
      state = gameReducer(state, { type: "NEXT_ROUND" });
    }
  }
  assert.equal(state.status, "game_won");
  const retry = gameReducer(state, { type: "RETRY_ROUND" });
  assert.equal(retry.successfulRounds, 19);
  assert.equal(clear(retry).successfulRounds, 20);
  const playing = { ...begin(retry), powerUps: ["escape_rope" as const] };
  assert.equal(gameReducer(playing, { type: "USE_ESCAPE_ROPE" }), playing);
  const skip = gameReducer(
    { ...begin(start()), powerUps: ["escape_rope"] },
    { type: "USE_ESCAPE_ROPE" },
  );
  assert.equal(skip.roundNumber, 2);
  assert.equal(skip.successfulRounds, 0);
  assert.equal(skip.totalScore, 0);
  assert.equal(skip.powerUps.includes("escape_rope"), false);
});

test("a low-budget generated shop carries a real solution witness", () => {
  const npc = NPCS[0];
  const round = generateSolvableRound(npc, 1, 9, 20, []);
  const basket = findClearingBasket(npc, round.inventory, round.budgetCents);
  assert.ok(basket);
  assert.ok(basketCost(basket) <= round.budgetCents);
  assert.ok(round.rescueCents > 0);
});

test("basket events celebrate only newly covered roles and wishes, and return the paid amount", () => {
  let state = begin(start());
  state = { ...state, npc: NPCS.find(n => n.id === "ada")!, basket: [], inventory: [
    { foodItemId: "microwave-curry", currentPriceCents: 300, quantityAvailable: 2 },
    { foodItemId: "carrots", currentPriceCents: 150, quantityAvailable: 1 },
  ] };
  state = gameReducer(state, { type: "ADD_ITEM", foodItemId: "microwave-curry" });
  assert.deepEqual(state.basketEvent?.newRoles, ["base", "protein"]);
  state = gameReducer(state, { type: "ADD_ITEM", foodItemId: "microwave-curry" });
  assert.deepEqual(state.basketEvent?.newRoles, []);
  const blocked = gameReducer(state, { type: "ADD_ITEM", foodItemId: "microwave-curry" });
  assert.equal(blocked, state, "sold-out purchases do not trigger animation or sound events");
  state = gameReducer(state, { type: "ADD_ITEM", foodItemId: "carrots" });
  assert.equal(state.basketEvent?.newWant, "likes_fresh_food");
  assert.deepEqual(state.basketEvent?.newRoles, ["produce"]);
  const remaining = state.remainingBudgetCents;
  state = gameReducer(state, { type: "REMOVE_ITEM", foodItemId: "carrots" });
  assert.equal(state.basketEvent?.kind, "remove");
  assert.equal(state.basketEvent?.cents, 150);
  assert.equal(state.remainingBudgetCents, remaining + 150);
});

test("retry challenges have a legal cheaper witness and require a complete checkout for the badge", () => {
  const original = { ...start(), npc: NPCS.find(n => n.id === "jan")!, roundBudgetCents: 2000, remainingBudgetCents: 2000,
    inventory: ["white-bread", "baked-beans", "carrots"].map(foodItemId => ({ foodItemId, currentPriceCents: 200, quantityAvailable: 2 })) };
  const plan = { ...original, roundStart: { ...original, roundStart: null } };
  let state = begin(plan);
  for (const foodItemId of ["white-bread", "white-bread", "baked-beans", "carrots"]) state = gameReducer(state, { type: "ADD_ITEM", foodItemId });
  state = gameReducer(state, { type: "CHECKOUT" });
  const saving = findSaving(state)!;
  assert.equal(saving.savings, 200);
  assert.equal(allRequirementsMet(saving.basket, state.npc!), true);
  assert.equal(basketCost(saving.basket), 600);
  const retry = gameReducer(state, { type: "RETRY_ROUND", challenge: true });
  assert.equal(retry.retryChallenge?.targetSpendCents, 600);
  assert.deepEqual(retry.inventory, plan.inventory);
  assert.equal(retry.totalScore, 0);
  assert.equal(challengeAchieved(retry), false);
  state = begin(retry);
  for (const item of saving.basket) state = gameReducer(state, { type: "ADD_ITEM", foodItemId: item.foodItemId });
  assert.equal(challengeAchieved(state), false, "shopping is not a completed challenge");
  state = gameReducer(state, { type: "CHECKOUT" });
  assert.equal(challengeAchieved(state), true);
  assert.equal(state.successfulRounds, 1, "retry replaces the previous result");
  assert.equal(challengeAchieved({ ...state, basket: [] }), false, "saving alone cannot earn the badge");
  assert.equal(findSaving(state), null, "do not invent a target when no saving is verified");
  assert.equal(gameReducer(state, { type: "RETRY_ROUND", challenge: true }).retryChallenge, null);
});

test("shop settings rotate and trail reward stops match the actual offers", () => {
  assert.deepEqual([1, 2, 3, 4].map(round => shopForRound(round).id), ["corner", "market", "supermarket", "corner"]);
  let state = start();
  for (let round = 1; round <= FINAL_ROUND; round++) {
    state = clear(state);
    assert.equal(Boolean(state.powerUpChoices?.length), POWER_UP_STOPS.includes(round));
    if (state.powerUpChoices?.length) state = gameReducer(state, { type: "CHOOSE_POWERUP", powerUpId: state.powerUpChoices[0] });
    if (round < FINAL_ROUND) state = gameReducer(state, { type: "NEXT_ROUND" });
  }
  assert.equal(state.status, "game_won");
});

test("shelves follow filter order without duplicating foods that cover two lunch parts", () => {
  const npc = { ...NPCS[0], wants: ["likes_sweet_food", "likes_crunchy_food"] as typeof NPCS[number]["wants"] };
  const inventory = ["instant-coffee", "chocolate-biscuits", "bananas", "tofu", "frozen-pizza"]
    .map((foodItemId) => ({ foodItemId, currentPriceCents: 100, quantityAvailable: 2 }));
  const groups = groupShelves(inventory, npc, "all", false);
  assert.deepEqual(groups.map((group) => group.id), ["base", "protein", "produce", "wishes", "extras"]);
  assert.deepEqual(groups.map((group) => group.items.map((item) => item.foodItemId)),
    [["frozen-pizza"], ["tofu"], ["bananas"], ["chocolate-biscuits"], ["instant-coffee"]]);
  assert.equal(groups.flatMap((group) => group.items).length, inventory.length);
  assert.ok(groupShelves(inventory, npc, "protein", false)[0].items.some((item) => item.foodItemId === "frozen-pizza"));
  assert.ok(groupShelves(inventory, npc, "wishes", false)[0].items.some((item) => item.foodItemId === "bananas"));
});

test("group filters preserve dietary exclusions and every suitable food stays discoverable", () => {
  const inventory = Object.values(FOOD_BY_ID).map((food) => ({ foodItemId: food.id, currentPriceCents: 100, quantityAvailable: 2 }));
  for (const npc of NPCS) {
    const all = groupShelves(inventory, npc, "all", false).flatMap((group) => group.items);
    assert.equal(new Set(all.map((item) => item.foodItemId)).size, all.length);
    assert.equal(all.length, inventory.filter((item) => usableFood(FOOD_BY_ID[item.foodItemId], npc)).length);
    assert.equal(groupShelves(inventory, npc, "all", true).flatMap((group) => group.items).length, inventory.length);
    for (const group of SHELF_GROUPS) {
      const filtered = groupShelves(inventory, npc, group.id, false);
      assert.ok(filtered.every((section) => section.id === group.id));
      assert.ok(filtered.flatMap((section) => section.items).every((item) => usableFood(FOOD_BY_ID[item.foodItemId], npc)));
    }
  }
});


test("new cooking ingredients are reachable in normal shops without enlarging each shop", () => {
  const additions = ["spaghetti-500g", "lasagne-sheets", "basmati-rice-1kg", "brown-rice-1kg", "plain-flour-1kg", "caster-sugar-1kg", "eggs-six", "milk-1l", "fresh-basil", "dried-oregano", "ground-cumin", "curry-powder", "garlic-bulb", "red-onions-500g", "chicken-breast-500g", "pork-mince-500g", "white-fish-fillets-500g", "tinned-sardines", "lemons-three", "tomato-paste", "kidney-beans-tin"];
  assert.equal(new Set(FOOD_ITEMS.map((food) => food.id)).size, FOOD_ITEMS.length);
  const seen = new Set<string>();
  for (let seed = 1; seed <= 200; seed++) {
    const npc = NPCS[seed % NPCS.length];
    const inventory = generateInventory(npc, npc.baseBudgetCents, seed);
    assert.equal(inventory.length, INVENTORY_SIZE);
    inventory.forEach((item) => seen.add(item.foodItemId));
  }
  for (const id of additions) {
    assert.ok(FOOD_BY_ID[id], `${id} is in the catalogue`);
    assert.ok(seen.has(id), `${id} can appear on the shelves`);
    assert.ok(Number.isInteger(FOOD_BY_ID[id].basePriceCents) && FOOD_BY_ID[id].basePriceCents > 0);
  }
});

test("cooking staples cover lunch roles while seasonings stay extras and dietary rules hold", () => {
  for (const id of ["spaghetti-500g", "lasagne-sheets", "basmati-rice-1kg", "brown-rice-1kg", "plain-flour-1kg"])
    assert.deepEqual(mealRoles(FOOD_BY_ID[id]), ["base"]);
  for (const id of ["eggs-six", "chicken-breast-500g", "pork-mince-500g", "white-fish-fillets-500g", "tinned-sardines", "kidney-beans-tin"])
    assert.deepEqual(mealRoles(FOOD_BY_ID[id]), ["protein"]);
  assert.deepEqual(mealRoles(FOOD_BY_ID["red-onions-500g"]), ["produce"]);
  for (const id of ["fresh-basil", "dried-oregano", "ground-cumin", "curry-powder", "garlic-bulb", "lemons-three", "tomato-paste", "caster-sugar-1kg", "milk-1l"])
    assert.deepEqual(mealRoles(FOOD_BY_ID[id]), [], `${id} does not fill a main lunch slot`);
  for (const id of ["chicken-breast-500g", "pork-mince-500g", "white-fish-fillets-500g", "tinned-sardines"])
    assert.equal(usableFood(FOOD_BY_ID[id], { ...NPCS[0], mustNot: "vegetarian" }), false);
  assert.equal(usableFood(FOOD_BY_ID["pork-mince-500g"], { ...NPCS[0], mustNot: "no_pork" }), false);
  assert.equal(usableFood(FOOD_BY_ID["eggs-six"], { ...NPCS[0], mustNot: "egg_allergy" }), false);
  assert.equal(usableFood(FOOD_BY_ID["milk-1l"], { ...NPCS[0], mustNot: "dairy_allergy" }), false);
  assert.equal(usableFood(FOOD_BY_ID["kidney-beans-tin"], { ...NPCS[0], mustNot: "vegan" }), true);
});

test("recipe catalogue only uses real ingredients and every shop has at least 40% staples", () => {
  assert.equal(new Set(RECIPES.map((recipe) => recipe.id)).size, RECIPES.length);
  for (const recipe of RECIPES) {
    assert.ok(recipe.ingredients.length >= 2);
    for (const slot of recipe.ingredients) assert.ok(slot.length > 0);
    for (const id of [...recipe.ingredients.flat(), ...(recipe.optional ?? [])]) assert.ok(FOOD_BY_ID[id], `${recipe.id}: ${id} exists`);
  }
  for (const id of STAPLE_IDS) assert.ok(FOOD_BY_ID[id]);
  for (const npc of NPCS) for (const powerUps of [[], POWER_UPS.map((p) => p.id)]) for (let seed = 1; seed <= 20; seed++) {
    const inventory = generateInventory(npc, npc.baseBudgetCents, seed, 20, powerUps);
    assert.ok(inventory.filter((item) => isStaple(FOOD_BY_ID[item.foodItemId])).length >= Math.ceil(inventory.length * 0.4));
  }
});

const ingredients = (...ids: string[]): BasketItem[] => ids.map((foodItemId) => ({ foodItemId, quantity: 1, pricePaidCents: 100 }));

test("recipe matching requires distinct bought ingredients, honours dietary rules and conserves extras", () => {
  const npc = { ...NPCS[0], mustNot: "no_pork" as const };
  assert.equal(findRecipe(ingredients("white-bread"), npc), null);
  assert.equal(findRecipe([{ ...ingredients("bananas")[0], quantity: 3 }], npc), null);
  assert.equal(findRecipe(ingredients("bag-of-apples", "premium-bag-of-apples"), npc), null);
  assert.equal(findRecipe(ingredients("white-bread", "bacon"), npc), null);
  assert.equal(findRecipe(ingredients("white-bread", "eggs-six"), { ...npc, mustNot: "egg_allergy" }), null);
  assert.equal(findRecipe([{ ...ingredients("eggs-six")[0], quantity: 0 }, ...ingredients("white-bread")], npc), null);
  const basket = [{ ...ingredients("white-bread")[0], quantity: 2 }, ...ingredients("baked-beans", "cola-2l")];
  const match = findRecipe(basket, npc)!;
  assert.equal(match.recipeId, "beans-on-toast");
  assert.deepEqual(match.used.map((entry) => entry.foodItemId).sort(), ["baked-beans", "white-bread"]);
  assert.deepEqual(match.extras.map((entry) => [entry.foodItemId, entry.quantity]), [["white-bread", 1], ["cola-2l", 1]]);
  for (const entry of basket) assert.equal([...match.used, ...match.extras].filter((item) => item.foodItemId === entry.foodItemId).reduce((sum, item) => sum + item.quantity, 0), entry.quantity);
  const premium = findRecipe(ingredients("white-bread", "premium-cheese-block"), npc)!;
  assert.equal(premium.recipeId, "cheese-toastie");
  assert.ok(premium.used.some((entry) => entry.foodItemId === "premium-cheese-block"));
  assert.equal(findRecipe(ingredients("pasta-500g", "beef-mince", "tinned-tomatoes", "garlic-bulb"), npc)?.recipeId, "bolognese");
});

test("Recipe Bonus is awarded once at valid checkout, reset on retry, and included in the final round", () => {
  const npc = { ...NPCS[0], mustNot: "no_pork" as const, wants: ["likes_comfort_food", "likes_sweet_food"] as typeof NPCS[number]["wants"] };
  const plan = { ...start(), npc, inventory: ingredients("white-bread", "baked-beans", "bananas").map((entry) => ({ foodItemId: entry.foodItemId, currentPriceCents: 100, quantityAvailable: 2 })) };
  plan.roundStart = { ...plan, roundStart: null };
  const playing = fill(begin(plan));
  const won = gameReducer(playing, { type: "CHECKOUT" });
  assert.ok(won.recipe);
  assert.equal(won.score, calculateRoundScore(playing) + RECIPE_BONUS);
  assert.equal(won.totalScore, playing.totalScore + won.score);
  assert.equal(gameReducer(won, { type: "CHECKOUT" }), won);
  const retry = gameReducer(won, { type: "RETRY_ROUND" });
  assert.equal(retry.recipe, null);
  assert.equal(retry.score, 0);
  assert.equal(clear(retry).totalScore, won.totalScore);
  const final = gameReducer({ ...playing, roundNumber: FINAL_ROUND }, { type: "CHECKOUT" });
  assert.equal(final.status, "game_won");
  assert.ok(final.recipe);
  const lost = gameReducer({ ...playing, mode: "standard_run", timeRemainingSeconds: 1 }, { type: "TICK" });
  assert.equal(lost.recipe, null);
  assert.equal(lost.score, 0);
});
