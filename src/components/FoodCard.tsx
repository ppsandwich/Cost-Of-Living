import { useState } from "react";
import type { FoodItem } from "@/types/food";
import type { StoreItem } from "@/types/game";
import type { ItemImpact } from "@/game/applyFoodItem";
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

/** Cheap prices tag green, blending to orange as they climb. */
function priceColor(cents: number): string {
  const t = Math.min(1, Math.max(0, (cents - 150) / (500 - 150)));
  return `color-mix(in oklab, #e0760f ${Math.round(t * 100)}%, var(--color-good))`;
}

/** Tiny inline bar showing a gain's size at a glance. */
function GainBar({ value, max, barClass }: { value: number; max: number; barClass: string }) {
  const width = Math.min(1, Math.abs(value) / max) * 100;
  return (
    <span
      aria-hidden
      className="inline-block h-1.5 w-10 shrink-0 overflow-hidden rounded-full border border-ink/15 bg-ink/10"
    >
      <span className={`block h-full rounded-full ${barClass}`} style={{ width: `${width}%` }} />
    </span>
  );
}

interface FoodCardProps {
  food: FoodItem;
  storeItem: StoreItem;
  impact: ItemImpact;
  inBasket: number;
  remainingQuantity: number;
  affordable: boolean;
  /** NPC wants this food matches, e.g. Salty/Sweet, with tick state. */
  wantMatches: WantMatch[];
  /** Set when the food crosses the NPC's dietary line — shown loudly. */
  mustNotLabel: string | null;
  onAdd: () => void;
}

export function FoodCard({
  food,
  storeItem,
  impact,
  inBasket,
  remainingQuantity,
  affordable,
  wantMatches,
  mustNotLabel,
  onAdd,
}: FoodCardProps) {
  const [expanded, setExpanded] = useState(false);
  const soldOut = remainingQuantity <= 0;
  const forbidden = mustNotLabel !== null;
  const buyable = affordable && !soldOut && !forbidden;

  // show: worth mentioning · hot: red flag for the danger thresholds
  const macroBits = [
    { value: food.calories, text: `${food.calories} cal`, show: food.calories >= 400, hot: food.calories >= 700 },
    { value: food.fat, text: `${food.fat} fat`, show: food.fat >= 15, hot: food.fat >= 35 },
    { value: food.sugar, text: `${food.sugar} sugar`, show: food.sugar >= 25, hot: food.sugar >= 50 },
    { value: food.carbs, text: `${food.carbs} carbs`, show: food.carbs >= 60, hot: food.carbs >= 100 },
    { value: food.sodium ?? 0, text: `${food.sodium} salt`, show: (food.sodium ?? 0) >= 40, hot: (food.sodium ?? 0) >= 55 },
  ].filter((m) => m.show);

  return (
    <li
      className={`panel relative overflow-hidden p-2.5 ${forbidden ? "panel-danger" : ""} ${
        buyable || forbidden ? "" : "opacity-55 grayscale-[0.6]"
      }`}
    >
      {forbidden && (
        <div
          role="alert"
          className="-mx-2.5 -mt-2.5 mb-2 flex items-center gap-1.5 bg-danger px-3 py-1 font-display text-xs uppercase tracking-wide text-white"
        >
          <span aria-hidden>🚫</span> Can&apos;t eat: {mustNotLabel}
        </div>
      )}
      {storeItem.specialLabel && (
        <span className="sticker absolute left-9 top-[-2px] z-10 rounded-md bg-brand px-1.5 py-0.5 font-display text-[10px] uppercase tracking-wide text-white">
          {storeItem.specialLabel}
        </span>
      )}
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-ink/15 bg-paper text-3xl"
        >
          {food.emoji}
        </span>
        <button
          type="button"
          className="min-h-11 min-w-0 flex-1 text-left"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={`${food.name}, ${formatCents(storeItem.currentPriceCents)}. Details`}
        >
          <div className="truncate font-display text-sm leading-tight">{food.name}</div>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className={impact.nutritionGain > 0 ? "text-good" : "text-faded"}>
              🥦 +{impact.nutritionGain}
            </span>
            <GainBar
              value={impact.nutritionGain}
              max={40}
              barClass={impact.nutritionGain > 0 ? "bg-good" : "bg-faded"}
            />
            <span className={impact.happinessGain >= 0 ? "text-happy" : "text-danger"}>
              😊 {impact.happinessGain >= 0 ? "+" : ""}
              {impact.happinessGain}
            </span>
            <GainBar
              value={impact.happinessGain}
              max={30}
              barClass={impact.happinessGain >= 0 ? "bg-happy" : "bg-danger"}
            />
          </div>
          {!forbidden && wantMatches.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {wantMatches.map((match) => (
                <span
                  key={match.label}
                  className={`rounded-md border-2 px-1 py-px font-display text-[10px] uppercase leading-tight ${
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
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 font-pixel text-sm leading-none text-faded">
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
          <span
            className="price-tag px-1.5 py-0.5 text-xl tabular-nums text-white"
            style={{ background: priceColor(storeItem.currentPriceCents) }}
          >
            {formatCents(storeItem.currentPriceCents)}
          </span>
          <button
            type="button"
            onClick={onAdd}
            disabled={!buyable}
            className={`btn min-h-11 min-w-[4.5rem] px-2 text-sm uppercase text-white ${
              forbidden ? "bg-danger" : "bg-brand"
            }`}
            aria-label={
              forbidden
                ? `${food.name} — they can't eat this`
                : soldOut
                  ? `${food.name} sold out`
                  : !affordable
                    ? `${food.name} unaffordable`
                    : `Add ${food.name} for ${formatCents(storeItem.currentPriceCents)}`
            }
          >
            {forbidden
              ? "Can't eat"
              : soldOut
                ? "Gone"
                : affordable
                  ? inBasket > 0
                    ? `Add ·${inBasket}`
                    : "Add"
                  : "Too dear"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 border-t-2 border-dashed border-ink/20 pt-2 text-xs">
          <p className="font-semibold italic">{food.flavour}</p>
          {forbidden && (
            <p className="mt-1 font-bold text-danger">⚠ {mustNotLabel} The till won&apos;t even ring it up.</p>
          )}
          {!forbidden && impact.equipmentMismatch && (
            <p className="mt-1 font-bold text-danger">
              ⚠ They don&apos;t have the kit to cook this properly.
            </p>
          )}
          <dl className="mt-1.5 grid grid-cols-3 gap-x-2 gap-y-1 font-pixel text-base leading-tight text-faded">
            <div className={hotPill(food.calories >= 700)}>cals {food.calories}</div>
            <div>protein {food.protein}</div>
            <div className={hotPill(food.fat >= 35)}>fat {food.fat}</div>
            <div className={hotPill(food.sugar >= 50)}>sugar {food.sugar}</div>
            <div className={hotPill(food.carbs >= 100)}>carbs {food.carbs}</div>
            <div>fibre {food.fibre}</div>
            <div>vits {food.vitamins}</div>
            <div>minerals {food.minerals}</div>
            <div className={hotPill((food.sodium ?? 0) >= 55)}>salt {food.sodium ?? 0}</div>
          </dl>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {food.tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-ink/20 bg-paper px-1.5 py-0.5 text-[10px] font-bold text-faded"
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
