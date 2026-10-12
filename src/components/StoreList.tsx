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
import { mealRoles, mealCoverage, usableFood, MEAL_LABELS } from "@/game/meals";
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
  const [filter, setFilter] = useState<ShelfFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const coverage = mealCoverage(basket, npc);
  const wants = getRequirementsStatus(basket, npc).wants;
  const groups = groupShelves(inventory, npc, filter, showAll);
  const visibleCount = groups.reduce((total, group) => total + group.items.length, 0);
  const blockedCount = inventory.filter((item) => !usableFood(FOOD_BY_ID[item.foodItemId], npc)).length;
  return (
    <section id="store-shelves" tabIndex={-1} aria-label="Store shelves" className={canShop ? "store-shelves" : "store-shelves planning-shelves"}>
      <div className="shop-front">
        <span aria-hidden className="shop-front-icon">{shop.icon}</span>
        <div><p className="text-xs font-bold uppercase tracking-wider">Stop {roundNumber}</p><h2 className="font-title text-3xl">{shop.name}</h2><p className="text-xs">{shop.sign}</p></div>
      </div>
      <div className="shelf-tools">
        <div className="lunch-filters" role="group" aria-label="Find food for your lunch">
          <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
          {SHELF_GROUPS.map((group) => {
            const covered = group.id === "wishes" ? wants.every((want) => want.satisfied)
              : group.id === "extras" ? false : coverage[group.id];
            return <button key={group.id} aria-pressed={filter === group.id} onClick={() => setFilter(group.id)}>
              <span aria-hidden>{covered ? "✓" : group.icon}</span> {group.label}
              {group.id !== "extras" && <span className="sr-only">{covered ? ": covered" : ": still needed"}</span>}
            </button>;
          })}
        </div>
        <div className="shelf-options">
          <span>{visibleCount} {visibleCount === 1 ? "choice" : "choices"}{!showAll ? ` for ${npc.name}` : ""}</span>
          {blockedCount > 0 && <button className="min-h-11 font-bold underline underline-offset-4" aria-pressed={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? "Hide foods to avoid" : `Show foods to avoid (${blockedCount})`}</button>}
        </div>
        <details className="aisle-disclosure"><summary>Jump to a group</summary><nav className="aisle-nav" aria-label="Jump to a group">
          {groups.map((group) => <a key={group.id} href={`#shelf-${group.id}`}><span aria-hidden>{group.icon}</span> {group.label}</a>)}
        </nav></details>
      </div>
      <p className="shelf-hint">{!canShop ? "Browse prices now. Start shopping when you’re ready." : "Pick food, watch your budget, then review your basket."}</p>
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
              showAisle={npc.wants.includes("likes_variety")}
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
