import { useState } from "react";
import type { FoodItem } from "@/types/food";
import type { StoreItem } from "@/types/game";
import { mealRoles, MEAL_LABELS } from "@/game/meals";
import { formatCents } from "@/utils/money";
import { MEAL_ICONS } from "./StatsPanel";
import { AISLE_LABEL } from "@/data/labels";

const TASTE_TAGS = [
  { tag: "sweet", label: "Sweet", emoji: "🍬" },
  { tag: "salty", label: "Salty", emoji: "🧂" },
  { tag: "fresh", label: "Fresh", emoji: "🌿" },
  { tag: "comfort", label: "Comfort", emoji: "🛋️" },
  { tag: "spicy", label: "Spicy", emoji: "🌶️" },
  { tag: "crunchy", label: "Crunchy", emoji: "🥨" },
  { tag: "family_friendly", label: "Familiar", emoji: "🏠" },
] as const;
interface FoodCardProps {
  food: FoodItem;
  storeItem: StoreItem;
  inBasket: number;
  remainingQuantity: number;
  wantMatches: string[];
  unavailable: string | null;
  canShop: boolean;
  showPrice?: boolean;
  showAisle?: boolean;
  priceHint: string | null;
  onAdd: () => void;
  onRemove: () => void;
}
export function FoodCard({
  food,
  storeItem,
  inBasket,
  remainingQuantity,
  wantMatches,
  unavailable,
  canShop,
  showPrice = true,
  showAisle = false,
  priceHint,
  onAdd,
  onRemove,
}: FoodCardProps) {
  const [expanded, setExpanded] = useState(false);
  const buyable = canShop && remainingQuantity > 0;
  const removeInstead = inBasket > 0;
  const roles = mealRoles(food);
  const tasteTags = TASTE_TAGS.filter(({ tag }) => food.tags.includes(tag));
  return (
    <li
      className={`panel food-card product-card relative p-3 ${inBasket ? unavailable ? "food-card-unsuitable" : "food-card-selected" : ""}`}
    >
      <div className="product-top">
        <span key={inBasket} aria-hidden className={`food-icon product-art ${inBasket ? "check-stamp" : ""}`}>
          {food.emoji}
        </span>
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={`${food.name}${showPrice ? `, ${formatCents(storeItem.currentPriceCents)}` : ""}. Details`}
          className="product-info min-h-11 min-w-0 text-left"
        >
          <span className="block font-display text-base leading-tight">{food.name}</span>
          <span className="block text-xs text-faded">
            {roles.length
              ? roles.map((r) => `${MEAL_ICONS[r]} ${r === "produce" ? "Fruit / veg" : r === "base" ? "Base" : "Protein"}`).join(" · ")
              : food.tags.includes("seasoning") ? "Flavour extra" : "An extra"}
          </span>
        </button>
        <div className="product-controls">
          {showPrice && <span className={`price-ticket ${storeItem.onSale ? "price-ticket-sale" : ""} shrink-0 font-display text-lg tabular-nums`}>
            {formatCents(storeItem.currentPriceCents)}
          </span>}
          {canShop && <button
            onClick={removeInstead ? onRemove : onAdd}
            disabled={removeInstead ? !canShop : !buyable}
            aria-label={removeInstead ? `Remove ${food.name}` : `Add ${food.name}`}
            className={`product-action btn min-h-11 px-2 text-sm ${removeInstead ? "bg-paper text-ink" : "bg-good text-white"}`}
          >
            {removeInstead ? "Remove" : "Add"}
          </button>}
        </div>
      </div>
      {unavailable && (
        <p className="mt-2 text-xs font-bold text-faded">
          Food to avoid: {unavailable}
        </p>
      )}
      {showAisle && <p className="product-aisle">Aisle: {AISLE_LABEL[food.category]}</p>}
      {showPrice && storeItem.specialLabel && (
        <span className={`sticker mt-2 inline-block rounded ${storeItem.onSale ? "bg-tag" : "bg-white"} px-2 py-0.5 text-xs font-bold`}>
          {storeItem.specialLabel}
        </span>
      )}
      {showPrice && priceHint && (
        <p className="mt-2 text-xs font-bold text-good">🔎 {priceHint}</p>
      )}
      {tasteTags.length > 0 && <div className="mt-2 flex flex-wrap gap-2" aria-label="Taste tags">
        {tasteTags.map(({ tag, label, emoji }) => (
          <span
            key={tag}
            className={`taste-badge taste-${tag} ${wantMatches.includes(label) && !unavailable ? "taste-match" : ""}`}
            title={wantMatches.includes(label) && !unavailable ? `Matches their food wish: ${label.toLowerCase()}` : label}
          >
            <span aria-hidden>{emoji}</span> {label}
            {wantMatches.includes(label) && !unavailable && <><span aria-hidden> ★</span><span className="sr-only"> — matches their food wish</span></>}
          </span>
        ))}
      </div>}
      {expanded && (
        <div className="mt-2 space-y-2 border-t-2 border-dashed border-ink/20 pt-2 text-sm">
          <p>{food.flavour}</p>
          {roles.length > 0 && <p><strong>Lunch:</strong> {roles.map((r) => MEAL_LABELS[r]).join(", ")}</p>}
          <p><strong>Aisle:</strong> {AISLE_LABEL[food.category]}</p>
          <p>
            <strong>Contains:</strong>{" "}
            {food.tags
              .filter((tag) =>
                ["meat", "pork", "dairy", "egg", "nuts"].includes(tag),
              )
              .join(", ") || "No meat, pork, dairy, egg or nuts in this game"}
            .
          </p>
          <p>
            Choose one of each food. One item can tick off more than one part of lunch.
          </p>
        </div>
      )}
      {inBasket > 0 && <p className={`mt-2 text-xs font-bold ${unavailable ? "text-danger" : "text-good"}`}>{unavailable ? "⚠ Remove: unsuitable for this customer" : "✓ In basket"}</p>}

    </li>
  );
}
