import type { EquipmentRequirement, FoodItem, FoodTag } from "@/types/food";
import type { FoodPreference, NPC } from "@/types/npc";

const ALL_EQUIPMENT: EquipmentRequirement[] = [
  "fridge",
  "freezer",
  "microwave",
  "stove",
  "oven",
  "kettle",
];

export function npcEquipment(npc: NPC): Set<EquipmentRequirement> {
  const equipment = new Set<EquipmentRequirement>(ALL_EQUIPMENT);
  if (npc.restrictions.includes("no_fridge")) {
    equipment.delete("fridge");
    equipment.delete("freezer");
  }
  if (npc.restrictions.includes("no_microwave")) {
    equipment.delete("microwave");
  }
  if (npc.restrictions.includes("limited_cooking_equipment")) {
    equipment.delete("oven");
    equipment.delete("microwave");
  }
  return equipment;
}

export function hasEquipmentMismatch(food: FoodItem, npc: NPC): boolean {
  if (!food.requiresEquipment) return false;
  const equipment = npcEquipment(npc);
  return food.requiresEquipment.some((req) => !equipment.has(req));
}

/** Tag a food must carry to count toward each want ("likes_variety" is structural). */
export const PREFERENCE_TAG: Partial<Record<FoodPreference, FoodTag>> = {
  likes_sweet_food: "sweet",
  likes_salty_food: "salty",
  likes_fresh_food: "fresh",
  likes_comfort_food: "comfort",
  likes_spicy_food: "spicy",
  likes_crunchy_food: "crunchy",
  likes_familiar_food: "family_friendly",
};

const MUST_NOT_TAGS: Record<NPC["mustNot"], FoodTag[]> = {
  vegetarian: ["meat", "pork"],
  vegan: ["meat", "pork", "dairy", "egg"],
  no_pork: ["pork"],
  nut_allergy: ["nuts"],
  dairy_allergy: ["dairy"],
  egg_allergy: ["egg"],
};

/** True if this food crosses the NPC's hard dietary line. */
export function violatesMustNot(food: FoodItem, npc: NPC): boolean {
  return MUST_NOT_TAGS[npc.mustNot].some((tag) => food.tags.includes(tag));
}
