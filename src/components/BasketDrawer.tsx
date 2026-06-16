import { useState } from "react";
import type { NPC, NutritionStats } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { allRequirementsMet } from "@/game/requirements";
import { fatalStat } from "@/game/thresholds";
import { formatCents } from "@/utils/money";
import { StatsPanel } from "./StatsPanel";

interface BasketDrawerProps {
  basket: BasketItem[];
  stats: NutritionStats;
  npc: NPC;
  remainingBudgetCents: number;
  onRemove: (foodItemId: string) => void;
  onAdd: (foodItemId: string) => void;
  onCheckout: () => void;
}

export function BasketDrawer({
  basket,
  stats,
  npc,
  remainingBudgetCents,
  onRemove,
  onAdd,
  onCheckout,
}: BasketDrawerProps) {
  const [open, setOpen] = useState(false);
  const itemCount = basket.reduce((n, b) => n + b.quantity, 0);
  const overThreshold = fatalStat(stats, npc.maxThresholds) !== null;
  const overBudget = remainingBudgetCents < 0;
  const readyToWin = !overThreshold && !overBudget && allRequirementsMet(stats, basket, npc);

  return (
    <div className="border-t-[3px] border-ink bg-receipt shadow-[0_-4px_12px_rgba(51,36,28,0.2)] lg:rounded-2xl lg:border-[3px] lg:shadow-[4px_4px_0_rgba(51,36,28,0.25)]">
      {/* meters and danger trackers live with the basket now */}
      <div className="border-b-2 border-dashed border-ink/25 px-3 pb-2 pt-2.5">
        <StatsPanel stats={stats} npc={npc} basket={basket} />
      </div>

      {open && (
        <div className="max-h-[40vh] overflow-y-auto border-b-2 border-dashed border-ink/25 px-3 py-2 lg:max-h-none">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-faded">
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
                    <span className="min-w-0 flex-1 truncate text-sm font-bold leading-none">
                      {food.name}
                    </span>
                    <span className="text-sm font-bold leading-none tabular-nums text-faded">
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
        </div>
      )}

      <div className="space-y-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="btn flex min-h-12 w-full items-center justify-between gap-2 bg-paper px-2.5 text-left"
        >
          <span className="block min-w-0 truncate font-display text-lg leading-tight">
            🧺 {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
            <span className={overBudget ? "text-danger" : ""}>
              {formatCents(remainingBudgetCents)} {overBudget ? "over budget!" : "left"}
            </span>
          </span>
          <span aria-hidden className="font-display text-faded">
            {open ? "▼" : "▲"}
          </span>
        </button>

        <button
          type="button"
          onClick={onCheckout}
          disabled={!readyToWin}
          className={`btn font-knewave min-h-12 w-full text-base uppercase text-white ${
            overThreshold || overBudget ? "bg-danger" : readyToWin ? "wobble bg-good" : "bg-faded"
          }`}
          aria-label={
            readyToWin
              ? "Check out the basket"
              : "Check out — locked until every objective is met"
          }
        >
          {overThreshold || overBudget ? "⚠ Check out" : "Check out"}
        </button>
      </div>
    </div>
  );
}
