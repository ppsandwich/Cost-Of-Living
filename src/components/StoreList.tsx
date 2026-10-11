import type { NPC } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import { MUST_NOT_BADGE, WANT_BADGE, AISLE_LABEL } from "@/data/labels";
import {
  PREFERENCE_TAG,
  hasEquipmentMismatch,
  violatesMustNot,
} from "@/game/applyFoodItem";
import { mealRoles, usableFood, MEAL_LABELS } from "@/game/meals";
import { quantityInBasket, quantityRemaining } from "@/game/roundEnd";
import { AISLE_ORDER, AISLE_ICONS, shopForRound } from "@/game/shops";
import { FoodCard } from "./FoodCard";
interface StoreListProps {
  inventory: StoreItem[];
  basket: BasketItem[];
  npc: NPC;
  powerUps: PowerUpId[];
  bulkAddsUsed: string[];
  canShop: boolean;
  roundNumber: number;
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
  roundNumber,
  onAdd,
  onRemove,
  onBulkAdd,
}: StoreListProps) {
  const shop = shopForRound(roundNumber);
  const aisles = AISLE_ORDER.filter((aisle) => inventory.some((item) => FOOD_BY_ID[item.foodItemId].category === aisle));
  const visited = new Set(basket.map((item) => FOOD_BY_ID[item.foodItemId].category));
  return (
    <section aria-label="Store shelves" className={canShop ? "store-shelves" : "store-shelves planning-shelves"}>
      <div className="shop-front">
        <span aria-hidden className="shop-front-icon">{shop.icon}</span>
        <div><p className="text-xs font-bold uppercase tracking-wider">Stop {roundNumber}</p><h2 className="font-title text-3xl">{shop.name}</h2><p className="text-xs">{shop.sign}</p></div>
      </div>
      <nav className="aisle-nav" aria-label="Jump to an aisle">
        {aisles.map((aisle) => <a key={aisle} href={`#aisle-${aisle}`}><span aria-hidden>{AISLE_ICONS[aisle]}</span> {AISLE_LABEL[aisle]}</a>)}
      </nav>
      {!canShop && <p className="mb-3 text-xs text-faded">Tap a product for details. Start shopping when you’re ready.</p>}
      {aisles.map((aisle) => <section className={`aisle aisle-${aisle}`} key={aisle} id={`aisle-${aisle}`} aria-label={`${AISLE_LABEL[aisle]} aisle`}>
        <h3 className="aisle-sign"><span aria-hidden>{AISLE_ICONS[aisle]}</span> {AISLE_LABEL[aisle]} {visited.has(aisle) && <span className="aisle-picked">✓ In basket</span>}</h3>
        <ul className="product-shelf">
        {inventory.filter((item) => FOOD_BY_ID[item.foodItemId].category === aisle).map((item) => {
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
      </section>)}
    </section>
  );
}
