import { useState } from "react";
import type { NPC } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import { MUST_NOT_BADGE, WANT_BADGE, AISLE_LABEL } from "@/data/labels";
import {
  PREFERENCE_TAG,
  violatesMustNot,
} from "@/game/applyFoodItem";
import { mealRoles, mealCoverage, MEAL_ROLES, usableFood, MEAL_LABELS, type MealRole } from "@/game/meals";
import { quantityInBasket, quantityRemaining } from "@/game/roundEnd";
import { AISLE_ORDER, AISLE_ICONS, shopForRound } from "@/game/shops";
import { getRequirementsStatus } from "@/game/requirements";
import { MEAL_ICONS } from "./StatsPanel";
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
  const [filter, setFilter] = useState<"all" | MealRole | "wishes">("all");
  const [showAll, setShowAll] = useState(false);
  const coverage = mealCoverage(basket, npc);
  const wants = getRequirementsStatus(basket, npc).wants;
  const visibleInventory = inventory.filter((item) => {
    const food = FOOD_BY_ID[item.foodItemId];
    if (!showAll && !usableFood(food, npc)) return false;
    if (filter === "all") return true;
    if (filter === "wishes") return npc.wants.some((want) => want === "likes_variety" || (PREFERENCE_TAG[want] && food.tags.includes(PREFERENCE_TAG[want]!)));
    return mealRoles(food).includes(filter);
  });
  const blockedCount = inventory.filter((item) => !usableFood(FOOD_BY_ID[item.foodItemId], npc)).length;
  const aisles = AISLE_ORDER.filter((aisle) => visibleInventory.some((item) => FOOD_BY_ID[item.foodItemId].category === aisle));
  const visited = new Set(basket.map((item) => FOOD_BY_ID[item.foodItemId].category));
  return (
    <section id="store-shelves" tabIndex={-1} aria-label="Store shelves" className={canShop ? "store-shelves" : "store-shelves planning-shelves"}>
      <div className="shop-front">
        <span aria-hidden className="shop-front-icon">{shop.icon}</span>
        <div><p className="text-xs font-bold uppercase tracking-wider">Stop {roundNumber}</p><h2 className="font-title text-3xl">{shop.name}</h2><p className="text-xs">{shop.sign}</p></div>
      </div>
      <div className="shelf-tools">
        <div className="lunch-filters" role="group" aria-label="Find food for your lunch">
          <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
          {MEAL_ROLES.map((role) => <button key={role} aria-pressed={filter === role} onClick={() => setFilter(role)}>
            <span aria-hidden>{coverage[role] ? "✓" : MEAL_ICONS[role]}</span> {role === "produce" ? "Fruit / veg" : role === "base" ? "Base" : "Protein"}<span className="sr-only">{coverage[role] ? ": covered" : ": still needed"}</span>
          </button>)}
          <button aria-pressed={filter === "wishes"} onClick={() => setFilter("wishes")}><span aria-hidden>{wants.every((w) => w.satisfied) ? "✓" : "★"}</span> Wishes</button>
        </div>
        <div className="shelf-options">
          <span>{visibleInventory.length} choices{!showAll ? ` for ${npc.name}` : ""}</span>
          {blockedCount > 0 && <button className="min-h-11 font-bold underline underline-offset-4" aria-pressed={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? "Hide foods to avoid" : `Show foods to avoid (${blockedCount})`}</button>}
        </div>
        <details className="aisle-disclosure"><summary>Jump to an aisle</summary><nav className="aisle-nav" aria-label="Jump to an aisle">
          {aisles.map((aisle) => <a key={aisle} href={`#aisle-${aisle}`}><span aria-hidden>{AISLE_ICONS[aisle]}</span> {AISLE_LABEL[aisle]}</a>)}
        </nav></details>
      </div>
      <p className="shelf-hint">{!canShop ? "Browse prices now. Start shopping when you’re ready." : "Pick food, watch your budget, then review your basket."}</p>
      {visibleInventory.length === 0 && <p className="panel bg-receipt p-4 text-sm">No food here matches this filter. <button className="min-h-11 font-bold underline" onClick={() => setFilter("all")}>See all choices</button></p>}
      {aisles.map((aisle) => <section className={`aisle aisle-${aisle}`} key={aisle} id={`aisle-${aisle}`} aria-label={`${AISLE_LABEL[aisle]} aisle`}>
        <h3 className="aisle-sign"><span aria-hidden>{AISLE_ICONS[aisle]}</span> {AISLE_LABEL[aisle]} {visited.has(aisle) && <span className="aisle-picked">✓ In basket</span>}</h3>
        <ul className="product-shelf">
        {visibleInventory.filter((item) => FOOD_BY_ID[item.foodItemId].category === aisle).map((item) => {
          const food = FOOD_BY_ID[item.foodItemId];
          const unavailable = violatesMustNot(food, npc)
            ? MUST_NOT_BADGE[npc.mustNot]
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
