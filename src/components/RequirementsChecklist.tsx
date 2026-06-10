import type { NPC } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { getRequirementsStatus } from "@/game/requirements";
import { MUST_NOT_LABEL, WANT_EMOJI, WANT_LABEL } from "@/data/labels";

function TickBox({ state }: { state: "done" | "todo" | "broken" }) {
  return (
    <span
      aria-hidden
      className={`grid size-8 shrink-0 place-items-center rounded-lg border-[3px] border-ink font-display text-lg leading-none ${
        state === "done"
          ? "bg-good text-white"
          : state === "broken"
            ? "bg-danger text-white"
            : "bg-receipt text-transparent"
      }`}
    >
      {state === "broken" ? "✗" : "✓"}
    </span>
  );
}

export function RequirementsChecklist({ npc, basket }: { npc: NPC; basket: BasketItem[] }) {
  const status = getRequirementsStatus(basket, npc);

  return (
    <section aria-label="Shopping list requirements" className="panel p-3">
      <h2 className="font-display text-[12.7px] uppercase tracking-wider text-brand">
        {npc.name}&apos;s shopping list — tick all three
      </h2>
      <ul className="mt-1.5 space-y-1.5">
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
          <TickBox state={status.mustNotViolated ? "broken" : "done"} />
          <span
            className={`text-sm font-extrabold ${
              status.mustNotViolated ? "text-danger" : "text-good"
            }`}
          >
            <span aria-hidden>🚫</span> {MUST_NOT_LABEL[npc.mustNot]}
            {status.mustNotViolated && " — it's in the basket!"}
          </span>
          <span className="sr-only">{status.mustNotViolated ? "(violated)" : "(respected)"}</span>
        </li>
      </ul>
    </section>
  );
}
