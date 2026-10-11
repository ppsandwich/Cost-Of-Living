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
import { improvementTip, missingRequirements } from "../src/game/feedback";
import { applyAccessUpgrades } from "../src/game/powerups";
import { calculateRoundScore } from "../src/game/scoring";
import { POWER_UPS } from "../src/data/powerups";
import { NPCS } from "../src/data/npcs";
import { FOOD_BY_ID } from "../src/data/foodItems";
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

test("every upgrade preserves dietary boundaries and equipment access changes usability", () => {
  const upgrades = POWER_UPS.map((p) => p.id);
  for (const npc of NPCS) {
    const upgraded = applyAccessUpgrades(npc, upgrades);
    assert.equal(upgraded.mustNot, npc.mustNot);
    assert.deepEqual(upgraded.wants, npc.wants);
  }
  const npc = {
    ...NPCS[0],
    mustNot: "vegetarian" as const,
    restrictions: ["no_fridge" as const, "limited_cooking_equipment" as const],
  };
  assert.equal(usableFood(FOOD_BY_ID.tofu, npc), false);
  assert.equal(
    usableFood(FOOD_BY_ID.tofu, applyAccessUpgrades(npc, ["fridge"])),
    true,
  );
  assert.equal(
    usableFood(
      FOOD_BY_ID["chicken-thighs"],
      applyAccessUpgrades(npc, upgrades),
    ),
    false,
  );
  assert.equal(
    usableFood(
      FOOD_BY_ID["frozen-pizza"],
      applyAccessUpgrades(npc, ["shared_kitchen"]),
    ),
    false,
  );
  assert.equal(
    usableFood(
      FOOD_BY_ID["frozen-pizza"],
      applyAccessUpgrades(npc, ["shared_kitchen", "fridge"]),
    ),
    true,
  );
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
