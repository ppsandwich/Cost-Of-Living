import type { NPC } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { npcEquipment } from "@/game/applyFoodItem";
import { RequirementsChecklist } from "./RequirementsChecklist";
export function NPCPanel({ npc, basket }: { npc: NPC; basket: BasketItem[] }) {
  return (
    <section aria-label={`${npc.name}'s brief`} className="panel space-y-3 p-3">
      <h2 className="font-display text-lg">
        <span aria-hidden>{npc.emoji}</span> Lunch for {npc.name}
      </h2>
      <p className="text-sm">{npc.description}</p>
      <RequirementsChecklist npc={npc} basket={basket} />
      <p className="border-t-2 border-dashed border-ink/20 pt-2 text-xs">
        <strong>Available:</strong> {[...npcEquipment(npc)].join(", ")}. Shelves
        show anything they cannot use.
      </p>
    </section>
  );
}
