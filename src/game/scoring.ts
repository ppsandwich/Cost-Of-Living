import type { RecipeMatch } from "@/types/recipe";
import { RECIPE_BONUS } from "./recipes";
import type { GameMode } from "@/types/game";
export interface RoundScoreInput {
  remainingBudgetCents: number;
  timeRemainingSeconds: number;
  roundNumber: number;
  mode: GameMode;
  recipe?: RecipeMatch | null;
}
export function roundScoreBreakdown(input: RoundScoreInput) {
  const briefScore = 100;
  const remainingBudgetBonus = Math.max(
    0,
    Math.round(input.remainingBudgetCents / 20),
  );
  const timeBonus =
    input.mode === "standard_run" ? Math.max(0, input.timeRemainingSeconds) : 0;
  const recipeBonus = input.recipe ? RECIPE_BONUS : 0;
  const roundBonus = input.roundNumber * 25;
  return {
    briefScore,
    remainingBudgetBonus,
    timeBonus,
    roundBonus,
    recipeBonus,
    total: briefScore + remainingBudgetBonus + timeBonus + roundBonus + recipeBonus,
  };
}
export function calculateRoundScore(input: RoundScoreInput): number {
  return roundScoreBreakdown(input).total;
}
export function ratingForRound(input: RoundScoreInput): string {
  return input.remainingBudgetCents >= 300
    ? "Lunch sorted, money saved"
    : "Lunch sorted";
}
export function ratingStars(): 3 {
  return 3;
}
