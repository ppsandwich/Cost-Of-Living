import type { NPC } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { mealCoverage, MEAL_LABELS, MEAL_ROLES } from "@/game/meals";
export function StatsPanel({
  npc,
  basket,
}: {
  npc: NPC;
  basket: BasketItem[];
}) {
  const coverage = mealCoverage(basket, npc);
  return (
    <section aria-label="Parts of lunch">
      <h2 className="mb-1 font-display text-sm">Lunch checklist</h2>
      <ul className="flex flex-wrap gap-1.5 text-xs font-bold">
        {MEAL_ROLES.map((role) => (
          <li key={role} className={`meal-chip ${coverage[role] ? "meal-chip-covered" : ""}`}>
            <span key={String(coverage[role])} className={coverage[role] ? "check-stamp inline-block" : ""} aria-hidden>{coverage[role] ? "✓" : "○"}</span>{" "}
            {MEAL_LABELS[role]}
            <span className="sr-only">
              {coverage[role] ? ": covered" : ": still needed"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
