import { tastePoints, TASTY_MEAL_BONUS, DUBIOUS_FOOD_PENALTY, type TasteAssessment } from "./taste";
import type { RecipeMatch } from "@/types/recipe";
import { RECIPE_BONUS } from "./recipes";
import type { GameMode } from "@/types/game";
export interface RoundScoreInput {
  remainingBudgetCents: number;
  timeRemainingSeconds: number;
  roundNumber: number;
  mode: GameMode;
  recipe?: RecipeMatch | null;
  taste?: TasteAssessment | null;
}
export function roundScoreBreakdown(input: RoundScoreInput) {
  const briefScore = 100;
  const remainingBudgetBonus = Math.max(
    0,
    Math.round(input.remainingBudgetCents / 20),
  );
  const timeBonus =
    input.mode === "standard_run" ? Math.max(0, input.timeRemainingSeconds) : 0;
  const recipeBonus = input.recipe && input.taste?.quality !== "dubious" ? RECIPE_BONUS : 0;
  const tastyMealBonus = input.taste?.quality === "tasty" ? TASTY_MEAL_BONUS : 0;
  const dubiousFoodPenalty = input.taste?.quality === "dubious" ? DUBIOUS_FOOD_PENALTY : 0;
  const roundBonus = input.roundNumber * 25;
  return {
    briefScore,
    remainingBudgetBonus,
    timeBonus,
    roundBonus,
    recipeBonus,
    tastyMealBonus,
    dubiousFoodPenalty,
    total: briefScore + remainingBudgetBonus + timeBonus + roundBonus + recipeBonus + tastePoints(input.taste),
  };
}
export function calculateRoundScore(input: RoundScoreInput): number {
  return roundScoreBreakdown(input).total;
}
export function ratingForRound(input: RoundScoreInput): string {
  if (input.taste?.quality === "dubious") return "Lunch sorted · Dubious food";
  if (input.taste?.quality === "tasty") return "Tasty meal!";
  return input.remainingBudgetCents >= 300
    ? "Lunch sorted, money saved"
    : "Lunch sorted";
}
export function ratingStars(): 3 {
  return 3;
}
