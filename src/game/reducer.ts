import type { GameState } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { PURCHASE_FEEDBACK, WARNING_FEEDBACK } from "@/data/flavourText";
import { computeImpact, violatesMustNot } from "./applyFoodItem";
import { basketFoods, calculateBasketStats, EMPTY_STATS } from "./calculateStats";
import {
  budgetMultiplierForRound,
  FINAL_ROUND,
  ROUND_TIMER_SECONDS,
  selectNPC,
} from "./progression";
import { generateSolvableRound } from "./solver";
import type { PowerUpId } from "@/data/powerups";
import {
  adjustThresholds,
  drawPowerUps,
  hasPowerUp,
  powerUpExtraBudgetCents,
  powerUpExtraSeconds,
  SHOPLIFTER_CHANCE,
} from "./powerups";
import { createRng } from "./seededRandom";
import { quantityRemaining } from "./roundEnd";
import { allRequirementsMet } from "./requirements";
import { calculateRoundScore, ratingForRound } from "./scoring";
import { fatalStat, warningStats } from "./thresholds";

export type GameAction =
  | { type: "START_RUN"; seed: number; bestScore: number; highestRound: number }
  | { type: "ADD_ITEM"; foodItemId: string }
  | { type: "BULK_ADD"; foodItemId: string }
  | { type: "REMOVE_ITEM"; foodItemId: string }
  | { type: "CHECKOUT" }
  | { type: "CHOOSE_POWERUP"; powerUpId: PowerUpId }
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
  roundDurationSeconds: ROUND_TIMER_SECONDS,
  previousNPCIds: [],
  powerUps: [],
  powerUpChoices: null,
  bulkAddsUsed: [],
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
  const seed = roundSeed(state.seed, roundNumber);
  const selected = selectNPC(previous, seed);
  const npc = {
    ...selected,
    maxThresholds: adjustThresholds(selected.maxThresholds, state.powerUps),
    mustNot: hasPowerUp(state.powerUps, "exposure_therapy")
      ? ("none" as const)
      : selected.mustNot,
  };
  const carryoverCents = hasPowerUp(state.powerUps, "embezzler")
    ? Math.max(0, Math.round(state.remainingBudgetCents / 2))
    : 0;
  const baseBudgetCents =
    Math.round(npc.baseBudgetCents * budgetMultiplierForRound(roundNumber)) +
    powerUpExtraBudgetCents(state.powerUps) +
    carryoverCents;
  return generateSolvableRound(npc, baseBudgetCents, seed, roundNumber, state.powerUps)
    .budgetCents;
}

function setupRound(state: GameState, roundNumber: number): GameState {
  const seed = roundSeed(state.seed, roundNumber);
  const budgetMultiplier = budgetMultiplierForRound(roundNumber);
  const selected = selectNPC(state.previousNPCIds, seed);
  // Power-ups that bend the rules live on an adjusted copy of the NPC
  const npc = {
    ...selected,
    maxThresholds: adjustThresholds(selected.maxThresholds, state.powerUps),
    mustNot: hasPowerUp(state.powerUps, "exposure_therapy")
      ? ("none" as const)
      : selected.mustNot,
  };
  // Embezzler: half of last round's surplus rolls forward
  const carryoverCents = hasPowerUp(state.powerUps, "embezzler")
    ? Math.max(0, Math.round(state.remainingBudgetCents / 2))
    : 0;
  const baseBudgetCents =
    Math.round(npc.baseBudgetCents * budgetMultiplier) +
    powerUpExtraBudgetCents(state.powerUps) +
    carryoverCents;
  // Every round is guaranteed to have at least one clearing combination
  const { inventory, budgetCents: roundBudgetCents } = generateSolvableRound(
    npc,
    baseBudgetCents,
    seed,
    roundNumber,
    state.powerUps
  );
  const roundDurationSeconds = ROUND_TIMER_SECONDS + powerUpExtraSeconds(state.powerUps);
  return {
    ...state,
    status: "playing",
    roundNumber,
    budgetMultiplier,
    npc,
    inventory,
    basket: [],
    bulkAddsUsed: [],
    stats: { ...EMPTY_STATS },
    roundBudgetCents,
    remainingBudgetCents: roundBudgetCents,
    timeRemainingSeconds: roundDurationSeconds,
    roundDurationSeconds,
    endReason: undefined,
    diedFromStat: undefined,
    score: 0,
    lastFeedback: null,
  };
}

/** Two random not-yet-owned power-ups to choose between after a win. */
function rollPowerUpChoices(state: GameState): PowerUpId[] | null {
  const rng = createRng((roundSeed(state.seed, state.roundNumber) ^ 0x9e3779b9) >>> 0);
  const choices = drawPowerUps(rng, state.powerUps, 2);
  return choices.length > 0 ? choices : null;
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
  const gameWon = state.roundNumber >= FINAL_ROUND;
  return {
    ...state,
    status: gameWon ? "game_won" : "round_won",
    endReason: "goals_met",
    powerUpChoices: gameWon ? null : rollPowerUpChoices(state),
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



function feedbackFor(state: GameState, foodItemId: string): string {
  const npc = state.npc!;
  const food = FOOD_BY_ID[foodItemId];
  const prior = basketFoods(state.basket).slice(0, -1);
  const shrinkflated = state.inventory.find((i) => i.foodItemId === foodItemId)?.shrinkflated;
  const impact = computeImpact(food, npc, prior, shrinkflated, state.powerUps);

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
      // Shoplifter: first add of an item each round may count double
      const luckyDouble =
        !existing &&
        hasPowerUp(state.powerUps, "shoplifter") &&
        createRng(
          (roundSeed(state.seed, state.roundNumber) ^
            [...action.foodItemId].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)) >>>
            0
        )() < SHOPLIFTER_CHANCE;
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
              luckyDouble,
            },
          ];

      const stats = calculateBasketStats(basket, state.npc, state.powerUps);
      // Training Wheels: the shelf refuses anything that would cross a limit
      if (
        hasPowerUp(state.powerUps, "training_wheels") &&
        fatalStat(stats, state.npc.maxThresholds)
      ) {
        return state;
      }
      const remainingBudgetCents = state.remainingBudgetCents - storeItem.currentPriceCents;
      // Overspending is allowed mid-round; checkout stays locked until
      // the basket is trimmed back within budget
      const next: GameState = { ...state, basket, stats, remainingBudgetCents };
      return { ...next, lastFeedback: feedbackFor(next, action.foodItemId) };
    }

    case "BULK_ADD": {
      // Bulk Buyer: one bonus add per item per round, from the card
      if (state.status !== "playing" || !state.npc) return state;
      if (!hasPowerUp(state.powerUps, "bulk_buyer")) return state;
      if (state.bulkAddsUsed.includes(action.foodItemId)) return state;
      if (!state.basket.some((b) => b.foodItemId === action.foodItemId)) return state;
      const added = gameReducer(state, { type: "ADD_ITEM", foodItemId: action.foodItemId });
      if (added === state) return state;
      return { ...added, bulkAddsUsed: [...state.bulkAddsUsed, action.foodItemId] };
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
      const stats = calculateBasketStats(basket, state.npc, state.powerUps);
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

    case "CHOOSE_POWERUP": {
      if (state.status !== "round_won" || !state.powerUpChoices) return state;
      if (!state.powerUpChoices.includes(action.powerUpId)) return state;
      return {
        ...state,
        powerUps: [...state.powerUps, action.powerUpId],
        powerUpChoices: null,
      };
    }

    case "TICK": {
      if (state.status !== "playing") return state;
      const timeRemainingSeconds = state.timeRemainingSeconds - 1;
      if (timeRemainingSeconds <= 0) {
        // No last-second checkout: when the clock dies, the round dies
        return loseRound({ ...state, timeRemainingSeconds: 0 }, "timer_expired");
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
