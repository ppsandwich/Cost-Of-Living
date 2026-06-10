import type { NPC, NutritionStats } from "@/types/npc";
import { DANGER_STATS, dangerRatio } from "@/game/thresholds";
import { WARNING_FEEDBACK } from "@/data/flavourText";

function GoalMeter({
  label,
  value,
  target,
  colorClass,
}: {
  label: string;
  value: number;
  target: number;
  colorClass: string;
}) {
  const percent = Math.min(100, (value / (target * 1.4)) * 100);
  const targetPercent = (target / (target * 1.4)) * 100;
  const met = value >= target;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-semibold">
          {label} {met && <span aria-hidden>✓</span>}
        </span>
        <span className="font-mono tabular-nums text-faded">
          {Math.round(value)} / {target}
        </span>
      </div>
      <div
        className="relative mt-0.5 h-3 overflow-hidden rounded-full bg-ink/10"
        role="meter"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`${label}: ${Math.round(value)} of ${target} needed`}
      >
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-ink/50"
          style={{ left: `${targetPercent}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

const STAT_LABEL: Record<string, string> = {
  calories: "Cals",
  fat: "Fat",
  sugar: "Sugar",
  carbs: "Carbs",
  sodium: "Salt",
};

export function StatsPanel({ stats, npc }: { stats: NutritionStats; npc: NPC }) {
  const risks = DANGER_STATS.map((stat) => ({
    stat,
    ratio: dangerRatio(stats, npc.maxThresholds, stat),
  }));
  const worst = risks.filter((r) => r.ratio >= 0.8).sort((a, b) => b.ratio - a.ratio)[0];

  return (
    <section
      aria-label="Needs and risk"
      className="space-y-2 rounded-xl border-2 border-ink/10 bg-receipt p-3"
    >
      <GoalMeter
        label="Nutrition"
        value={stats.nutrition}
        target={npc.nutritionTarget}
        colorClass="bg-good"
      />
      <GoalMeter
        label="Happiness"
        value={stats.happiness}
        target={npc.happinessTarget}
        colorClass="bg-happy"
      />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5 text-[11px] font-mono">
        <span className="text-faded">Risk:</span>
        {risks.map(({ stat, ratio }) => {
          const percent = Math.round(ratio * 100);
          const danger = ratio >= 0.8;
          return (
            <span
              key={stat}
              className={
                danger ? "rounded bg-danger px-1 font-bold text-white" : "text-faded"
              }
            >
              {danger && "⚠ "}
              {STAT_LABEL[stat]} {percent}%
            </span>
          );
        })}
      </div>
      {worst && (
        <p className="text-xs font-medium text-danger" role="alert">
          {WARNING_FEEDBACK[worst.stat]}
        </p>
      )}
    </section>
  );
}
