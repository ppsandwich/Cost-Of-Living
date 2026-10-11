import type { BasketEvent } from "@/types/game";
import type { NPC } from "@/types/npc";
import { WANT_BADGE, WANT_EMOJI } from "@/data/labels";
export function ShoppingReaction({ event, npc }: { event: BasketEvent | null; npc: NPC }) {
  if (!event) return <p className="shopping-reaction text-faded">Your basket is ready. Pick a starting point.</p>;
  const combo = event.newRoles.length >= 2;
  const text = event.kind === "remove" ? "Back on the shelf. Money back too."
    : combo ? "Two boxes ticked!"
    : event.newWant ? event.newWant === "likes_variety" ? "A little variety. Just my style!" : `${WANT_BADGE[event.newWant]}? That’s my favourite!`
    : event.newRoles.length ? "One step closer to lunch." : "In the basket. What’s next?";
  return <p key={event.id} role="status" className={`shopping-reaction ${combo ? "combo-stamp" : "reaction-pop"}`}>
    <span aria-hidden>{combo ? "✨" : event.newWant ? WANT_EMOJI[event.newWant] : npc.emoji}</span> {text}
  </p>;
}
