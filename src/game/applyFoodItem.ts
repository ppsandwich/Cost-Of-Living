import type { EquipmentRequirement, FoodItem, FoodTag } from "@/types/food";
import type { FoodPreference, NPC } from "@/types/npc";

export interface ItemImpact {
  nutritionGain: number;
  happinessGain: number;
  equipmentMismatch: boolean;
  restrictionViolation: boolean;
  repetitionApplied: boolean;
}

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

const PREFERENCE_TAG: Partial<Record<FoodPreference, FoodTag>> = {
  likes_sweet_food: "sweet",
  likes_salty_food: "salty",
  likes_fresh_food: "fresh",
  likes_comfort_food: "comfort",
  likes_spicy_food: "spicy",
  likes_crunchy_food: "crunchy",
  likes_familiar_food: "family_friendly",
};

export function violatesRestriction(food: FoodItem, npc: NPC): boolean {
  if (npc.restrictions.includes("vegetarian") && food.tags.includes("meat")) return true;
  if (npc.restrictions.includes("no_pork") && food.tags.includes("pork")) return true;
  return false;
}

function isTreatLike(food: FoodItem): boolean {
  return (
    food.category === "treat" ||
    food.category === "snack" ||
    food.tags.includes("sweet") ||
    food.tags.includes("comfort")
  );
}

/**
 * Compute the nutrition and happiness an NPC gets from one unit of a food,
 * given the foods already in the basket (for variety/repetition effects).
 */
export function computeImpact(food: FoodItem, npc: NPC, priorFoods: FoodItem[]): ItemImpact {
  const s = npc.sensitivity;
  const restrictions = npc.restrictions;

  const equipmentMismatch = hasEquipmentMismatch(food, npc);
  const restrictionViolation = violatesRestriction(food, npc);

  // ── Nutrition ──
  const vegMult =
    food.category === "vegetable" || food.category === "fruit"
      ? s.nutritionFromVegetablesMultiplier
      : 1;
  const equipNutritionMult = equipmentMismatch ? 0.6 : 1;
  const restrictionNutritionMult = restrictionViolation ? 0.4 : 1;

  const proteinContribution =
    food.protein * 0.1 * (restrictions.includes("high_protein_need") ? 1.5 : 1);
  const fibreContribution =
    food.fibre * 0.15 * (restrictions.includes("high_fibre_need") ? 1.5 : 1);
  const vitaminContribution = food.vitamins * 0.2 * s.vitaminNeedMultiplier;
  const mineralContribution = food.minerals * 0.15 * s.mineralNeedMultiplier;

  const excessSugarPenalty =
    Math.max(0, food.sugar - 25) *
    0.15 *
    s.sugarPenaltyMultiplier *
    (restrictions.includes("low_sugar") ? 1.5 : 1);
  const excessFatPenalty =
    Math.max(0, food.fat - 20) *
    0.2 *
    s.fatPenaltyMultiplier *
    (restrictions.includes("low_fat") ? 1.5 : 1);
  const excessCarbPenalty = Math.max(0, food.carbs - 120) * 0.05 * s.carbPenaltyMultiplier;
  const excessSodiumPenalty =
    Math.max(0, (food.sodium ?? 0) - 40) * 0.1 * (restrictions.includes("low_sodium") ? 1.5 : 1);

  const nutritionGain = Math.max(
    0,
    food.baseNutrition * vegMult * equipNutritionMult * restrictionNutritionMult +
      proteinContribution +
      fibreContribution +
      vitaminContribution +
      mineralContribution -
      excessSugarPenalty -
      excessFatPenalty -
      excessCarbPenalty -
      excessSodiumPenalty
  );

  // ── Happiness ──
  const matchedLikes = npc.preferences.filter((p) => {
    const tag = PREFERENCE_TAG[p];
    return tag !== undefined && food.tags.includes(tag);
  }).length;
  let preferenceMultiplier = 1 + 0.25 * matchedLikes;
  if (npc.preferences.includes("dislikes_bland_food") && food.tags.includes("bland")) {
    preferenceMultiplier *= 0.6;
  }

  const sameCategoryCount = priorFoods.filter((f) => f.category === food.category).length;
  const dislikesRepetition = npc.preferences.includes("dislikes_repetition");
  let varietyMultiplier = dislikesRepetition
    ? Math.max(0.25, 1 - 0.3 * sameCategoryCount)
    : Math.max(0.4, 1 - 0.18 * sameCategoryCount);
  if (npc.preferences.includes("likes_variety") && sameCategoryCount === 0) {
    varietyMultiplier *= 1.15;
  }

  const treatsMultiplier = isTreatLike(food) ? s.happinessFromTreatsMultiplier : 1;
  const equipmentMultiplier = equipmentMismatch ? 0.5 : 1;
  const restrictionPenalty = restrictionViolation ? 15 : 0;

  const happinessGain =
    food.baseHappiness *
      preferenceMultiplier *
      varietyMultiplier *
      treatsMultiplier *
      equipmentMultiplier -
    restrictionPenalty;

  return {
    nutritionGain: Math.round(nutritionGain * 10) / 10,
    happinessGain: Math.round(happinessGain * 10) / 10,
    equipmentMismatch,
    restrictionViolation,
    repetitionApplied: sameCategoryCount >= 2,
  };
}
