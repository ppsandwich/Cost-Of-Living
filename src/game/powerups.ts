import type { PowerUpId } from "@/data/powerups";
import { POWER_UPS } from "@/data/powerups";
import type { RNG } from "./seededRandom";

export function hasPowerUp(powerUps: PowerUpId[], id: PowerUpId): boolean {
  return powerUps.includes(id);
}
export function powerUpPriceMultiplier(p: PowerUpId[]): number {
  return p.includes("haggler") ? 0.9 : 1;
}
export function powerUpExtraSeconds(p: PowerUpId[]): number {
  return p.includes("timewalker") ? 20 : 0;
}
export function powerUpExtraBudgetCents(p: PowerUpId[]): number {
  return p.includes("deep_pockets") ? 200 : 0;
}
export function powerUpInventoryMultiplier(p: PowerUpId[]): number {
  return p.includes("superstore") ? 1.3 : 1;
}
export function powerUpExtraSpecials(p: PowerUpId[]): number {
  return p.includes("coupon_clipper") ? 2 : 0;
}

export function drawPowerUps(
  rng: RNG,
  exclude: PowerUpId[],
  count: number,
): PowerUpId[] {
  const picks: PowerUpId[] = [];
  let pool = POWER_UPS.filter((p) => !exclude.includes(p.id));
  while (picks.length < count && pool.length) {
    const weights = pool.map((p) => (p.rarity === "rare" ? 0.35 : 1));
    let roll = rng() * weights.reduce((a, b) => a + b, 0);
    let index = 0;
    while (index < pool.length - 1 && (roll -= weights[index]) > 0) index++;
    picks.push(pool[index].id);
    pool = pool.filter((_, i) => i !== index);
  }
  return picks;
}
