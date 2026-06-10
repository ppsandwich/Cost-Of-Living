import { useState } from "react";
import type { FoodItem } from "@/types/food";
import type { StoreItem } from "@/types/game";
import type { ItemImpact } from "@/game/applyFoodItem";
import { formatCents } from "@/utils/money";

interface FoodCardProps {
  food: FoodItem;
  storeItem: StoreItem;
  impact: ItemImpact;
  inBasket: number;
  remainingQuantity: number;
  affordable: boolean;
  onAdd: () => void;
}

export function FoodCard({
  food,
  storeItem,
  impact,
  inBasket,
  remainingQuantity,
  affordable,
  onAdd,
}: FoodCardProps) {
  const [expanded, setExpanded] = useState(false);
  const soldOut = remainingQuantity <= 0;
  const buyable = affordable && !soldOut;

  const macroBits = [
    food.calories >= 400 && `+${food.calories} cals`,
    food.fat >= 15 && `+${food.fat} fat`,
    food.sugar >= 25 && `+${food.sugar} sugar`,
    food.carbs >= 60 && `+${food.carbs} carbs`,
    (food.sodium ?? 0) >= 40 && `+${food.sodium} salt`,
  ].filter(Boolean);

  return (
    <li
      className={`rounded-xl border-2 bg-receipt p-2.5 transition-opacity ${
        buyable ? "border-ink/10" : "border-ink/5 opacity-60"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="text-2xl">
          {food.emoji}
        </span>
        <button
          type="button"
          className="min-h-11 min-w-0 flex-1 text-left"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={`${food.name}, ${formatCents(storeItem.currentPriceCents)}. Details`}
        >
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold">{food.name}</span>
            {storeItem.specialLabel && (
              <span className="sticker shrink-0 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                {storeItem.specialLabel}
              </span>
            )}
          </div>
          <div className="text-xs text-faded">
            <span className={impact.nutritionGain > 0 ? "text-good" : ""}>
              +{impact.nutritionGain} nutrition
            </span>
            {" · "}
            <span className={impact.happinessGain > 0 ? "text-happy" : "text-danger"}>
              {impact.happinessGain >= 0 ? "+" : ""}
              {impact.happinessGain} happiness
            </span>
          </div>
          {macroBits.length > 0 && (
            <div className="text-[11px] text-faded">{macroBits.join(" · ")}</div>
          )}
        </button>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-sm font-bold tabular-nums">
            {formatCents(storeItem.currentPriceCents)}
          </span>
          <button
            type="button"
            onClick={onAdd}
            disabled={!buyable}
            className="min-h-11 min-w-16 rounded-lg bg-brand px-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/20"
            aria-label={
              soldOut
                ? `${food.name} sold out`
                : affordable
                  ? `Add ${food.name} for ${formatCents(storeItem.currentPriceCents)}`
                  : `${food.name} unaffordable`
            }
          >
            {soldOut ? "None left" : affordable ? (inBasket > 0 ? `Add (${inBasket})` : "Add") : "Too dear"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 border-t border-dashed border-ink/15 pt-2 text-xs">
          <p className="italic">{food.flavour}</p>
          {(impact.equipmentMismatch || impact.restrictionViolation) && (
            <p className="mt-1 font-medium text-danger">
              {impact.restrictionViolation
                ? "They can't really eat this."
                : "They don't have the kit to cook this properly."}
            </p>
          )}
          <dl className="mt-1.5 grid grid-cols-3 gap-x-2 gap-y-0.5 font-mono text-[11px] text-faded">
            <div>cals {food.calories}</div>
            <div>protein {food.protein}</div>
            <div>fat {food.fat}</div>
            <div>sugar {food.sugar}</div>
            <div>carbs {food.carbs}</div>
            <div>fibre {food.fibre}</div>
            <div>vits {food.vitamins}</div>
            <div>minerals {food.minerals}</div>
            <div>salt {food.sodium ?? 0}</div>
          </dl>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {food.tags.slice(0, 6).map((tag) => (
              <span key={tag} className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-faded">
                {tag.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
