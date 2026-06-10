import type { NPC } from "@/types/npc";
import { budgetPressureLabel } from "@/game/progression";
import { formatCents } from "@/utils/money";

interface StatusBarProps {
  npc: NPC;
  roundNumber: number;
  budgetMultiplier: number;
  remainingBudgetCents: number;
  timeRemainingSeconds: number;
}

export function StatusBar({
  npc,
  roundNumber,
  budgetMultiplier,
  remainingBudgetCents,
  timeRemainingSeconds,
}: StatusBarProps) {
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const timeLow = timeRemainingSeconds <= 15;
  const budgetLow = remainingBudgetCents < 300;

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-receipt px-3 pb-2 pt-2">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2 lg:max-w-6xl">
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-tag text-xl shadow-[2px_2px_0_rgba(51,36,28,0.25)]"
            >
              {npc.emoji}
            </span>
            <div className="min-w-0">
              <div className="truncate font-display text-base leading-tight">{npc.name}</div>
              <div className="truncate font-display text-[10px] uppercase tracking-wider text-brand">
                Round {roundNumber} · {budgetPressureLabel(budgetMultiplier)}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="lcd px-2 py-1 text-center">
              <div className="text-[9px] font-bold uppercase tracking-widest text-receipt/60">
                Budget
              </div>
              <div
                className={`text-2xl tabular-nums ${budgetLow ? "text-danger" : "text-lcd"}`}
              >
                {formatCents(remainingBudgetCents)}
              </div>
            </div>
            <div
              className={`lcd px-2 py-1 text-center ${timeLow ? "timer-low" : ""}`}
              role="timer"
              aria-label={`${timeRemainingSeconds} seconds remaining`}
            >
              <div className="text-[9px] font-bold uppercase tracking-widest text-receipt/60">
                Time
              </div>
              <div
                className={`text-2xl tabular-nums ${timeLow ? "text-danger" : "text-lcd-amber"}`}
              >
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="awning-stripes h-2.5" />
      <div className="awning-scallops h-3" />
    </header>
  );
}
