import type { NPC, NutritionStats } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { warningStats } from "./thresholds";

export interface RoundScoreInput {
  stats: NutritionStats;
  npc: NPC;
  basket: BasketItem[];
  remainingBudgetCents: number;
  timeRemainingSeconds: number;
  roundNumber: number;
}

export function calculateRoundScore(input: RoundScoreInput): number {
  const { stats, npc, basket, remainingBudgetCents, timeRemainingSeconds, roundNumber } = input;

  const nutritionScore = Math.round(Math.min(stats.nutrition, npc.nutritionTarget * 1.5));
  const happinessScore = Math.round(Math.min(stats.happiness, npc.happinessTarget * 1.5));
  const remainingBudgetBonus = Math.round(remainingBudgetCents / 20);
  const timeBonus = Math.round(timeRemainingSeconds);
  const categories = new Set(
    basket.map((b) => FOOD_BY_ID[b.foodItemId]?.category).filter(Boolean)
  );
  const varietyBonus = categories.size * 8;
  const roundBonus = roundNumber * 25;
  const dangerPenalty = warningStats(stats, npc.maxThresholds).length * 15;

  return Math.max(
    0,
    nutritionScore +
      happinessScore +
      remainingBudgetBonus +
      timeBonus +
      varietyBonus +
      roundBonus -
      dangerPenalty
  );
}

export function ratingForRound(input: RoundScoreInput): string {
  const { stats, npc, remainingBudgetCents } = input;
  const nutritionRatio = stats.nutrition / npc.nutritionTarget;
  const happinessRatio = stats.happiness / npc.happinessTarget;
  const budgetEfficiency = remainingBudgetCents / Math.max(1, input.roundNumber);

  if (nutritionRatio >= 1.3 && happinessRatio >= 1.3) return "Supermarket Tactician";
  if (nutritionRatio < 1.1 && happinessRatio < 1.1) return "Barely Fed";
  if (remainingBudgetCents >= 500 && budgetEfficiency > 0) return "Budget Wizard";
  if (happinessRatio >= 1.3 && nutritionRatio < 1.15) return "Treat Goblin Economist";
  if (nutritionRatio >= 1.3 && happinessRatio < 1.15) return "Lentil Diplomat";
  return "Actually Balanced";
}
