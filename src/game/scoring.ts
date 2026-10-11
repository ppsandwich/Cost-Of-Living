import type { GameMode } from "@/types/game";
export interface RoundScoreInput {
  remainingBudgetCents: number;
  timeRemainingSeconds: number;
  roundNumber: number;
  mode: GameMode;
}
export function roundScoreBreakdown(input: RoundScoreInput) {
  const briefScore = 100;
  const remainingBudgetBonus = Math.max(
    0,
    Math.round(input.remainingBudgetCents / 20),
  );
  const timeBonus =
    input.mode === "standard_run" ? Math.max(0, input.timeRemainingSeconds) : 0;
  const roundBonus = input.roundNumber * 25;
  return {
    briefScore,
    remainingBudgetBonus,
    timeBonus,
    roundBonus,
    total: briefScore + remainingBudgetBonus + timeBonus + roundBonus,
  };
}
export function calculateRoundScore(input: RoundScoreInput): number {
  return roundScoreBreakdown(input).total;
}
export function ratingForRound(input: RoundScoreInput): string {
  return input.remainingBudgetCents >= 300
    ? "Brief met, change kept"
    : "Lunch sorted";
}
export function ratingStars(): 3 {
  return 3;
}
