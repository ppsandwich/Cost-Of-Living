import type { NPC } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { zeroedMacros } from "@/game/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import { MUST_NOT_BADGE, WANT_BADGE, WANT_EMOJI } from "@/data/labels";
import { computeImpact, PREFERENCE_TAG } from "@/game/applyFoodItem";
import { basketFoods } from "@/game/calculateStats";
import { getRequirementsStatus } from "@/game/requirements";
import { quantityInBasket, quantityRemaining } from "@/game/roundEnd";
import { FoodCard } from "./FoodCard";

interface StoreListProps {
  inventory: StoreItem[];
  basket: BasketItem[];
  npc: NPC;
  powerUps: PowerUpId[];
  onAdd: (foodItemId: string) => void;
  onRemove: (foodItemId: string) => void;
}

export function StoreList({
  inventory,
  basket,
  npc,
  powerUps,
  onAdd,
  onRemove,
}: StoreListProps) {
  const prior = basketFoods(basket);
  const status = getRequirementsStatus(basket, npc);
  const zeroed = zeroedMacros(powerUps);

  return (
    <section aria-label="Store shelves">
      <h2 className="mb-2 flex items-center gap-2 font-display text-sm uppercase tracking-wider text-faded">
        <span aria-hidden>🛒</span> Today&apos;s shelves
        <span aria-hidden className="h-0.5 flex-1 rounded bg-ink/15" />
      </h2>
      <ul className="space-y-3">
        {inventory.map((storeItem) => {
          const food = FOOD_BY_ID[storeItem.foodItemId];
          if (!food) return null;
          const impact = computeImpact(food, npc, prior, storeItem.shrinkflated, powerUps);
          const wantMatches = npc.wants
            .filter((want) => {
              const tag = PREFERENCE_TAG[want];
              return tag !== undefined && food.tags.includes(tag);
            })
            .map((want) => ({
              label: WANT_BADGE[want] ?? want,
              emoji: WANT_EMOJI[want],
              satisfied: status.wants.find((w) => w.want === want)?.satisfied ?? false,
            }));
          return (
            <FoodCard
              key={storeItem.foodItemId}
              food={food}
              storeItem={storeItem}
              impact={impact}
              inBasket={quantityInBasket(basket, storeItem.foodItemId)}
              remainingQuantity={quantityRemaining(storeItem, basket)}
              wantMatches={wantMatches}
              zeroed={zeroed}
              mustNotLabel={impact.mustNotViolation ? MUST_NOT_BADGE[npc.mustNot] : null}
              onAdd={() => onAdd(storeItem.foodItemId)}
              onRemove={() => onRemove(storeItem.foodItemId)}
            />
          );
        })}
      </ul>
    </section>
  );
}
