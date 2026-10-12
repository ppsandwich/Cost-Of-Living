import type { FoodItem } from "@/types/food";
import type { NPC } from "@/types/npc";
import type { StoreItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { PREFERENCE_TAG } from "./applyFoodItem";
import { mealRoles, usableFood } from "./meals";

/** One sequence drives both shelf headings and filter buttons. */
export const SHELF_GROUPS = [
  { id: "base", label: "Base", icon: "🍞" },
  { id: "protein", label: "Protein", icon: "🫘" },
  { id: "produce", label: "Fruit / veg", icon: "🥦" },
  { id: "wishes", label: "Wishes", icon: "★" },
  { id: "extras", label: "Extras", icon: "🍫" },
] as const;
export type ShelfGroup = (typeof SHELF_GROUPS)[number]["id"];
export type ShelfFilter = "all" | ShelfGroup;

export function matchesWish(food: FoodItem, npc: NPC): boolean {
  return npc.wants.some((want) => want === "likes_variety" ||
    (PREFERENCE_TAG[want] !== undefined && food.tags.includes(PREFERENCE_TAG[want]!)));
}

/** Multi-role foods get one home in All, but match every relevant filter. */
export function primaryShelfGroup(food: FoodItem, npc: NPC): ShelfGroup {
  return mealRoles(food)[0] ?? (matchesWish(food, npc) ? "wishes" : "extras");
}

export function groupShelves(inventory: StoreItem[], npc: NPC, filter: ShelfFilter, showFoodsToAvoid: boolean) {
  const visible = inventory.filter((item) => {
    const food = FOOD_BY_ID[item.foodItemId];
    if (!showFoodsToAvoid && !usableFood(food, npc)) return false;
    if (filter === "all") return true;
    if (filter === "wishes") return matchesWish(food, npc);
    if (filter === "extras") return primaryShelfGroup(food, npc) === "extras";
    return mealRoles(food).includes(filter);
  });
  return SHELF_GROUPS.map((group) => ({
    ...group,
    items: visible.filter((item) => filter === "all"
      ? primaryShelfGroup(FOOD_BY_ID[item.foodItemId], npc) === group.id
      : group.id === filter),
  })).filter((group) => group.items.length > 0);
}
