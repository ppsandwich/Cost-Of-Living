import type { BasketItem, StoreItem } from "@/types/game";

export function quantityInBasket(
  basket: BasketItem[],
  foodItemId: string,
): number {
  return basket.find((b) => b.foodItemId === foodItemId)?.quantity ?? 0;
}

export function quantityRemaining(
  item: StoreItem,
  basket: BasketItem[],
): number {
  return Math.max(0, Math.min(1, item.quantityAvailable) - quantityInBasket(basket, item.foodItemId));
}
