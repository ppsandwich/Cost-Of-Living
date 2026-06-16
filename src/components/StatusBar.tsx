import type { NPC } from "@/types/npc";
import { budgetPressureLabel, FINAL_ROUND } from "@/game/progression";

interface StatusBarProps {
  npc: NPC;
  roundNumber: number;
  budgetMultiplier: number;
  timeRemainingSeconds: number;
  roundDurationSeconds: number;
}

export function StatusBar({
  npc,
  roundNumber,
  budgetMultiplier,
  timeRemainingSeconds,
  roundDurationSeconds,
}: StatusBarProps) {
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const timeLow = timeRemainingSeconds <= 15;
  const timePercent = Math.max(
    0,
    Math.min(100, (timeRemainingSeconds / roundDurationSeconds) * 100)
  );

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-receipt px-3 pb-2 pt-2">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 lg:max-w-6xl">
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-tag text-xl shadow-[2px_2px_0_rgba(51,36,28,0.25)]"
            >
              {npc.emoji}
            </span>
            <div className="min-w-0">
              <div className="font-knewave truncate text-base leading-tight">{npc.name}</div>
              <div className="truncate font-display text-[11.5px] uppercase tracking-wider text-brand">
                Round {roundNumber}/{FINAL_ROUND} · {budgetPressureLabel(budgetMultiplier)}
              </div>
            </div>
          </div>

          <div
            className="min-w-0 flex-1"
            role="timer"
            aria-label={`${timeRemainingSeconds} seconds remaining`}
          >
            <div className="relative h-11">
              <span
                className={`absolute bottom-0 -translate-x-1/2 text-3xl font-extrabold leading-none tabular-nums ${
                  timeLow ? "timer-low text-danger" : "text-ink"
                }`}
                style={{
                  left: `clamp(2.5rem, ${timePercent}%, calc(100% - 2.5rem))`,
                  transition: "left 1s linear",
                }}
              >
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="meter-track h-3.5 overflow-hidden">
              <div
                className={`meter-fill h-full ${timeLow ? "bg-danger" : "bg-happy"}`}
                style={{ width: `${timePercent}%`, transition: "width 1s linear" }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="awning-stripes h-2.5" />
      <div className="awning-scallops h-3" />
    </header>
  );
}
