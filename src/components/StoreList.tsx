import type { NPC } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { computeImpact } from "@/game/applyFoodItem";
import { basketFoods } from "@/game/calculateStats";
import { quantityInBasket, quantityRemaining } from "@/game/roundEnd";
import { FoodCard } from "./FoodCard";

interface StoreListProps {
  inventory: StoreItem[];
  basket: BasketItem[];
  npc: NPC;
  remainingBudgetCents: number;
  onAdd: (foodItemId: string) => void;
}

export function StoreList({
  inventory,
  basket,
  npc,
  remainingBudgetCents,
  onAdd,
}: StoreListProps) {
  const prior = basketFoods(basket);

  return (
    <section aria-label="Store shelves">
      <ul className="space-y-2">
        {inventory.map((storeItem) => {
          const food = FOOD_BY_ID[storeItem.foodItemId];
          if (!food) return null;
          return (
            <FoodCard
              key={storeItem.foodItemId}
              food={food}
              storeItem={storeItem}
              impact={computeImpact(food, npc, prior)}
              inBasket={quantityInBasket(basket, storeItem.foodItemId)}
              remainingQuantity={quantityRemaining(storeItem, basket)}
              affordable={storeItem.currentPriceCents <= remainingBudgetCents}
              onAdd={() => onAdd(storeItem.foodItemId)}
            />
          );
        })}
      </ul>
    </section>
  );
}
