import { useState } from "react";
import type { FoodItem } from "@/types/food";
import type { StoreItem } from "@/types/game";
import type { ItemImpact } from "@/game/applyFoodItem";
import type { ZeroedMacros } from "@/game/powerups";
import { formatCents } from "@/utils/money";

interface WantMatch {
  label: string;
  emoji: string;
  satisfied: boolean;
}

/** Red pill treatment for dangerously high macro values. */
function hotPill(hot: boolean): string {
  return hot ? "w-fit rounded-md bg-danger px-1 py-0.5 font-bold text-white" : "";
}

interface FoodCardProps {
  food: FoodItem;
  storeItem: StoreItem;
  impact: ItemImpact;
  inBasket: number;
  remainingQuantity: number;
  /** NPC wants this food matches, e.g. Salty/Sweet, with tick state. */
  wantMatches: WantMatch[];
  /** Macros erased by power-ups (Sugar Free etc.). */
  zeroed: ZeroedMacros;
  /** Set when the food crosses the NPC's dietary line. */
  mustNotLabel: string | null;
  /** Training Wheels: adding this would cross a macro limit. */
  blockedByLimits: boolean;
  /** Bulk Buyer: a one-shot bonus add is available for this item. */
  canBulkAdd: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onBulkAdd: () => void;
}

export function FoodCard({
  food,
  storeItem,
  impact,
  inBasket,
  remainingQuantity,
  wantMatches,
  zeroed,
  mustNotLabel,
  blockedByLimits,
  canBulkAdd,
  onAdd,
  onRemove,
  onBulkAdd,
}: FoodCardProps) {
  const [expanded, setExpanded] = useState(false);
  const soldOut = remainingQuantity <= 0;
  const forbidden = mustNotLabel !== null;
  const inBasketMode = inBasket > 0;
  const buyable = !soldOut && !forbidden && !blockedByLimits;

  // power-ups can erase a macro from every item
  const fat = zeroed.fat ? 0 : food.fat;
  const sugar = zeroed.sugar ? 0 : food.sugar;
  const carbs = zeroed.carbs ? 0 : food.carbs;

  // show: worth mentioning · hot: red flag for the danger thresholds
  const macroBits = [
    { value: food.calories, text: `${food.calories} cal`, show: food.calories >= 400, hot: food.calories >= 700 },
    { value: fat, text: `${fat} fat`, show: fat >= 15, hot: fat >= 35 },
    { value: sugar, text: `${sugar} sugar`, show: sugar >= 25, hot: sugar >= 50 },
    { value: carbs, text: `${carbs} carbs`, show: carbs >= 60, hot: carbs >= 100 },
    { value: food.sodium ?? 0, text: `${food.sodium} salt`, show: (food.sodium ?? 0) >= 40, hot: (food.sodium ?? 0) >= 55 },
  ].filter((m) => m.show);

  return (
    <li
      className={`panel relative overflow-hidden p-2.5 ${
        buyable || inBasketMode ? "" : "opacity-55 grayscale-[0.6]"
      }`}
    >
      {forbidden && (
        <div
          role="alert"
          className="-mx-2.5 -mt-2.5 mb-2 flex items-center gap-1.5 bg-faded px-3 py-1 font-display text-xs uppercase tracking-wide text-white"
        >
          <span aria-hidden>🚫</span> Can&apos;t eat: {mustNotLabel}
        </div>
      )}
      {storeItem.specialLabel && (
        <span
          className={`sticker absolute left-9 top-[-2px] z-10 rounded-md px-1.5 py-0.5 font-display text-[11.5px] uppercase tracking-wide text-white ${
            storeItem.shrinkflated ? "bg-brand" : "bg-good"
          }`}
        >
          {storeItem.specialLabel}
        </span>
      )}
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="relative grid size-12 shrink-0 place-items-center rounded-xl border-2 border-ink/15 bg-paper text-3xl"
        >
          <span
            className={
              food.variant === "expired"
                ? "[filter:grayscale(1)_sepia(0.6)_brightness(0.85)]"
                : ""
            }
          >
            {food.emoji}
          </span>
          {food.variant === "premium" && (
            <span className="absolute -right-1.5 -top-1.5 text-base drop-shadow-[1px_1px_0_rgba(51,36,28,0.4)]">
              ✨
            </span>
          )}
        </span>
        <button
          type="button"
          className="min-h-11 min-w-0 flex-1 text-left"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={`${food.name}, ${formatCents(storeItem.currentPriceCents)}. Details`}
        >
          <div className="truncate font-display text-sm leading-tight">{food.name}</div>
          <div className="text-xs font-bold">
            <span className={impact.nutritionGain > 0 ? "text-good" : "text-faded"}>
              🥦 +{Math.round(impact.nutritionGain)}
            </span>{" "}
            <span className={impact.happinessGain >= 0 ? "text-happy" : "text-danger"}>
              😊 {impact.happinessGain >= 0 ? "+" : ""}
              {Math.round(impact.happinessGain)}
            </span>
          </div>
          {!forbidden && wantMatches.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {wantMatches.map((match) => (
                <span
                  key={match.label}
                  className={`rounded-md border-2 px-1 py-px font-display text-[11.5px] uppercase leading-tight ${
                    match.satisfied
                      ? "border-ink/20 bg-paper text-faded"
                      : "border-ink bg-good text-white shadow-[1px_1px_0_rgba(51,36,28,0.3)]"
                  }`}
                  title={
                    match.satisfied
                      ? `${match.label}: already ticked`
                      : `Ticks "${match.label}" on the shopping list`
                  }
                >
                  <span aria-hidden>{match.emoji}</span> {match.label}
                  {match.satisfied ? " ✓" : ""}
                </span>
              ))}
            </div>
          )}
          {macroBits.length > 0 && (
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-bold leading-none text-faded">
              {macroBits.map((m) => (
                <span
                  key={m.text}
                  className={m.hot ? "rounded-md bg-danger px-1 py-0.5 font-bold text-white" : ""}
                >
                  {m.text}
                </span>
              ))}
            </div>
          )}
        </button>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="text-lg font-extrabold leading-none tabular-nums text-ink">
            {formatCents(storeItem.currentPriceCents)}
          </span>
          <div className="flex items-center gap-1">
          {inBasketMode && canBulkAdd && (
            <button
              type="button"
              onClick={onBulkAdd}
              className="btn min-h-11 bg-good px-2 text-xs uppercase text-white"
              aria-label={`Bulk Buyer: add one more ${food.name}`}
              title="Bulk Buyer: once per item per round"
            >
              📦 One more
            </button>
          )}
          <button
            type="button"
            onClick={inBasketMode ? onRemove : onAdd}
            disabled={!inBasketMode && !buyable}
            className={`btn min-h-11 min-w-[4.5rem] px-2 text-sm uppercase text-white ${
              inBasketMode ? "bg-ink" : forbidden ? "bg-faded" : "bg-brand"
            }`}
            aria-label={
              inBasketMode
                ? `Remove one ${food.name} from the basket`
                : forbidden
                  ? `${food.name} — they can't eat this`
                  : soldOut
                    ? `${food.name} sold out`
                    : blockedByLimits
                      ? `${food.name} — would cross a macro limit`
                      : `Add ${food.name} for ${formatCents(storeItem.currentPriceCents)}`
            }
          >
            {inBasketMode
              ? "Remove"
              : forbidden
                ? "Can't eat"
                : soldOut
                  ? "Gone"
                  : blockedByLimits
                    ? "Over limit"
                    : "Add"}
          </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 border-t-2 border-dashed border-ink/20 pt-2 text-xs">
          <p className="font-semibold italic">{food.flavour}</p>
          {storeItem.shrinkflated && (
            <p className="mt-1 font-bold text-brand-dark">
              📉 Shrinkflated: same price, half the nutrition and happiness.
            </p>
          )}
          {forbidden && (
            <p className="mt-1 font-bold text-faded">⚠ {mustNotLabel} The till won&apos;t even ring it up.</p>
          )}
          {!forbidden && impact.equipmentMismatch && (
            <p className="mt-1 font-bold text-danger">
              ⚠ They don&apos;t have the kit to cook this properly.
            </p>
          )}
          <dl className="mt-1.5 grid grid-cols-3 gap-x-2 gap-y-1 text-xs font-semibold leading-tight text-faded">
            <div className={hotPill(food.calories >= 700)}>cals {food.calories}</div>
            <div>protein {food.protein}</div>
            <div className={hotPill(fat >= 35)}>fat {fat}</div>
            <div className={hotPill(sugar >= 50)}>sugar {sugar}</div>
            <div className={hotPill(carbs >= 100)}>carbs {carbs}</div>
            <div>fibre {food.fibre}</div>
            <div>vits {food.vitamins}</div>
            <div>minerals {food.minerals}</div>
            <div className={hotPill((food.sodium ?? 0) >= 55)}>salt {food.sodium ?? 0}</div>
          </dl>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {food.tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-ink/20 bg-paper px-1.5 py-0.5 text-[11.5px] font-bold text-faded"
              >
                {tag.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
