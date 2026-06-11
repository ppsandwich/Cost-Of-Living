import type { NPC, NutritionStats } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";

export function goalsMet(stats: NutritionStats, npc: NPC): boolean {
  // Judge on the rounded values the player sees: a displayed 65/65 must
  // count as met even if the raw float is 64.7
  return (
    Math.round(stats.nutrition) >= npc.nutritionTarget &&
    Math.round(stats.happiness) >= npc.happinessTarget
  );
}

export function quantityInBasket(basket: BasketItem[], foodItemId: string): number {
  return basket.find((b) => b.foodItemId === foodItemId)?.quantity ?? 0;
}

export function quantityRemaining(item: StoreItem, basket: BasketItem[]): number {
  return item.quantityAvailable - quantityInBasket(basket, item.foodItemId);
}

