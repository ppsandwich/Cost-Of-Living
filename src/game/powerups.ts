import type { DangerThresholds } from "@/types/npc";
import type { PowerUpId } from "@/data/powerups";
import { POWER_UPS } from "@/data/powerups";
import type { RNG } from "./seededRandom";

export function hasPowerUp(powerUps: PowerUpId[], id: PowerUpId): boolean {
  return powerUps.includes(id);
}

/** Haggler: everything 10% cheaper. */
export function powerUpPriceMultiplier(powerUps: PowerUpId[]): number {
  return hasPowerUp(powerUps, "haggler") ? 0.9 : 1;
}

/** Timewalker: longer rounds. */
export function powerUpExtraSeconds(powerUps: PowerUpId[]): number {
  return hasPowerUp(powerUps, "timewalker") ? 20 : 0;
}

/** Deep Pockets: a little more money each round. */
export function powerUpExtraBudgetCents(powerUps: PowerUpId[]): number {
  return hasPowerUp(powerUps, "deep_pockets") ? 200 : 0;
}

/** Sweet Tooth / Cast-Iron Arteries / Carb Loading: raised limits. */
export function adjustThresholds(
  thresholds: DangerThresholds,
  powerUps: PowerUpId[]
): DangerThresholds {
  return {
    ...thresholds,
    sugarMax: Math.round(
      thresholds.sugarMax * (hasPowerUp(powerUps, "sweet_tooth") ? 1.25 : 1)
    ),
    fatMax: Math.round(
      thresholds.fatMax * (hasPowerUp(powerUps, "cast_iron_arteries") ? 1.25 : 1)
    ),
    carbsMax: Math.round(
      thresholds.carbsMax * (hasPowerUp(powerUps, "carb_loading") ? 1.25 : 1)
    ),
  };
}

/** Sugar Free / Zero Carb / Fat Free: those macros vanish from all items. */
export interface ZeroedMacros {
  sugar: boolean;
  carbs: boolean;
  fat: boolean;
}

export function zeroedMacros(powerUps: PowerUpId[]): ZeroedMacros {
  return {
    sugar: hasPowerUp(powerUps, "sugar_free"),
    carbs: hasPowerUp(powerUps, "zero_carb"),
    fat: hasPowerUp(powerUps, "fat_free"),
  };
}

/** Superstore: a bigger shop. */
export function powerUpInventoryMultiplier(powerUps: PowerUpId[]): number {
  return hasPowerUp(powerUps, "superstore") ? 1.3 : 1;
}

/** Bulk Buyer: one more of everything. */
export function powerUpQuantityBonus(powerUps: PowerUpId[]): number {
  return hasPowerUp(powerUps, "bulk_buyer") ? 1 : 0;
}

/** Coupon Clipper: more discount stickers. */
export function powerUpExtraSpecials(powerUps: PowerUpId[]): number {
  return hasPowerUp(powerUps, "coupon_clipper") ? 2 : 0;
}

/** Shoplifter: chance the first add of an item counts double. */
export const SHOPLIFTER_CHANCE = 0.2;

/** Rare power-ups show up about a third as often as common ones. */
const RARE_WEIGHT = 0.35;

/** Draw distinct power-ups, rarity-weighted, excluding those already owned. */
export function drawPowerUps(rng: RNG, exclude: PowerUpId[], count: number): PowerUpId[] {
  const picks: PowerUpId[] = [];
  let pool = POWER_UPS.filter((p) => !exclude.includes(p.id));
  while (picks.length < count && pool.length > 0) {
    const weights = pool.map((p) => (p.rarity === "rare" ? RARE_WEIGHT : 1));
    let roll = rng() * weights.reduce((a, b) => a + b, 0);
    let index = 0;
    while (index < pool.length - 1 && (roll -= weights[index]) > 0) index++;
    picks.push(pool[index].id);
    pool = pool.filter((_, i) => i !== index);
  }
  return picks;
}
