import type { GameState, GameMode } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import {
  budgetMultiplierForRound,
  FINAL_ROUND,
  ROUND_TIMER_SECONDS,
  selectNPC,
} from "./progression";
import { generateSolvableRound } from "./solver";
import {
  applyAccessUpgrades,
  drawPowerUps,
  powerUpExtraBudgetCents,
  powerUpExtraSeconds,
} from "./powerups";
import { createRng } from "./seededRandom";
import { quantityRemaining } from "./roundEnd";
import { allRequirementsMet } from "./requirements";
import { calculateRoundScore, ratingForRound } from "./scoring";
import { mealRoles, MEAL_LABELS, usableFood } from "./meals";

export type GameAction =
  | {
      type: "START_RUN";
      seed: number;
      bestScore: number;
      highestRound: number;
      mode: GameMode;
    }
  | { type: "BEGIN_SHOPPING"; estimateCents: number | null }
  | { type: "RETRY_ROUND" }
  | { type: "ADD_ITEM"; foodItemId: string }
  | { type: "BULK_ADD"; foodItemId: string }
  | { type: "REMOVE_ITEM"; foodItemId: string }
  | { type: "CHECKOUT" }
  | { type: "CHOOSE_POWERUP"; powerUpId: PowerUpId }
  | { type: "USE_ESCAPE_ROPE" }
  | { type: "TICK" }
  | { type: "NEXT_ROUND" };

export const INITIAL_STATE: GameState = {
  status: "idle",
  mode: "learning",
  roundNumber: 1,
  successfulRounds: 0,
  budgetMultiplier: 1,
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
  bulkAddsUsed: [],
  score: 0,
  totalScore: 0,
  bestScore: 0,
  highestRound: 0,
  lastFeedback: null,
  roundHistory: [],
  seed: 0,
  estimateCents: null,
  previousAttempt: null,
  roundStart: null,
};
const roundSeed = (seed: number, round: number) => (seed + round * 7919) >>> 0;
function makeRound(state: GameState, roundNumber: number) {
  const seed = roundSeed(state.seed, roundNumber);
  const npc = applyAccessUpgrades(
    selectNPC(state.previousNPCIds, seed),
    state.powerUps,
  );
  const carry = state.powerUps.includes("embezzler")
    ? Math.max(0, Math.round(state.remainingBudgetCents / 2))
    : 0;
  const base =
    Math.round(npc.baseBudgetCents * budgetMultiplierForRound(roundNumber)) +
    powerUpExtraBudgetCents(state.powerUps) +
    carry;
  return {
    npc,
    ...generateSolvableRound(npc, base, seed, roundNumber, state.powerUps),
  };
}
export function previewNextBudgetCents(state: GameState): number {
  return makeRound(
    { ...state, previousNPCIds: [...state.previousNPCIds, state.npc!.id] },
    state.roundNumber + 1,
  ).budgetCents;
}
function setupRound(state: GameState, roundNumber: number): GameState {
  const { npc, inventory, budgetCents } = makeRound(state, roundNumber);
  const duration = ROUND_TIMER_SECONDS + powerUpExtraSeconds(state.powerUps);
  const next: GameState = {
    ...state,
    status: "planning",
    roundNumber,
    budgetMultiplier: budgetMultiplierForRound(roundNumber),
    npc,
    inventory,
    basket: [],
    bulkAddsUsed: [],
    roundBudgetCents: budgetCents,
    remainingBudgetCents: budgetCents,
    timeRemainingSeconds: duration,
    roundDurationSeconds: duration,
    endReason: undefined,
    score: 0,
    lastFeedback: null,
    estimateCents: null,
    previousAttempt: null,
    roundStart: null,
    powerUpChoices: null,
  };
  return { ...next, roundStart: next };
}
function winRound(state: GameState): GameState {
  const score = calculateRoundScore(state);
  const totalScore = state.totalScore + score;
  const final = state.roundNumber >= FINAL_ROUND;
  const excluded =
    state.mode === "learning"
      ? [...state.powerUps, "timewalker" as const]
      : state.powerUps;
  const choices = final
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
    powerUpChoices: choices.length ? choices : null,
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
        rating: ratingForRound(state),
      },
    ],
  };
}
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_RUN":
      return setupRound(
        {
          ...INITIAL_STATE,
          seed: action.seed,
          mode: action.mode,
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
        !["round_won", "game_won", "lost"].includes(state.status) ||
        !state.roundStart
      )
        return state;
      return {
        ...state.roundStart,
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
      if (!usableFood(food, state.npc)) return state;
      const exists = state.basket.some(
        (b) => b.foodItemId === action.foodItemId,
      );
      const basket = exists
        ? state.basket.map((b) =>
            b.foodItemId === action.foodItemId
              ? { ...b, quantity: b.quantity + 1 }
              : b,
          )
        : [
            ...state.basket,
            {
              foodItemId: action.foodItemId,
              quantity: 1,
              pricePaidCents: item.currentPriceCents,
            },
          ];
      const roles = mealRoles(food);
      return {
        ...state,
        basket,
        remainingBudgetCents:
          state.remainingBudgetCents - item.currentPriceCents,
        lastFeedback: roles.length
          ? `Added ${food.name}. Counts as ${roles.map((r) => MEAL_LABELS[r].toLowerCase()).join(" and ")}.`
          : `Added ${food.name} as an extra. Check your lunch list too.`,
      };
    }
    case "BULK_ADD": {
      if (
        state.status !== "playing" ||
        !state.powerUps.includes("bulk_buyer") ||
        state.bulkAddsUsed.includes(action.foodItemId) ||
        !state.basket.some((b) => b.foodItemId === action.foodItemId)
      )
        return state;
      const added = gameReducer(state, {
        type: "ADD_ITEM",
        foodItemId: action.foodItemId,
      });
      return added === state
        ? state
        : {
            ...added,
            bulkAddsUsed: [...state.bulkAddsUsed, action.foodItemId],
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
        timeRemainingSeconds: time,
        lastFeedback:
          "Item put back. What’s still on your checklist?",
        ...(time === 0 && state.mode === "standard_run"
          ? { status: "lost" as const, endReason: "timer_expired" as const }
          : {}),
      };
    }
    case "CHECKOUT":
      return state.status === "playing" &&
        state.npc &&
        state.remainingBudgetCents >= 0 &&
        allRequirementsMet(state.basket, state.npc)
        ? winRound(state)
        : state;
    case "CHOOSE_POWERUP":
      return state.status === "round_won" &&
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
      if (state.status !== "playing" || state.mode === "learning") return state;
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
