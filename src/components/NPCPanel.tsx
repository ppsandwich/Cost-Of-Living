import type { NPC } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { npcEquipment } from "@/game/applyFoodItem";
import { RequirementsChecklist } from "./RequirementsChecklist";
import { NPCAvatar } from "./NPCAvatar";
import { getRequirementsStatus } from "@/game/requirements";
import { mealCoverage, MEAL_ROLES } from "@/game/meals";
export function NPCPanel({ npc, basket }: { npc: NPC; basket: BasketItem[] }) {
  const coverage = mealCoverage(basket, npc);
  const briefMet = getRequirementsStatus(basket, npc).allMet && MEAL_ROLES.every((role) => coverage[role]);
  return (
    <section aria-label={`${npc.name}'s brief`} className="panel npc-panel space-y-3 p-4">
      <div className="flex items-center gap-3">
        <NPCAvatar npc={npc} happy={briefMet} />
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wider text-brand-dark">Lunch for</p>
          <h2 className="font-knewave text-2xl">{npc.name}</h2>
          <p className="mt-1 text-xs font-bold text-faded">{npc.ageLabel}</p>
        </div>
      </div>
      <p key={String(briefMet)} className="npc-mood text-sm">
        {briefMet ? "That’s my lunch brief covered. Let’s check the budget!" : npc.mood}
      </p>
      <p className="text-sm">{npc.description}</p>
      <RequirementsChecklist npc={npc} basket={basket} />
      <p className="border-t-2 border-dashed border-ink/20 pt-2 text-xs">
        <strong>Available:</strong> {[...npcEquipment(npc)].join(", ")}. Shelves
        show anything they cannot use.
      </p>
    </section>
  );
}
