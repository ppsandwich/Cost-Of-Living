import { assessTaste } from "./taste";
import { findRecipe } from "./recipes";
import type { GameState, GameMode, Difficulty } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import {
  budgetHeadroomForRound,
  npcForRound,
  FINAL_ROUND,
  ROUND_TIMER_SECONDS,
  selectNPC,
} from "./progression";
import { generateSolvableRound, basketCost } from "./solver";
import {
  drawPowerUps,
  powerUpExtraBudgetCents,
  powerUpExtraSeconds,
} from "./powerups";
import { createRng } from "./seededRandom";
import { quantityRemaining } from "./roundEnd";
import { allRequirementsMet, getRequirementsStatus } from "./requirements";
import { calculateRoundScore, ratingForRound } from "./scoring";
import { mealRoles, MEAL_LABELS, usableFood, mealCoverage, MEAL_ROLES } from "./meals";

import { POWER_UP_STOPS } from "./shops";
import { findSaving } from "./feedback";

export type GameAction =
  | {
      type: "START_RUN";
      seed: number;
      bestScore: number;
      highestRound: number;
      mode: GameMode;
      difficulty?: Difficulty;
      powerUpsEnabled?: boolean;
      allowRetries?: boolean;
    }
  | { type: "RESET_RUN" }
  | { type: "BEGIN_SHOPPING"; estimateCents: number | null }
  | { type: "RETRY_ROUND"; challenge?: boolean }
  | { type: "ADD_ITEM"; foodItemId: string }
  | { type: "REMOVE_ITEM"; foodItemId: string }
  | { type: "CHECKOUT" }
  | { type: "OPEN_BASKET" }
  | { type: "CLOSE_BASKET" }
  | { type: "CHOOSE_POWERUP"; powerUpId: PowerUpId }
  | { type: "USE_ESCAPE_ROPE" }
  | { type: "TICK" }
  | { type: "NEXT_ROUND" };

export const INITIAL_STATE: GameState = {
  status: "idle",
  mode: "learning",
  difficulty: 2,
  powerUpsEnabled: true,
  allowRetries: false,
  solution: [],
  baseBudgetCents: 0,
  basketReviewOpen: false,
  roundNumber: 1,
  successfulRounds: 0,
  npc: null,
  inventory: [],
  basket: [],
  roundBudgetCents: 0,
  remainingBudgetCents: 0,
  timeRemainingSeconds: ROUND_TIMER_SECONDS,
  roundDurationSeconds: ROUND_TIMER_SECONDS,
  previousNPCIds: [],
  powerUps: [],
  powerUpChoices: null,
  recipe: null,
  taste: null,
  score: 0,
  totalScore: 0,
  bestScore: 0,
  highestRound: 0,
  lastFeedback: null,
  basketEvent: null,
  retryChallenge: null,
  roundHistory: [],
  seed: 0,
  estimateCents: null,
  previousAttempt: null,
  roundStart: null,
};
const roundSeed = (seed: number, round: number) => (seed + round * 7919) >>> 0;
function makeRound(state: GameState, roundNumber: number) {
  const seed = roundSeed(state.seed, roundNumber);
  const npc = npcForRound(selectNPC(state.previousNPCIds, seed), roundNumber);
  const carry = state.powerUps.includes("embezzler")
    ? Math.max(0, Math.round(state.remainingBudgetCents / 2))
    : 0;
  // Calibrate against the same shelves before discounts, then add earned budget boosts.
  const round = generateSolvableRound(npc, npc.baseBudgetCents, seed, roundNumber, state.powerUps);
  const baseBudgetCents = Math.floor(round.referenceCostCents * budgetHeadroomForRound(roundNumber, state.difficulty));
  const requestedBudget = baseBudgetCents + powerUpExtraBudgetCents(state.powerUps) + carry;
  const required = basketCost(round.solution);
  // Keep a new customer or earned boost from reversing the spending challenge.
  // Compare actual budget / minimum cost, so different shelf prices are comparable.
  const previousRoom = state.solution.length ? state.roundBudgetCents / basketCost(state.solution) : Infinity;
  const difficultyLimit = Math.floor(required * Math.max(1, previousRoom - 0.025));
  const budgetCents = Math.max(required, Math.min(requestedBudget, difficultyLimit));
  const inventory = round.inventory.map((item) => ({ ...item, specialLabel: item.onSale ? "On sale" : item.currentPriceCents > budgetCents ? "Costs more than your budget" : undefined }));
  return { npc, ...round, inventory, baseBudgetCents, budgetCents };
}
export function previewNextBudgetCents(state: GameState): number {
  return makeRound(
    { ...state, previousNPCIds: [...state.previousNPCIds, state.npc!.id] },
    state.roundNumber + 1,
  ).budgetCents;
}
function setupRound(state: GameState, roundNumber: number): GameState {
  const { npc, inventory, budgetCents, baseBudgetCents, solution } = makeRound(state, roundNumber);
  const duration = ROUND_TIMER_SECONDS + powerUpExtraSeconds(state.powerUps);
  const next: GameState = {
    ...state,
    status: "planning",
    basketReviewOpen: false,
    roundNumber,
    npc,
    inventory,
    basket: [],
    roundBudgetCents: budgetCents,
    baseBudgetCents,
    solution,
    remainingBudgetCents: budgetCents,
    timeRemainingSeconds: duration,
    roundDurationSeconds: duration,
    endReason: undefined,
    recipe: null,
    taste: null,
    score: 0,
    lastFeedback: null,
    basketEvent: null,
    retryChallenge: null,
    estimateCents: null,
    previousAttempt: null,
    roundStart: null,
    powerUpChoices: null,
  };
  return { ...next, roundStart: next };
}
function winRound(state: GameState): GameState {
  const taste = assessTaste(state.basket, state.npc!);
  const recipe = taste.quality === "dubious" ? null : taste.recipe ?? findRecipe(state.basket, state.npc!);
  const score = calculateRoundScore({ ...state, recipe, taste });
  const totalScore = state.totalScore + score;
  const final = state.roundNumber >= FINAL_ROUND;
  const excluded =
    state.mode === "learning"
      ? [...state.powerUps, "timewalker" as const]
      : state.powerUps;
  const choices = !state.powerUpsEnabled || final || !POWER_UP_STOPS.includes(state.roundNumber)
    ? []
    : drawPowerUps(
        createRng(
          (roundSeed(state.seed, state.roundNumber) ^ 0x9e3779b9) >>> 0,
        ),
        excluded,
        2,
      );
  return {
    ...state,
    status: final ? "game_won" : "round_won",
    endReason: "goals_met",
    basketReviewOpen: false,
    powerUpChoices: choices.length ? choices : null,
    recipe,
    taste,
    score,
    totalScore,
    successfulRounds: state.successfulRounds + 1,
    bestScore: Math.max(state.bestScore, totalScore),
    highestRound: Math.max(state.highestRound, state.successfulRounds + 1),
    roundHistory: [
      ...state.roundHistory,
      {
        roundNumber: state.roundNumber,
        npcName: state.npc!.name,
        score,
        rating: ratingForRound({ ...state, recipe, taste }),
      },
    ],
  };
}
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "RESET_RUN":
      return { ...INITIAL_STATE };
    case "START_RUN":
      return setupRound(
        {
          ...INITIAL_STATE,
          seed: action.seed,
          mode: action.mode,
          difficulty: action.difficulty ?? 2,
          powerUpsEnabled: action.powerUpsEnabled ?? true,
          allowRetries: action.allowRetries ?? false,
          bestScore: action.bestScore,
          highestRound: action.highestRound,
        },
        1,
      );
    case "BEGIN_SHOPPING": {
      if (state.status !== "planning") return state;
      if (
        action.estimateCents !== null &&
        (!Number.isSafeInteger(action.estimateCents) ||
          action.estimateCents < 0)
      )
        return state;
      return {
        ...state,
        status: "playing",
        estimateCents: action.estimateCents,
      };
    }
    case "RETRY_ROUND": {
      if (
        !state.allowRetries ||
        !["round_won", "game_won", "lost"].includes(state.status) ||
        !state.roundStart
      )
        return state;
      const saving = action.challenge && state.endReason === "goals_met" ? findSaving(state) : null;
      const spent = state.roundBudgetCents - state.remainingBudgetCents;
      return {
        ...state.roundStart,
        retryChallenge: saving ? { baselineSpendCents: spent, targetSpendCents: spent - saving.savings, savingCents: saving.savings } : null,
        roundStart: state.roundStart,
        bestScore: state.bestScore,
        highestRound: state.highestRound,
        previousAttempt: {
          basket: state.basket,
          spentCents: state.roundBudgetCents - state.remainingBudgetCents,
          cleared: state.endReason === "goals_met",
          estimateCents: state.estimateCents,
        },
      };
    }
    case "ADD_ITEM": {
      if (state.status !== "playing" || !state.npc) return state;
      const item = state.inventory.find(
        (i) => i.foodItemId === action.foodItemId,
      );
      if (!item || quantityRemaining(item, state.basket) <= 0) return state;
      const food = FOOD_BY_ID[action.foodItemId];
      const basket = [...state.basket, {
        foodItemId: action.foodItemId,
        quantity: 1,
        pricePaidCents: item.currentPriceCents,
      }];
      const roles = mealRoles(food);
      const before = mealCoverage(state.basket, state.npc);
      const after = mealCoverage(basket, state.npc);
      const oldWants = getRequirementsStatus(state.basket, state.npc).wants;
      const newWant = getRequirementsStatus(basket, state.npc).wants.find((w, i) => w.satisfied && !oldWants[i].satisfied)?.want ?? null;
      return {
        ...state,
        basket,
        basketEvent: { id: (state.basketEvent?.id ?? 0) + 1, kind: "add", foodItemId: food.id, cents: item.currentPriceCents, newRoles: MEAL_ROLES.filter((role) => !before[role] && after[role]), newWant },
        remainingBudgetCents:
          state.remainingBudgetCents - item.currentPriceCents,
        lastFeedback: !usableFood(food, state.npc)
          ? `Remove ${food.name}: this customer needs to avoid it.`
          : roles.length
          ? `Added ${food.name}. Counts as ${roles.map((r) => (r === "produce" ? "one fruit or veg item" : MEAL_LABELS[r].toLowerCase())).join(" and ")}.`
          : `Added ${food.name} as an extra. Check your lunch list too.`,
      };
    }
    case "REMOVE_ITEM": {
      if (state.status !== "playing") return state;
      const entry = state.basket.find(
        (b) => b.foodItemId === action.foodItemId,
      );
      if (!entry) return state;
      const basket =
        entry.quantity > 1
          ? state.basket.map((b) =>
              b.foodItemId === entry.foodItemId
                ? { ...b, quantity: b.quantity - 1 }
                : b,
            )
          : state.basket.filter((b) => b.foodItemId !== entry.foodItemId);
      const time = Math.max(
        0,
        state.timeRemainingSeconds - (state.mode === "standard_run" ? 3 : 0),
      );
      return {
        ...state,
        basket,
        remainingBudgetCents: state.remainingBudgetCents + entry.pricePaidCents,
        basketEvent: { id: (state.basketEvent?.id ?? 0) + 1, kind: "remove", foodItemId: entry.foodItemId, cents: entry.pricePaidCents, newRoles: [], newWant: null },
        timeRemainingSeconds: time,
        lastFeedback:
          "Item put back. What’s still on your checklist?",
        ...(time === 0 && state.mode === "standard_run"
          ? { status: "lost" as const, endReason: "timer_expired" as const }
          : {}),
      };
    }
    case "OPEN_BASKET":
      return state.status === "playing" && state.npc && state.remainingBudgetCents >= 0 && allRequirementsMet(state.basket, state.npc)
        ? { ...state, basketReviewOpen: true } : state;
    case "CLOSE_BASKET":
      return state.basketReviewOpen ? { ...state, basketReviewOpen: false } : state;
    case "CHECKOUT":
      return state.status === "playing" &&
        state.npc &&
        state.remainingBudgetCents >= 0 &&
        allRequirementsMet(state.basket, state.npc)
        ? winRound(state)
        : state;
    case "CHOOSE_POWERUP":
      return state.status === "round_won" && state.powerUpsEnabled &&
        state.powerUpChoices?.includes(action.powerUpId)
        ? {
            ...state,
            powerUps: [...state.powerUps, action.powerUpId],
            powerUpChoices: null,
          }
        : state;
    case "USE_ESCAPE_ROPE": {
      if (
        state.status !== "playing" ||
        !state.npc ||
        !state.powerUps.includes("escape_rope") ||
        state.roundNumber >= FINAL_ROUND
      )
        return state;
      return setupRound(
        {
          ...state,
          powerUps: state.powerUps.filter((p) => p !== "escape_rope"),
          previousNPCIds: [...state.previousNPCIds, state.npc.id],
        },
        state.roundNumber + 1,
      );
    }
    case "TICK": {
      if (state.status !== "playing" || state.mode === "learning" || state.basketReviewOpen) return state;
      const time = Math.max(0, state.timeRemainingSeconds - 1);
      return {
        ...state,
        timeRemainingSeconds: time,
        ...(time === 0
          ? { status: "lost" as const, endReason: "timer_expired" as const }
          : {}),
      };
    }
    case "NEXT_ROUND":
      return state.status === "round_won" && state.npc && !state.powerUpChoices
        ? setupRound(
            {
              ...state,
              previousNPCIds: [...state.previousNPCIds, state.npc.id],
            },
            state.roundNumber + 1,
          )
        : state;
    default:
      return state;
  }
}
