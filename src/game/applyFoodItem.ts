import type { EquipmentRequirement, FoodItem, FoodTag } from "@/types/food";
import type { FoodPreference, NPC } from "@/types/npc";
import type { PowerUpId } from "@/data/powerups";
import { hasPowerUp, zeroedMacros } from "./powerups";

export interface ItemImpact {
  nutritionGain: number;
  happinessGain: number;
  equipmentMismatch: boolean;
  mustNotViolation: boolean;
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
  none: [],
};

/** True if this food crosses the NPC's hard dietary line. */
export function violatesMustNot(food: FoodItem, npc: NPC): boolean {
  return MUST_NOT_TAGS[npc.mustNot].some((tag) => food.tags.includes(tag));
}

/**
 * Cheap food delivers less of its promise; pricier food delivers more.
 * Derived from base price so specials discount the till price without
 * changing what's in the packet.
 */
export function priceQualityMultiplier(basePriceCents: number): number {
  return Math.min(1.2, 0.6 + basePriceCents / 800);
}

/**
 * Happiness is nerfed far more gently than nutrition: a cheap biscuit
 * still has to feel like a treat, or the trap stops being tempting.
 */
export function priceHappinessMultiplier(basePriceCents: number): number {
  return Math.min(1.1, 0.85 + basePriceCents / 2000);
}

function isTreatLike(food: FoodItem): boolean {
  return (
    food.category === "treat" ||
    food.category === "snack" ||
    food.tags.includes("sweet") ||
    food.tags.includes("comfort")
  );
}

/** Shrinkflated packets deliver half their usual benefit. */
export const SHRINKFLATION_MULTIPLIER = 0.5;

/**
 * Compute the nutrition and happiness an NPC gets from one unit of a food,
 * given the foods already in the basket (for variety/repetition effects).
 */
export function computeImpact(
  food: FoodItem,
  npc: NPC,
  priorFoods: FoodItem[],
  shrinkflated = false,
  powerUps: PowerUpId[] = []
): ItemImpact {
  const s = npc.sensitivity;
  const restrictions = npc.restrictions;

  const equipmentMismatch = hasEquipmentMismatch(food, npc);
  const mustNotViolation = violatesMustNot(food, npc);
  const quality = priceQualityMultiplier(food.basePriceCents);
  const happinessQuality = priceHappinessMultiplier(food.basePriceCents);

  // ── Nutrition ──
  const vegMult =
    food.category === "vegetable" || food.category === "fruit"
      ? s.nutritionFromVegetablesMultiplier
      : 1;
  const campChef = hasPowerUp(powerUps, "camp_chef");
  const equipNutritionMult = equipmentMismatch ? (campChef ? 0.8 : 0.6) : 1;
  const mustNotNutritionMult = mustNotViolation ? 0.4 : 1;
  // Iron Stomach: expired food keeps most of its goodness
  const ironStomachMult =
    food.variant === "expired" && hasPowerUp(powerUps, "iron_stomach") ? 1.5 : 1;
  // Plant Lover: fresh food blooms
  const plantLoverMult =
    food.tags.includes("fresh") && hasPowerUp(powerUps, "plant_lover") ? 1.2 : 1;

  const proteinContribution =
    food.protein *
    0.1 *
    (restrictions.includes("high_protein_need") ? 1.5 : 1) *
    (hasPowerUp(powerUps, "protein_shaker") ? 1.5 : 1);
  const fibreContribution =
    food.fibre * 0.15 * (restrictions.includes("high_fibre_need") ? 1.5 : 1);
  const vitaminContribution = food.vitamins * 0.2 * s.vitaminNeedMultiplier;
  const mineralContribution = food.minerals * 0.15 * s.mineralNeedMultiplier;

  const zeroed = zeroedMacros(powerUps);
  const excessSugarPenalty =
    Math.max(0, (zeroed.sugar ? 0 : food.sugar) - 25) *
    0.15 *
    s.sugarPenaltyMultiplier *
    (restrictions.includes("low_sugar") ? 1.5 : 1);
  const excessFatPenalty =
    Math.max(0, (zeroed.fat ? 0 : food.fat) - 20) *
    0.2 *
    s.fatPenaltyMultiplier *
    (restrictions.includes("low_fat") ? 1.5 : 1);
  const excessCarbPenalty =
    Math.max(0, (zeroed.carbs ? 0 : food.carbs) - 120) * 0.05 * s.carbPenaltyMultiplier;
  const excessSodiumPenalty =
    Math.max(0, (food.sodium ?? 0) - 40) * 0.1 * (restrictions.includes("low_sodium") ? 1.5 : 1);

  const nutritionGain = Math.max(
    0,
    (food.baseNutrition * quality * vegMult * equipNutritionMult * mustNotNutritionMult +
      proteinContribution +
      fibreContribution +
      vitaminContribution +
      mineralContribution -
      excessSugarPenalty -
      excessFatPenalty -
      excessCarbPenalty -
      excessSodiumPenalty) *
      ironStomachMult *
      plantLoverMult
  );

  // ── Happiness ──
  const matchedLikes = npc.wants.filter((want) => {
    const tag = PREFERENCE_TAG[want];
    return tag !== undefined && food.tags.includes(tag);
  }).length;
  const preferenceMultiplier = 1 + 0.25 * matchedLikes;

  const sameCategoryCount = priorFoods.filter((f) => f.category === food.category).length;
  let varietyMultiplier = Math.max(0.4, 1 - 0.18 * sameCategoryCount);
  if (npc.wants.includes("likes_variety") && sameCategoryCount === 0) {
    varietyMultiplier *= 1.15;
  }

  const treatsMultiplier =
    (isTreatLike(food) ? s.happinessFromTreatsMultiplier : 1) *
    (isTreatLike(food) && hasPowerUp(powerUps, "treat_whisperer") ? 1.25 : 1);
  const equipmentMultiplier = equipmentMismatch ? (campChef ? 0.75 : 0.5) : 1;
  const restrictionPenalty = mustNotViolation ? 15 : 0;

  const happinessGain =
    food.baseHappiness *
      happinessQuality *
      preferenceMultiplier *
      varietyMultiplier *
      treatsMultiplier *
      equipmentMultiplier *
      plantLoverMult -
    restrictionPenalty;

  // Label Reader: shrinkflation only stings a quarter
  const shrinkMult = shrinkflated
    ? hasPowerUp(powerUps, "label_reader")
      ? 0.75
      : SHRINKFLATION_MULTIPLIER
    : 1;

  return {
    nutritionGain: Math.round(nutritionGain * shrinkMult * 10) / 10,
    happinessGain: Math.round(happinessGain * shrinkMult * 10) / 10,
    equipmentMismatch,
    mustNotViolation,
    repetitionApplied: sameCategoryCount >= 2,
  };
}
