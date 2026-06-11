import type { FoodItem } from "@/types/food";
import type { NPC, NutritionStats } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import { computeImpact } from "./applyFoodItem";
import { zeroedMacros } from "./powerups";

export const EMPTY_STATS: NutritionStats = {
  calories: 0,
  protein: 0,
  fat: 0,
  sugar: 0,
  carbs: 0,
  fibre: 0,
  vitamins: 0,
  minerals: 0,
  sodium: 0,
  nutrition: 0,
  happiness: 0,
};

/**
 * Recompute full NPC stats from the basket, applying items in purchase
 * order so variety/repetition effects are consistent on add and remove.
 */
export function calculateBasketStats(
  basket: BasketItem[],
  npc: NPC,
  powerUps: PowerUpId[] = []
): NutritionStats {
  const stats: NutritionStats = { ...EMPTY_STATS };
  const applied: FoodItem[] = [];
  const zeroed = zeroedMacros(powerUps);

  for (const entry of basket) {
    const food = FOOD_BY_ID[entry.foodItemId];
    if (!food) continue;
    const luckyMult = entry.luckyDouble ? 2 : 1;
    for (let i = 0; i < entry.quantity; i++) {
      const impact = computeImpact(food, npc, applied, entry.shrinkflated, powerUps);
      stats.calories += food.calories;
      stats.protein += food.protein;
      stats.fat += zeroed.fat ? 0 : food.fat;
      stats.sugar += zeroed.sugar ? 0 : food.sugar;
      stats.carbs += zeroed.carbs ? 0 : food.carbs;
      stats.fibre += food.fibre;
      stats.vitamins += food.vitamins;
      stats.minerals += food.minerals;
      stats.sodium += food.sodium ?? 0;
      stats.nutrition += impact.nutritionGain * luckyMult;
      stats.happiness += impact.happinessGain * luckyMult;
      applied.push(food);
    }
  }

  stats.nutrition = Math.round(stats.nutrition * 10) / 10;
  stats.happiness = Math.round(stats.happiness * 10) / 10;
  return stats;
}

/** Foods currently in the basket, expanded by quantity, in purchase order. */
export function basketFoods(basket: BasketItem[]): FoodItem[] {
  const foods: FoodItem[] = [];
  for (const entry of basket) {
    const food = FOOD_BY_ID[entry.foodItemId];
    if (!food) continue;
    for (let i = 0; i < entry.quantity; i++) foods.push(food);
  }
  return foods;
}
