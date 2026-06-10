import { useState } from "react";
import type { NPC } from "@/types/npc";
import { formatCents } from "@/utils/money";

const PREFERENCE_LABEL: Record<string, string> = {
  likes_sweet_food: "Sweet tooth",
  likes_salty_food: "Likes salty",
  likes_fresh_food: "Likes fresh",
  likes_comfort_food: "Comfort eater",
  likes_spicy_food: "Likes spice",
  likes_crunchy_food: "Likes crunch",
  likes_familiar_food: "Likes familiar",
  likes_variety: "Wants variety",
  dislikes_bland_food: "Hates bland",
  dislikes_repetition: "Hates repeats",
};

const RESTRICTION_LABEL: Record<string, string> = {
  vegetarian: "Vegetarian",
  no_pork: "No pork",
  low_sugar: "Low sugar",
  low_fat: "Low fat",
  low_sodium: "Low salt",
  high_protein_need: "Needs protein",
  high_fibre_need: "Needs fibre",
  limited_cooking_equipment: "One saucepan",
  no_fridge: "No fridge",
  no_microwave: "No microwave",
};

export function NPCPanel({ npc, roundBudgetCents }: { npc: NPC; roundBudgetCents: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      aria-label={`About ${npc.name}`}
      className="rounded-xl border-2 border-ink/10 bg-receipt p-3"
    >
      <button
        type="button"
        className="flex min-h-11 w-full items-start justify-between gap-2 text-left"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <div>
          <span className="text-sm font-bold">
            <span aria-hidden>{npc.emoji}</span> {npc.name}
          </span>
          <span className="ml-1.5 text-xs text-faded">{npc.ageLabel}</span>
          <div className="text-xs text-faded">
            Budget {formatCents(roundBudgetCents)} · Needs: Nutrition {npc.nutritionTarget} /
            Happiness {npc.happinessTarget}
          </div>
        </div>
        <span aria-hidden className="mt-1 text-faded">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      <div className="mt-1 flex flex-wrap gap-1">
        {npc.preferences.map((p) => (
          <span
            key={p}
            className="rounded-full bg-happy/15 px-2 py-0.5 text-[11px] font-medium text-ink"
          >
            {PREFERENCE_LABEL[p] ?? p}
          </span>
        ))}
        {npc.restrictions.map((r) => (
          <span
            key={r}
            className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-medium text-brand-dark"
          >
            {RESTRICTION_LABEL[r] ?? r}
          </span>
        ))}
      </div>

      {expanded && (
        <div className="mt-2 space-y-1 text-xs">
          <p>{npc.description}</p>
          <p className="italic text-faded">Current mood: {npc.mood}</p>
        </div>
      )}
    </section>
  );
}
