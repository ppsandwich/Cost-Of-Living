import type { NPC, NutritionStats } from "./npc";

export type GameMode = "standard_run";

export type GameStatus = "idle" | "playing" | "round_won" | "lost";

export type EndReason =
  | "submitted_success"
  | "submitted_failed"
  | "timer_expired"
  | "out_of_money"
  | "npc_died";

export interface StoreItem {
  foodItemId: string;
  currentPriceCents: number;
  quantityAvailable: number;
  specialLabel?: string;
}

export interface BasketItem {
  foodItemId: string;
  quantity: number;
  pricePaidCents: number;
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
  previousNPCIds: string[];
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
