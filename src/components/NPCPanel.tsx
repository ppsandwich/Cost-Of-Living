import { useState } from "react";
import type { NPC } from "@/types/npc";
import type { BasketItem, BasketEvent } from "@/types/game";
import { npcEquipment } from "@/game/applyFoodItem";
import { NPCAvatar } from "./NPCAvatar";
import { allRequirementsMet, getRequirementsStatus } from "@/game/requirements";
import { MUST_NOT_LABEL, WANT_BADGE, WANT_EMOJI } from "@/data/labels";
import { formatCents } from "@/utils/money";
import { StatsPanel } from "./StatsPanel";

export function NPCPanel({ npc, basket, budgetCents, event }: { npc: NPC; basket: BasketItem[]; budgetCents: number; event: BasketEvent | null }) {
  const [expanded, setExpanded] = useState(false);
  const status = getRequirementsStatus(basket, npc);
  const happy = allRequirementsMet(basket, npc);
  return (
    <section aria-label={`${npc.name}'s lunch checklist`} className="panel order-ticket p-3">
      <div className="flex items-center gap-3">
        <button className="avatar-button" aria-expanded={expanded} aria-label={`About ${npc.name}`} onClick={() => setExpanded(!expanded)}>
          <NPCAvatar npc={npc} happy={happy || Boolean(event?.newWant)} />
          <span className="avatar-info" aria-hidden>i</span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-brand-dark">Lunch for</p>
          <h2 className="font-knewave text-xl">{npc.name}</h2>
        </div>
        <div className="order-budget"><span>Budget</span><strong>{formatCents(budgetCents)}</strong></div>
      </div>
      {expanded && <div className="mt-3 space-y-1 text-sm"><strong>{npc.ageLabel}</strong><p>{npc.description}</p><p className="italic text-faded">{npc.mood}</p></div>}
      <div className="my-3"><StatsPanel npc={npc} basket={basket} visual /></div>
      <div className="flex flex-wrap gap-2" aria-label="Food wishes">
        {status.wants.map(({ want, satisfied }) => <span key={want} className={`wish-sticker ${satisfied ? "wish-done" : ""}`}>
          <span key={String(satisfied)} className={satisfied ? "check-stamp inline-block" : ""} aria-hidden>{satisfied ? "✓" : WANT_EMOJI[want]}</span>{" "}
          {want === "likes_variety" ? "3+ aisles" : WANT_BADGE[want]}
          <span className="sr-only">{satisfied ? ": done" : ": still needed"}</span>
        </span>)}
      </div>
      <p className="order-rule"><span aria-hidden>🚫</span> {MUST_NOT_LABEL[npc.mustNot]}</p>
      <p className="text-xs"><strong>Kitchen:</strong> {[...npcEquipment(npc)].join(", ")}</p>
    </section>
  );
}
