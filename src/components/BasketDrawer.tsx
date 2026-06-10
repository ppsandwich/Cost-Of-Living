import { useState } from "react";
import type { NPC, NutritionStats } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { getRequirementsStatus } from "@/game/requirements";
import { formatCents } from "@/utils/money";

interface BasketDrawerProps {
  basket: BasketItem[];
  stats: NutritionStats;
  npc: NPC;
  roundBudgetCents: number;
  remainingBudgetCents: number;
  onRemove: (foodItemId: string) => void;
  onAdd: (foodItemId: string) => void;
}

export function BasketDrawer({
  basket,
  stats,
  npc,
  roundBudgetCents,
  remainingBudgetCents,
  onRemove,
  onAdd,
}: BasketDrawerProps) {
  const [open, setOpen] = useState(false);
  const itemCount = basket.reduce((n, b) => n + b.quantity, 0);
  const spent = roundBudgetCents - remainingBudgetCents;
  const needNutrition = Math.max(0, Math.ceil(npc.nutritionTarget - stats.nutrition));
  const needHappiness = Math.max(0, Math.ceil(npc.happinessTarget - stats.happiness));
  const requirements = getRequirementsStatus(basket, npc);
  const listDone =
    requirements.wants.filter((w) => w.satisfied).length + (requirements.mustNotViolated ? 0 : 1);

  return (
    <div className="border-t-[3px] border-ink bg-receipt shadow-[0_-4px_12px_rgba(51,36,28,0.2)] lg:rounded-2xl lg:border-[3px] lg:shadow-[4px_4px_0_rgba(51,36,28,0.25)]">
      {open && (
        <div className="max-h-[45vh] overflow-y-auto border-b-2 border-dashed border-ink/25 px-3 py-2 lg:max-h-none">
          <h2 className="text-center font-pixel text-lg uppercase tracking-widest text-faded">
            ··· your receipt ···
          </h2>
          {basket.length === 0 ? (
            <p className="py-2 text-center text-sm font-semibold text-faded">
              Nothing yet. The shelves await.
            </p>
          ) : (
            <ul className="divide-y divide-dashed divide-ink/15">
              {basket.map((entry) => {
                const food = FOOD_BY_ID[entry.foodItemId];
                if (!food) return null;
                return (
                  <li key={entry.foodItemId} className="flex items-center gap-2 py-1.5">
                    <span aria-hidden className="text-lg">
                      {food.emoji}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-pixel text-lg leading-none">
                      {food.name}
                    </span>
                    <span className="font-pixel text-lg leading-none tabular-nums text-faded">
                      {formatCents(entry.pricePaidCents)}×{entry.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(entry.foodItemId)}
                      className="btn grid size-11 place-items-center bg-paper text-lg"
                      aria-label={`Remove one ${food.name}`}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdd(entry.foodItemId)}
                      className="btn grid size-11 place-items-center bg-paper text-lg"
                      aria-label={`Add one more ${food.name}`}
                    >
                      +
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5 font-pixel text-base leading-tight text-faded">
            <span>🥦 {Math.round(stats.nutrition)}/{npc.nutritionTarget}</span>
            <span>😊 {Math.round(stats.happiness)}/{npc.happinessTarget}</span>
            <span>cal {stats.calories}</span>
            <span>sugar {stats.sugar}</span>
            <span>fat {stats.fat}</span>
          </div>
        </div>
      )}

      <div className="px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="btn flex min-h-12 w-full items-center justify-between gap-2 bg-paper px-2.5 text-left"
        >
          <span className="min-w-0">
            <span className="block truncate font-display text-sm leading-tight">
              🧺 {itemCount} item{itemCount === 1 ? "" : "s"} · {formatCents(spent)} ·{" "}
              {formatCents(remainingBudgetCents)} left
            </span>
            <span className="block truncate font-sans text-xs font-bold leading-tight text-faded">
              needs 🥦 {needNutrition} · 😊 {needHappiness} ·{" "}
              <span className={requirements.mustNotViolated ? "text-danger" : ""}>
                📋 {listDone}/3
              </span>{" "}
              — fills up, checks out
            </span>
          </span>
          <span aria-hidden className="font-display text-faded">
            {open ? "▼" : "▲"}
          </span>
        </button>
      </div>
    </div>
  );
}
