import type { NPC, NutritionStats } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { violatesMustNot } from "./applyFoodItem";

export function goalsMet(stats: NutritionStats, npc: NPC): boolean {
  return stats.nutrition >= npc.nutritionTarget && stats.happiness >= npc.happinessTarget;
}

export function quantityInBasket(basket: BasketItem[], foodItemId: string): number {
  return basket.find((b) => b.foodItemId === foodItemId)?.quantity ?? 0;
}

export function quantityRemaining(item: StoreItem, basket: BasketItem[]): number {
  return item.quantityAvailable - quantityInBasket(basket, item.foodItemId);
}

/**
 * True if at least one store item can still be bought with the remaining
 * budget. Forbidden (must-not) items are disabled at the till, so they
 * don't count as valid purchases.
 */
export function canAffordAnything(
  inventory: StoreItem[],
  basket: BasketItem[],
  remainingBudgetCents: number,
  npc: NPC
): boolean {
  return inventory.some((item) => {
    const food = FOOD_BY_ID[item.foodItemId];
    return (
      food !== undefined &&
      !violatesMustNot(food, npc) &&
      quantityRemaining(item, basket) > 0 &&
      item.currentPriceCents <= remainingBudgetCents
    );
  });
}
