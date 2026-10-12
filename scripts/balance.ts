import { POWER_UP_STOPS } from "../src/game/shops";
/**
 * Solvability check (PRD §29.1 + the round-20 guarantee).
 *
 * Every round from 1 to 20 must have at least one clearing combination.
 * Round generation certifies this itself (reshuffling shelves, then
 * adding rescue money); this script verifies the guarantee holds across
 * NPCs, rounds, seeds and accumulated power-ups, and reports how much
 * rescue money the generator needed — the honest measure of how hard
 * each round's economy is before the safety net kicks in.
 *
 * Run: npm run balance
 */
import { NPCS } from "../src/data/npcs";
import type { PowerUpId } from "../src/data/powerups";
import {
  drawPowerUps,
  powerUpExtraBudgetCents,
} from "../src/game/powerups";
import { budgetHeadroomForRound, npcForRound, FINAL_ROUND } from "../src/game/progression";
import { canClear, generateSolvableRound } from "../src/game/solver";
import { createRng } from "../src/game/seededRandom";
import type { NPC } from "../src/types/npc";

const ROUNDS = Array.from({ length: FINAL_ROUND }, (_, i) => i + 1);
const SEEDS_PER_CELL = 25;

interface CellResult {
  solvable: boolean;
  rescueRatio: number;
}

function simulate(
  baseNpc: NPC,
  roundNumber: number,
  seed: number,
  withUpgrades = true,
): CellResult {
  // Sample the number of power-ups earned at earlier trail stops.
  const powerUps: PowerUpId[] = drawPowerUps(
    createRng((seed ^ 0x51ed) >>> 0),
    [],
    withUpgrades ? POWER_UP_STOPS.filter((stop) => stop < roundNumber).length : 0,
  );
  const npc = npcForRound(baseNpc, roundNumber);
  const budget =
    npc.baseBudgetCents +
    powerUpExtraBudgetCents(powerUps);
  const round = generateSolvableRound(npc, budget, seed, roundNumber, powerUps);
  return {
    solvable: canClear(npc, round.inventory, Math.floor(round.referenceCostCents * budgetHeadroomForRound(roundNumber)) + powerUpExtraBudgetCents(powerUps)),
    rescueRatio: budget > 0 ? round.rescueCents / budget : 0,
  };
}

let failures = 0;
console.log(
  `Solvability and avg rescue money by NPC and round (${SEEDS_PER_CELL} seeds/cell):\n`,
);
const shownRounds = ROUNDS.filter((r) => r % 2 === 1 || r === FINAL_ROUND);
console.log(
  "NPC".padEnd(9) +
    shownRounds.map((r) => `r${r}`.padStart(6)).join("") +
    "   (avg rescue %, ✗ = unsolvable seed)",
);
for (const npc of NPCS) {
  let row = npc.id.padEnd(9);
  for (const roundNumber of ROUNDS) {
    let unsolvable = 0;
    let rescueSum = 0;
    for (let s = 0; s < SEEDS_PER_CELL; s++) {
      const result = simulate(npc, roundNumber, 1000 + s * 7919);
      if (!result.solvable) unsolvable++;
      if (!simulate(npc, roundNumber, 1000 + s * 7919, false).solvable)
        unsolvable++;
      rescueSum += result.rescueRatio;
    }
    if (unsolvable > 0) failures++;
    if (roundNumber % 2 === 1 || roundNumber === FINAL_ROUND) {
      const rescuePercent = Math.round((rescueSum / SEEDS_PER_CELL) * 100);
      row += `${unsolvable > 0 ? "✗" : ""}${rescuePercent}%`.padStart(6);
    }
  }
  console.log(row);
}

console.log(
  failures === 0
    ? "\n✅ Every round 1-20 is provably clearable for every NPC."
    : `\n⚠️  ${failures} cell(s) had unsolvable rounds — the guarantee is broken.`,
);
process.exit(failures === 0 ? 0 : 1);
