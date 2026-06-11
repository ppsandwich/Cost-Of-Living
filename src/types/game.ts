import type { NPC, NutritionStats } from "./npc";
import type { PowerUpId } from "@/data/powerups";

export type GameMode = "standard_run";

export type GameStatus = "idle" | "playing" | "round_won" | "lost";

export type EndReason =
  | "goals_met"
  | "submitted_failed"
  | "timer_expired"
  | "out_of_money"
  | "npc_died";

export interface StoreItem {
  foodItemId: string;
  currentPriceCents: number;
  quantityAvailable: number;
  specialLabel?: string;
  /** Same price, half the nutrition and happiness. */
  shrinkflated?: boolean;
}

export interface BasketItem {
  foodItemId: string;
  quantity: number;
  pricePaidCents: number;
  /** Carried over from the store item at purchase time. */
  shrinkflated?: boolean;
  /** Shoplifter power-up: this entry counts double. */
  luckyDouble?: boolean;
}

export interface RoundResult {
  roundNumber: number;
  npcName: string;
  score: number;
  rating: string;
}

export interface GameState {
  status: GameStatus;
  mode: GameMode;
  roundNumber: number;
  successfulRounds: number;
  budgetMultiplier: number;
  npc: NPC | null;
  inventory: StoreItem[];
  basket: BasketItem[];
  stats: NutritionStats;
  roundBudgetCents: number;
  remainingBudgetCents: number;
  timeRemainingSeconds: number;
  /** Full length of the current round, power-ups included. */
  roundDurationSeconds: number;
  previousNPCIds: string[];
  /** Power-ups collected this run. */
  powerUps: PowerUpId[];
  /** Pending pick-one-of-two offer after a round win. */
  powerUpChoices: PowerUpId[] | null;
  /** Items that already used Bulk Buyer's "One more" this round. */
  bulkAddsUsed: string[];
  endReason?: EndReason;
  diedFromStat?: string;
  score: number;
  totalScore: number;
  bestScore: number;
  highestRound: number;
  lastFeedback: string | null;
  roundHistory: RoundResult[];
  seed: number;
}
