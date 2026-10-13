import { useState } from "react";
import type { NPC } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import { MUST_NOT_BADGE, WANT_BADGE } from "@/data/labels";
import {
  PREFERENCE_TAG,
  violatesMustNot,
} from "@/game/applyFoodItem";
import { mealCounts, mealRoles, mealCoverage, usableFood, MEAL_LABELS } from "@/game/meals";
import { quantityInBasket, quantityRemaining } from "@/game/roundEnd";
import { shopForRound } from "@/game/shops";
import { getRequirementsStatus } from "@/game/requirements";
import { groupShelves, SHELF_GROUPS, type ShelfFilter } from "@/game/shelfGroups";
import { FoodCard } from "./FoodCard";
interface StoreListProps {
  inventory: StoreItem[];
  basket: BasketItem[];
  npc: NPC;
  powerUps: PowerUpId[];
  canShop: boolean;
  planning: boolean;
  roundNumber: number;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}
export function StoreList({
  inventory,
  basket,
  npc,
  powerUps,
  canShop,
  planning,
  roundNumber,
  onAdd,
  onRemove,
}: StoreListProps) {
  const shop = shopForRound(roundNumber);
  const [filter, setFilter] = useState<ShelfFilter>("all");
  const counts = mealCounts(basket, npc);
  const coverage = mealCoverage(basket, npc);
  const wants = getRequirementsStatus(basket, npc).wants;
  const groups = groupShelves(inventory, npc, planning ? "all" : filter, true);
  const visibleCount = groups.reduce((total, group) => total + group.items.length, 0);
  return (
    <section id="store-shelves" tabIndex={-1} aria-label="Store shelves" className={planning ? "store-shelves planning-shelves" : "store-shelves"}>
      <div className="shop-front">
        <span aria-hidden className="shop-front-icon">{shop.icon}</span>
        <div><p className="text-xs font-bold uppercase tracking-wider">Stop {roundNumber}</p><h2 className="font-title text-3xl">{shop.name}</h2><p className="text-xs">{shop.sign}</p></div>
      </div>
      {!planning && <div className="shelf-tools">
        <div className="lunch-filters" role="group" aria-label="Find food for your lunch">
          <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
          {SHELF_GROUPS.map((group) => {
            const covered = group.id === "wishes" ? wants.every((want) => want.satisfied)
              : group.id === "extras" ? false : coverage[group.id];
            return <button key={group.id} aria-pressed={filter === group.id} onClick={() => setFilter(group.id)}>
              <span aria-hidden>{covered ? "✓" : group.icon}</span> {group.label}{group.id === "produce" && ` ${Math.min(counts.produce, 2)}/2`}
              {group.id !== "extras" && <span className="sr-only">{covered ? ": covered" : ": still needed"}</span>}
            </button>;
          })}
        </div>
        <div className="shelf-options">
          <span>{visibleCount} {visibleCount === 1 ? "choice" : "choices"}</span>
        </div>
      </div>}
      <p className="shelf-hint">{planning ? "Include a base, protein and two fruit or veg items. One food can cover more than one part." : "Pick food, watch your budget, then review your basket."}</p>
      {planning && <p className="shelf-hint">For extra points, make a tasty dish with 3–4 matching ingredients. Clear clashes lose points as “Dubious food”.</p>}
      {visibleCount === 0 && <p className="panel bg-receipt p-4 text-sm">No food here matches this filter. <button className="min-h-11 font-bold underline" onClick={() => setFilter("all")}>See all choices</button></p>}
      {groups.map((group) => <section className={`aisle shelf-${group.id}`} key={group.id} id={`shelf-${group.id}`} aria-label={`${group.label} foods`}>
        <h3 className="aisle-sign"><span aria-hidden>{group.icon}</span> {group.label}<span className="shelf-group-count">{group.items.length} {group.items.length === 1 ? "choice" : "choices"}</span></h3>
        {group.id === "wishes" && filter === "all" && <p className="shelf-group-note">More picks for their food wishes. Look for matching tags in the other groups too.</p>}
        <ul className="product-shelf">
        {group.items.map((item) => {
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
              showPrice={!planning}
              showAisle={npc.wants.includes("likes_variety")}
              priceHint={
                lowestRoles.length && quantityRemaining(item, basket) > 0
                  ? `Cheapest pack for: ${lowestRoles.map((r) => MEAL_LABELS[r].toLowerCase()).join(", ")}.`
                  : null
              }
              onAdd={() => onAdd(food.id)}
              onRemove={() => onRemove(food.id)}
            />
          );
        })}
        </ul>
      </section>)}
    </section>
  );
}
