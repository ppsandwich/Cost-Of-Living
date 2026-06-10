import type { FoodItem } from "@/types/food";
import type { NPC, NutritionStats } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { computeImpact } from "./applyFoodItem";

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
export function calculateBasketStats(basket: BasketItem[], npc: NPC): NutritionStats {
  const stats: NutritionStats = { ...EMPTY_STATS };
  const applied: FoodItem[] = [];

  for (const entry of basket) {
    const food = FOOD_BY_ID[entry.foodItemId];
    if (!food) continue;
    for (let i = 0; i < entry.quantity; i++) {
      const impact = computeImpact(food, npc, applied);
      stats.calories += food.calories;
      stats.protein += food.protein;
      stats.fat += food.fat;
      stats.sugar += food.sugar;
      stats.carbs += food.carbs;
      stats.fibre += food.fibre;
      stats.vitamins += food.vitamins;
      stats.minerals += food.minerals;
      stats.sodium += food.sodium ?? 0;
      stats.nutrition += impact.nutritionGain;
      stats.happiness += impact.happinessGain;
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
