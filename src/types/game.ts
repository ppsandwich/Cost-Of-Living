import type { TasteAssessment } from "@/game/taste";
import type { RecipeMatch } from "./recipe";
import type { NPC } from "./npc";
import type { PowerUpId } from "@/data/powerups";
import type { MealRole } from "@/game/meals";
import type { FoodPreference } from "./npc";
export interface BasketEvent {
  id: number;
  kind: "add" | "remove";
  foodItemId: string;
  cents: number;
  newRoles: MealRole[];
  newWant: FoodPreference | null;
}
export interface RetryChallenge {
  baselineSpendCents: number;
  targetSpendCents: number;
  savingCents: number;
}
export type Difficulty = 1 | 2 | 3;
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
  /** Same shelf price before earned discounts, used to calibrate the difficulty curve. */
  referencePriceCents?: number;
  quantityAvailable: number;
  specialLabel?: string;
  onSale?: boolean;
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
  difficulty: Difficulty;
  powerUpsEnabled: boolean;
  allowRetries: boolean;
  solution: BasketItem[];
  baseBudgetCents: number;
  basketReviewOpen: boolean;
  roundNumber: number;
  successfulRounds: number;
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
  endReason?: EndReason;
  recipe: RecipeMatch | null;
  taste: TasteAssessment | null;
  score: number;
  totalScore: number;
  bestScore: number;
  highestRound: number;
  lastFeedback: string | null;
  basketEvent: BasketEvent | null;
  retryChallenge: RetryChallenge | null;
  roundHistory: RoundResult[];
  seed: number;
  estimateCents: number | null;
  previousAttempt: Attempt | null;
  /** Immutable start of this shop; its own roundStart is null. */
  roundStart: GameState | null;
}
