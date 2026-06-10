import type { FoodItem } from "@/types/food";
import type { NPC } from "@/types/npc";
import type { StoreItem } from "@/types/game";
import { FOOD_ITEMS } from "@/data/foodItems";
import { hasEquipmentMismatch, violatesRestriction } from "./applyFoodItem";
import { createRng, randomBetween, shuffle, type RNG } from "./seededRandom";

export const INVENTORY_SIZE = 16;

function roundTo5Cents(cents: number): number {
  return Math.max(50, Math.round(cents / 5) * 5);
}

function variedPrice(rng: RNG, basePriceCents: number): number {
  return roundTo5Cents(basePriceCents * randomBetween(rng, 0.85, 1.25));
}

/** True if the NPC can actually use this food (no restriction or equipment clash). */
function usableBy(food: FoodItem, npc: NPC): boolean {
  return !violatesRestriction(food, npc) && !hasEquipmentMismatch(food, npc);
}

export function generateInventory(npc: NPC, roundBudgetCents: number, seed: number): StoreItem[] {
  const rng = createRng(seed);
  const chosen = new Map<string, FoodItem>();

  const pickFirst = (pool: FoodItem[], predicate: (f: FoodItem) => boolean) => {
    const candidate = shuffle(rng, pool).find((f) => !chosen.has(f.id) && predicate(f));
    if (candidate) chosen.set(candidate.id, candidate);
  };

  // Guaranteed slots — all usable by this NPC so a fair path always exists
  pickFirst(FOOD_ITEMS, (f) => f.category === "protein" && usableBy(f, npc)); // protein source
  pickFirst(
    FOOD_ITEMS,
    (f) => (f.category === "fruit" || f.category === "vegetable") && usableBy(f, npc)
  );
  pickFirst(FOOD_ITEMS, (f) => f.baseHappiness >= 16 && usableBy(f, npc)); // happiness-heavy
  pickFirst(
    FOOD_ITEMS,
    (f) => (f.tags.includes("high_sugar") || f.tags.includes("high_fat")) && !chosen.has(f.id)
  ); // risky temptation
  // Cheap options the NPC can afford at round start
  for (let i = 0; i < 3; i++) {
    pickFirst(
      FOOD_ITEMS,
      (f) => f.basePriceCents <= 250 && f.basePriceCents <= roundBudgetCents && usableBy(f, npc)
    );
  }
  // A second nutritious option
  pickFirst(FOOD_ITEMS, (f) => f.baseNutrition >= 18 && usableBy(f, npc));

  // Fill the rest randomly
  for (const food of shuffle(rng, FOOD_ITEMS)) {
    if (chosen.size >= INVENTORY_SIZE) break;
    if (!chosen.has(food.id)) chosen.set(food.id, food);
  }

  const items: StoreItem[] = shuffle(rng, [...chosen.values()]).map((food) => ({
    foodItemId: food.id,
    currentPriceCents: variedPrice(rng, food.basePriceCents),
    quantityAvailable: food.maxQuantity ?? 1,
  }));

  // Specials: a few price stickers per round
  const specialCount = 2 + Math.floor(rng() * 2);
  const specialIndices = shuffle(rng, items.map((_, i) => i)).slice(0, specialCount);
  const specials: { label: string; apply: (item: StoreItem) => void }[] = [
    { label: "Half price", apply: (s) => (s.currentPriceCents = roundTo5Cents(s.currentPriceCents * 0.5)) },
    { label: "Clearance", apply: (s) => (s.currentPriceCents = roundTo5Cents(s.currentPriceCents * 0.7)) },
    { label: "Manager's special", apply: (s) => (s.currentPriceCents = roundTo5Cents(s.currentPriceCents * 0.65)) },
    {
      label: "Bulk value",
      apply: (s) => {
        s.quantityAvailable += 2;
        s.currentPriceCents = roundTo5Cents(s.currentPriceCents * 0.9);
      },
    },
    { label: "Shrinkflated", apply: (s) => (s.currentPriceCents = roundTo5Cents(s.currentPriceCents * 1.1)) },
  ];
  for (const index of specialIndices) {
    const special = specials[Math.floor(rng() * specials.length)];
    special.apply(items[index]);
    items[index].specialLabel = special.label;
  }

  // Most expensive item beyond the whole budget gets the honesty sticker
  const priciest = items.reduce((a, b) => (b.currentPriceCents > a.currentPriceCents ? b : a));
  if (priciest.currentPriceCents > roundBudgetCents && !priciest.specialLabel) {
    priciest.specialLabel = "Fancy but unaffordable";
  }

  return items;
}
