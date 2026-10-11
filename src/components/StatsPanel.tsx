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
    <section aria-label="Lunch components">
      <h2 className="mb-1 font-display text-sm">The lunch brief</h2>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold">
        {MEAL_ROLES.map((role) => (
          <li key={role} className={coverage[role] ? "text-good" : "text-ink"}>
            <span aria-hidden>{coverage[role] ? "✓" : "○"}</span>{" "}
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
