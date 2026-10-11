import type { FoodItem } from "@/types/food";
import type { BasketItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";

export function basketFoods(basket: BasketItem[]): FoodItem[] {
  return basket.flatMap((entry) =>
    FOOD_BY_ID[entry.foodItemId]
      ? Array.from(
          { length: entry.quantity },
          () => FOOD_BY_ID[entry.foodItemId],
        )
      : [],
  );
}
