import { useState } from "react";
import type { NPC } from "@/types/npc";

const RESTRICTION_LABEL: Record<string, string> = {
  low_sugar: "Low sugar",
  low_fat: "Low fat",
  low_sodium: "Low salt",
  high_protein_need: "Needs protein",
  high_fibre_need: "Needs fibre",
  limited_cooking_equipment: "One saucepan",
  no_fridge: "No fridge",
  no_microwave: "No microwave",
};

export function NPCPanel({ npc }: { npc: NPC }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section aria-label={`About ${npc.name}`} className="panel p-3">
      <button
        type="button"
        className="flex min-h-11 w-full items-start justify-between gap-2 text-left"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-paper text-2xl shadow-[2px_2px_0_rgba(51,36,28,0.2)]"
          >
            {npc.emoji}
          </span>
          <div className="min-w-0">
            <div className="truncate">
              <span className="font-display text-base">{npc.name}</span>
              <span className="ml-1.5 text-xs font-bold text-faded">{npc.ageLabel}</span>
            </div>
            <div className="text-xs font-semibold text-faded">
              Needs 🥦 {npc.nutritionTarget} · 😊 {npc.happinessTarget}
            </div>
          </div>
        </div>
        <span aria-hidden className="mt-1 font-display text-faded">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {npc.restrictions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {npc.restrictions.map((r) => (
            <span
              key={r}
              className="rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-[12.7px] font-extrabold text-ink/70"
            >
              {RESTRICTION_LABEL[r] ?? r}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div className="mt-2 space-y-1 border-t-2 border-dashed border-ink/20 pt-2 text-xs font-semibold">
          <p>{npc.description}</p>
          <p className="italic text-faded">Current mood: {npc.mood}</p>
        </div>
      )}
    </section>
  );
}
