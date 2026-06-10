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

  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink/10 bg-receipt/95 px-3 py-2 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 lg:max-w-6xl">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">
            <span aria-hidden>{npc.emoji}</span> {npc.name}
          </div>
          <div className="truncate text-xs text-faded">
            Round {roundNumber} · {budgetPressureLabel(budgetMultiplier)}
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-faded">Budget</div>
            <div
              className={`text-lg font-bold leading-none ${
                remainingBudgetCents < 300 ? "text-danger" : "text-good"
              }`}
            >
              {formatCents(remainingBudgetCents)}
            </div>
          </div>
          <div
            className={`rounded-lg border-2 px-2 py-1 text-center ${
              timeLow ? "timer-low border-danger text-danger" : "border-ink/20"
            }`}
            role="timer"
            aria-label={`${timeRemainingSeconds} seconds remaining`}
          >
            <div className="text-lg font-bold leading-none tabular-nums">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
