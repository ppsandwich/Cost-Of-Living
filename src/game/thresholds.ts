import type { FoodItem } from "@/types/food";
import type { DangerThresholds, NutritionStats } from "@/types/npc";
import type { PowerUpId } from "@/data/powerups";
import { zeroedMacros } from "./powerups";

export type DangerStat = "calories" | "fat" | "sugar" | "carbs" | "sodium";

export const DANGER_STATS: DangerStat[] = ["calories", "fat", "sugar", "carbs", "sodium"];

const THRESHOLD_KEY: Record<DangerStat, keyof DangerThresholds> = {
  calories: "caloriesMax",
  fat: "fatMax",
  sugar: "sugarMax",
  carbs: "carbsMax",
  sodium: "sodiumMax",
};

export function dangerRatio(
  stats: NutritionStats,
  thresholds: DangerThresholds,
  stat: DangerStat
): number {
  const max = thresholds[THRESHOLD_KEY[stat]];
  if (!max) return 0;
  return stats[stat] / max;
}

/** Returns the first stat at or over its fatal threshold, or null. */
export function fatalStat(stats: NutritionStats, thresholds: DangerThresholds): DangerStat | null {
  for (const stat of DANGER_STATS) {
    if (dangerRatio(stats, thresholds, stat) >= 1) return stat;
  }
  return null;
}

/** Stats at or above the 80% warning level (but below fatal). */
export function warningStats(stats: NutritionStats, thresholds: DangerThresholds): DangerStat[] {
  return DANGER_STATS.filter((stat) => {
    const ratio = dangerRatio(stats, thresholds, stat);
    return ratio >= 0.8 && ratio < 1;
  });
}

/** True if this one item, alone in the basket, would already be over a limit. */
export function exceedsAnyLimitAlone(
  food: FoodItem,
  thresholds: DangerThresholds,
  powerUps: PowerUpId[] = []
): boolean {
  const zeroed = zeroedMacros(powerUps);
  return (
    food.calories > thresholds.caloriesMax ||
    (zeroed.fat ? 0 : food.fat) > thresholds.fatMax ||
    (zeroed.sugar ? 0 : food.sugar) > thresholds.sugarMax ||
    (zeroed.carbs ? 0 : food.carbs) > thresholds.carbsMax ||
    (food.sodium ?? 0) > thresholds.sodiumMax
  );
}
