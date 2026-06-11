import type { GameState } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { PURCHASE_FEEDBACK, WARNING_FEEDBACK } from "@/data/flavourText";
import { computeImpact, violatesMustNot } from "./applyFoodItem";
import { basketFoods, calculateBasketStats, EMPTY_STATS } from "./calculateStats";
import { generateInventory } from "./generateInventory";
import { budgetMultiplierForRound, ROUND_TIMER_SECONDS, selectNPC } from "./progression";
import { quantityRemaining } from "./roundEnd";
import { allRequirementsMet } from "./requirements";
import { calculateRoundScore, ratingForRound } from "./scoring";
import { fatalStat, warningStats } from "./thresholds";

export type GameAction =
  | { type: "START_RUN"; seed: number; bestScore: number; highestRound: number }
  | { type: "ADD_ITEM"; foodItemId: string }
  | { type: "REMOVE_ITEM"; foodItemId: string }
  | { type: "CHECKOUT" }
  | { type: "TICK" }
  | { type: "NEXT_ROUND" };

export const INITIAL_STATE: GameState = {
  status: "idle",
  mode: "standard_run",
  roundNumber: 1,
  successfulRounds: 0,
  budgetMultiplier: 1,
  npc: null,
  inventory: [],
  basket: [],
  stats: { ...EMPTY_STATS },
  roundBudgetCents: 0,
  remainingBudgetCents: 0,
  timeRemainingSeconds: ROUND_TIMER_SECONDS,
  previousNPCIds: [],
  score: 0,
  totalScore: 0,
  bestScore: 0,
  highestRound: 0,
  lastFeedback: null,
  roundHistory: [],
  seed: 0,
};

function roundSeed(baseSeed: number, roundNumber: number): number {
  return (baseSeed + roundNumber * 7919) >>> 0;
}

/** The budget the next round will open with — mirrors setupRound exactly. */
export function previewNextBudgetCents(state: GameState): number {
  const roundNumber = state.roundNumber + 1;
  const previous = state.npc ? [...state.previousNPCIds, state.npc.id] : state.previousNPCIds;
  const npc = selectNPC(previous, roundSeed(state.seed, roundNumber));
  return Math.round(npc.baseBudgetCents * budgetMultiplierForRound(roundNumber));
}

function setupRound(state: GameState, roundNumber: number): GameState {
  const seed = roundSeed(state.seed, roundNumber);
  const budgetMultiplier = budgetMultiplierForRound(roundNumber);
  const npc = selectNPC(state.previousNPCIds, seed);
  const roundBudgetCents = Math.round(npc.baseBudgetCents * budgetMultiplier);
  return {
    ...state,
    status: "playing",
    roundNumber,
    budgetMultiplier,
    npc,
    inventory: generateInventory(npc, roundBudgetCents, seed, roundNumber),
    basket: [],
    stats: { ...EMPTY_STATS },
    roundBudgetCents,
    remainingBudgetCents: roundBudgetCents,
    timeRemainingSeconds: ROUND_TIMER_SECONDS,
    endReason: undefined,
    diedFromStat: undefined,
    score: 0,
    lastFeedback: null,
  };
}

function winRound(state: GameState): GameState {
  const npc = state.npc!;
  const scoreInput = {
    stats: state.stats,
    npc,
    basket: state.basket,
    remainingBudgetCents: state.remainingBudgetCents,
    timeRemainingSeconds: state.timeRemainingSeconds,
    roundNumber: state.roundNumber,
  };
  const score = calculateRoundScore(scoreInput);
  const totalScore = state.totalScore + score;
  return {
    ...state,
    status: "round_won",
    endReason: "goals_met",
    score,
    totalScore,
    successfulRounds: state.successfulRounds + 1,
    bestScore: Math.max(state.bestScore, totalScore),
    highestRound: Math.max(state.highestRound, state.roundNumber),
    roundHistory: [
      ...state.roundHistory,
      {
        roundNumber: state.roundNumber,
        npcName: npc.name,
        score,
        rating: ratingForRound(scoreInput),
      },
    ],
  };
}

function loseRound(state: GameState, endReason: "timer_expired"): GameState {
  return {
    ...state,
    status: "lost",
    endReason,
    bestScore: Math.max(state.bestScore, state.totalScore),
  };
}

/**
 * Settle the round: death first if any threshold is exceeded, then a win
 * if every requirement is met, otherwise the given loss reason.
 */
function evaluateRound(state: GameState, failReason: "timer_expired"): GameState {
  const npc = state.npc!;
  const fatal = fatalStat(state.stats, npc.maxThresholds);
  if (fatal) {
    return {
      ...state,
      status: "lost",
      endReason: "npc_died",
      diedFromStat: fatal,
      bestScore: Math.max(state.bestScore, state.totalScore),
    };
  }
  if (state.remainingBudgetCents >= 0 && allRequirementsMet(state.stats, state.basket, npc)) {
    return winRound(state);
  }
  return loseRound(state, failReason);
}

function feedbackFor(state: GameState, foodItemId: string): string {
  const npc = state.npc!;
  const food = FOOD_BY_ID[foodItemId];
  const prior = basketFoods(state.basket).slice(0, -1);
  const shrinkflated = state.inventory.find((i) => i.foodItemId === foodItemId)?.shrinkflated;
  const impact = computeImpact(food, npc, prior, shrinkflated);

  const warnings = warningStats(state.stats, npc.maxThresholds);
  if (warnings.length > 0) return WARNING_FEEDBACK[warnings[0]];

  const pool = impact.mustNotViolation
    ? PURCHASE_FEEDBACK.restriction
    : impact.equipmentMismatch
      ? PURCHASE_FEEDBACK.equipmentMismatch
      : impact.repetitionApplied
        ? PURCHASE_FEEDBACK.repetition
        : impact.nutritionGain >= 14 && impact.happinessGain >= 10
          ? PURCHASE_FEEDBACK.balanced
          : impact.nutritionGain >= 14
            ? PURCHASE_FEEDBACK.nutritious
            : impact.happinessGain >= 10
              ? PURCHASE_FEEDBACK.happy
              : PURCHASE_FEEDBACK.junk;
  const index = (basketFoods(state.basket).length + foodItemId.length) % pool.length;
  return pool[index];
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_RUN": {
      const fresh: GameState = {
        ...INITIAL_STATE,
        seed: action.seed,
        bestScore: action.bestScore,
        highestRound: action.highestRound,
      };
      return setupRound(fresh, 1);
    }

    case "ADD_ITEM": {
      if (state.status !== "playing" || !state.npc) return state;
      const storeItem = state.inventory.find((i) => i.foodItemId === action.foodItemId);
      if (!storeItem) return state;
      if (quantityRemaining(storeItem, state.basket) <= 0) return state;
      // Forbidden items are display-only: the till refuses them
      if (violatesMustNot(FOOD_BY_ID[action.foodItemId], state.npc)) return state;

      const existing = state.basket.find((b) => b.foodItemId === action.foodItemId);
      const basket = existing
        ? state.basket.map((b) =>
            b.foodItemId === action.foodItemId ? { ...b, quantity: b.quantity + 1 } : b
          )
        : [
            ...state.basket,
            {
              foodItemId: action.foodItemId,
              quantity: 1,
              pricePaidCents: storeItem.currentPriceCents,
              shrinkflated: storeItem.shrinkflated,
            },
          ];

      const stats = calculateBasketStats(basket, state.npc);
      const remainingBudgetCents = state.remainingBudgetCents - storeItem.currentPriceCents;
      // Overspending is allowed mid-round; checkout stays locked until
      // the basket is trimmed back within budget
      const next: GameState = { ...state, basket, stats, remainingBudgetCents };
      return { ...next, lastFeedback: feedbackFor(next, action.foodItemId) };
    }

    case "REMOVE_ITEM": {
      if (state.status !== "playing" || !state.npc) return state;
      const existing = state.basket.find((b) => b.foodItemId === action.foodItemId);
      if (!existing) return state;
      const basket =
        existing.quantity > 1
          ? state.basket.map((b) =>
              b.foodItemId === action.foodItemId ? { ...b, quantity: b.quantity - 1 } : b
            )
          : state.basket.filter((b) => b.foodItemId !== action.foodItemId);
      const stats = calculateBasketStats(basket, state.npc);
      return {
        ...state,
        basket,
        stats,
        remainingBudgetCents: state.remainingBudgetCents + existing.pricePaidCents,
        lastFeedback: null,
      };
    }

    case "CHECKOUT": {
      if (state.status !== "playing" || !state.npc) return state;
      // The till only opens when every objective is met and the money adds up
      if (
        state.remainingBudgetCents < 0 ||
        fatalStat(state.stats, state.npc.maxThresholds) ||
        !allRequirementsMet(state.stats, state.basket, state.npc)
      ) {
        return state;
      }
      return winRound(state);
    }

    case "TICK": {
      if (state.status !== "playing") return state;
      const timeRemainingSeconds = state.timeRemainingSeconds - 1;
      if (timeRemainingSeconds <= 0) {
        return evaluateRound({ ...state, timeRemainingSeconds: 0 }, "timer_expired");
      }
      return { ...state, timeRemainingSeconds };
    }

    case "NEXT_ROUND": {
      if (state.status !== "round_won" || !state.npc) return state;
      return setupRound(
        { ...state, previousNPCIds: [...state.previousNPCIds, state.npc.id] },
        state.roundNumber + 1
      );
    }

    default:
      return state;
  }
}
