import type { NPC } from "./npc";
import type { PowerUpId } from "@/data/powerups";
export type GameMode = "standard_run" | "learning";
export type GameStatus =
  | "idle"
  | "planning"
  | "playing"
  | "round_won"
  | "game_won"
  | "lost";
export type EndReason = "goals_met" | "timer_expired";
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
export interface Attempt {
  basket: BasketItem[];
  spentCents: number;
  cleared: boolean;
  estimateCents: number | null;
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
  roundBudgetCents: number;
  remainingBudgetCents: number;
  timeRemainingSeconds: number;
  roundDurationSeconds: number;
  previousNPCIds: string[];
  powerUps: PowerUpId[];
  powerUpChoices: PowerUpId[] | null;
  bulkAddsUsed: string[];
  endReason?: EndReason;
  score: number;
  totalScore: number;
  bestScore: number;
  highestRound: number;
  lastFeedback: string | null;
  roundHistory: RoundResult[];
  seed: number;
  estimateCents: number | null;
  prediction: string;
  previousAttempt: Attempt | null;
  /** Immutable start of this shop; its own roundStart is null. */
  roundStart: GameState | null;
}
