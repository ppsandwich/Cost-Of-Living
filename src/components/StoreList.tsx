import type { NPC } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import { MUST_NOT_BADGE, WANT_BADGE } from "@/data/labels";
import {
  PREFERENCE_TAG,
  hasEquipmentMismatch,
  violatesMustNot,
} from "@/game/applyFoodItem";
import { mealRoles, usableFood, MEAL_LABELS } from "@/game/meals";
import { quantityInBasket, quantityRemaining } from "@/game/roundEnd";
import { FoodCard } from "./FoodCard";
interface StoreListProps {
  inventory: StoreItem[];
  basket: BasketItem[];
  npc: NPC;
  powerUps: PowerUpId[];
  bulkAddsUsed: string[];
  canShop: boolean;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onBulkAdd: (id: string) => void;
}
export function StoreList({
  inventory,
  basket,
  npc,
  powerUps,
  bulkAddsUsed,
  canShop,
  onAdd,
  onRemove,
  onBulkAdd,
}: StoreListProps) {
  return (
    <section aria-label="Store shelves">
      <h2 className="mb-3 flex items-center gap-2 font-title text-2xl">
        <span aria-hidden className="shelf-heading-icon">🛒</span>
        {canShop ? "Today’s shelves" : "Check the shelves"}
      </h2>
      {!canShop && (
        <p className="mb-3 text-sm">
          Tap an item’s name to learn more. Start shopping when you’re ready.
        </p>
      )}
      <ul className="space-y-3">
        {inventory.map((item) => {
          const food = FOOD_BY_ID[item.foodItemId];
          const unavailable = violatesMustNot(food, npc)
            ? MUST_NOT_BADGE[npc.mustNot]
            : hasEquipmentMismatch(food, npc)
              ? "They don’t have the kitchen equipment for this"
              : null;
          const lowestRoles =
            powerUps.includes("price_compare") && !unavailable
              ? mealRoles(food).filter(
                  (role) =>
                    !inventory.some(
                      (other) =>
                        quantityRemaining(other, basket) > 0 &&
                        other.currentPriceCents < item.currentPriceCents &&
                        usableFood(FOOD_BY_ID[other.foodItemId], npc) &&
                        mealRoles(FOOD_BY_ID[other.foodItemId]).includes(role),
                    ),
                )
              : [];
          return (
            <FoodCard
              key={food.id}
              food={food}
              storeItem={item}
              inBasket={quantityInBasket(basket, food.id)}
              remainingQuantity={quantityRemaining(item, basket)}
              wantMatches={npc.wants
                .filter(
                  (w) =>
                    PREFERENCE_TAG[w] && food.tags.includes(PREFERENCE_TAG[w]!),
                )
                .map((w) => WANT_BADGE[w] ?? w)}
              unavailable={unavailable}
              canShop={canShop}
              priceHint={
                lowestRoles.length && quantityRemaining(item, basket) > 0
                  ? `Cheapest pack for: ${lowestRoles.map((r) => MEAL_LABELS[r].toLowerCase()).join(", ")}.`
                  : null
              }
              canBulkAdd={
                powerUps.includes("bulk_buyer") &&
                !bulkAddsUsed.includes(food.id) &&
                quantityRemaining(item, basket) > 0
              }
              onAdd={() => onAdd(food.id)}
              onRemove={() => onRemove(food.id)}
              onBulkAdd={() => onBulkAdd(food.id)}
            />
          );
        })}
      </ul>
    </section>
  );
}
