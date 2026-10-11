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
  return item.quantityAvailable - quantityInBasket(basket, item.foodItemId);
}
