import { useMemo } from "react";
import type { BasketItem } from "@/types/game";
import type { NPC } from "@/types/npc";
import { assessTaste, tastePoints, tasteExplanation } from "@/game/taste";

export function TasteFeedback({ basket, npc, compact = false }: { basket: BasketItem[]; npc: NPC; compact?: boolean }) {
  const taste = useMemo(() => assessTaste(basket, npc), [basket, npc]);
  if (compact && basket.length === 0) return null;
  const points = tastePoints(taste);
  const label = taste.quality === "tasty" ? "Tasty meal!" : taste.quality === "dubious" ? "Dubious food" : "Taste goal: 3–4 matching ingredients";
  return <div className={`taste-feedback taste-feedback-${taste.quality} ${compact ? "taste-feedback-compact" : ""}`}>
    <p role="status"><strong>{label}</strong>{points !== 0 && <span> · {points > 0 ? "+" : "−"}{Math.abs(points)} {compact ? "points" : "taste points"}</span>}</p>
    {!compact && <p>{tasteExplanation(taste)}</p>}
  </div>;
}
