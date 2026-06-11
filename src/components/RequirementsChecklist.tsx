import type { NPC } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { getRequirementsStatus } from "@/game/requirements";
import { MUST_NOT_LABEL, WANT_EMOJI, WANT_LABEL } from "@/data/labels";

function TickBox({ state }: { state: "done" | "todo" | "never" }) {
  return (
    <span
      aria-hidden
      className={`grid size-8 shrink-0 place-items-center rounded-lg border-[3px] border-ink font-display text-lg leading-none ${
        state === "done"
          ? "bg-good text-white"
          : state === "never"
            ? "bg-faded text-white"
            : "bg-receipt text-transparent"
      }`}
    >
      {state === "never" ? "✗" : "✓"}
    </span>
  );
}

/** The three requirements, bare list — wrap it in whatever panel fits. */
export function RequirementsChecklist({ npc, basket }: { npc: NPC; basket: BasketItem[] }) {
  const status = getRequirementsStatus(basket, npc);

  return (
    <ul className="space-y-1.5">
      {status.wants.map(({ want, satisfied }) => (
        <li key={want} className="flex items-center gap-2">
          <TickBox state={satisfied ? "done" : "todo"} />
          <span
            className={`text-sm font-extrabold ${satisfied ? "text-good line-through" : ""}`}
          >
            <span aria-hidden>{WANT_EMOJI[want]}</span> {WANT_LABEL[want] ?? want}
          </span>
          <span className="sr-only">{satisfied ? "(done)" : "(not yet)"}</span>
        </li>
      ))}
      <li className="flex items-center gap-2">
        <TickBox state="never" />
        <span className="text-sm font-extrabold">
          <span aria-hidden>🚫</span> {MUST_NOT_LABEL[npc.mustNot]}
        </span>
      </li>
    </ul>
  );
}
