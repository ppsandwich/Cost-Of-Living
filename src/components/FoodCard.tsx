import { useState } from "react";
import type { FoodItem } from "@/types/food";
import type { StoreItem } from "@/types/game";
import { mealRoles, MEAL_LABELS } from "@/game/meals";
import { formatCents } from "@/utils/money";
interface FoodCardProps {
  food: FoodItem;
  storeItem: StoreItem;
  inBasket: number;
  remainingQuantity: number;
  wantMatches: string[];
  unavailable: string | null;
  canShop: boolean;
  priceHint: string | null;
  canBulkAdd: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onBulkAdd: () => void;
}
export function FoodCard({
  food,
  storeItem,
  inBasket,
  remainingQuantity,
  wantMatches,
  unavailable,
  canShop,
  priceHint,
  canBulkAdd,
  onAdd,
  onRemove,
  onBulkAdd,
}: FoodCardProps) {
  const [expanded, setExpanded] = useState(false);
  const buyable = canShop && !unavailable && remainingQuantity > 0;
  const roles = mealRoles(food);
  return (
    <li
      className={`panel relative overflow-hidden p-3 ${unavailable ? "bg-paper" : ""}`}
    >
      {unavailable && (
        <p className="mb-2 text-xs font-bold text-faded">
          Unavailable: {unavailable}
        </p>
      )}
      <div className="flex items-center gap-3">
        <span aria-hidden className="text-3xl">
          {food.emoji}
        </span>
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={`${food.name}, ${formatCents(storeItem.currentPriceCents)}. Details`}
          className="min-h-11 min-w-0 flex-1 text-left"
        >
          <span className="block font-display text-base">{food.name}</span>
          <span className="block text-xs text-faded">
            {roles.length
              ? roles.map((r) => MEAL_LABELS[r]).join(" · ")
              : "Taste or extra"}
          </span>
        </button>
        <span className="font-display text-lg tabular-nums">
          {formatCents(storeItem.currentPriceCents)}
        </span>
      </div>
      {storeItem.specialLabel && (
        <span className="mt-2 inline-block rounded bg-tag px-2 py-1 text-xs font-bold">
          {storeItem.specialLabel}
        </span>
      )}
      {priceHint && (
        <p className="mt-2 text-xs font-bold text-good">🔎 {priceHint}</p>
      )}
      {wantMatches.length > 0 && (
        <p className="mt-2 text-xs font-bold">
          Matches: {wantMatches.join(" · ")}
        </p>
      )}
      {expanded && (
        <div className="mt-2 space-y-2 border-t-2 border-dashed border-ink/20 pt-2 text-sm">
          <p>{food.flavour}</p>
          <p>
            <strong>Dietary tags:</strong>{" "}
            {food.tags
              .filter((tag) =>
                ["meat", "pork", "dairy", "egg", "nuts"].includes(tag),
              )
              .join(", ") || "None of the dietary exclusions in this game"}
            .
          </p>
          <p>
            <strong>Equipment:</strong>{" "}
            {food.requiresEquipment?.join(", ") ||
              "No cooking equipment required"}
            .
          </p>
          <p>
            One pack can cover the listed components in this shopping puzzle.
            Extra packs do not add another component.
          </p>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        <span className="min-w-0 flex-1 text-xs font-bold">
          {inBasket ? `${inBasket} in basket · ` : ""}
          {remainingQuantity} left on shelf
        </span>
        {inBasket > 0 && (
          <button
            onClick={onRemove}
            disabled={!canShop}
            aria-label={`Put back one ${food.name}`}
            className="btn size-11 bg-paper"
          >
            −
          </button>
        )}
        <button
          onClick={onAdd}
          disabled={!buyable}
          aria-label={`Add ${food.name}`}
          className="btn min-h-11 min-w-16 bg-good px-3 text-white"
        >
          Add
        </button>
        {canBulkAdd && inBasket > 0 && (
          <button
            onClick={onBulkAdd}
            disabled={!buyable}
            className="btn min-h-11 bg-tag px-2 text-xs"
            aria-label={`Group order: add one more ${food.name}`}
          >
            One more
          </button>
        )}
      </div>
    </li>
  );
}
