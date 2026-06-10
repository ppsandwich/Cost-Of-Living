import type { NPC, NutritionStats } from "@/types/npc";
import { DANGER_STATS, dangerRatio } from "@/game/thresholds";
import { WARNING_FEEDBACK } from "@/data/flavourText";

function GoalMeter({
  label,
  emoji,
  value,
  target,
  fillClass,
}: {
  label: string;
  emoji: string;
  value: number;
  target: number;
  fillClass: string;
}) {
  const percent = Math.min(100, (value / (target * 1.4)) * 100);
  const targetPercent = (target / (target * 1.4)) * 100;
  const met = value >= target;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-xs uppercase tracking-wide">
          <span aria-hidden>{emoji}</span> {label} {met && <span aria-hidden>✓</span>}
        </span>
        <span className="font-pixel text-lg leading-none tabular-nums text-faded">
          {Math.round(value)}/{target}
        </span>
      </div>
      <div
        className="meter-track relative mt-1 h-5 overflow-hidden"
        role="meter"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`${label}: ${Math.round(value)} of ${target} needed`}
      >
        <div
          className={`meter-fill h-full transition-all ${fillClass}`}
          style={{ width: `${percent}%` }}
        />
        <div
          className="absolute top-0 h-full w-1 bg-ink"
          style={{ left: `${targetPercent}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

const STAT_LABEL: Record<string, string> = {
  calories: "CALS",
  fat: "FAT",
  sugar: "SUGAR",
  carbs: "CARBS",
  sodium: "SALT",
};

/** Grey at 0%, blending to pure red at 70%+ of the fatal threshold. */
function riskColor(ratio: number): string {
  const redShare = Math.round(Math.min(1, ratio / 0.7) * 100);
  return `color-mix(in oklab, var(--color-danger) ${redShare}%, var(--color-faded))`;
}

export function StatsPanel({ stats, npc }: { stats: NutritionStats; npc: NPC }) {
  const risks = DANGER_STATS.map((stat) => ({
    stat,
    ratio: dangerRatio(stats, npc.maxThresholds, stat),
  }));
  const worst = risks.filter((r) => r.ratio >= 0.8).sort((a, b) => b.ratio - a.ratio)[0];

  return (
    <section aria-label="Needs and risk" className="panel space-y-2.5 p-3">
      <GoalMeter
        label="Nutrition"
        emoji="🥦"
        value={stats.nutrition}
        target={npc.nutritionTarget}
        fillClass="bg-good"
      />
      <GoalMeter
        label="Happiness"
        emoji="😊"
        value={stats.happiness}
        target={npc.happinessTarget}
        fillClass="bg-happy"
      />
      <div className="flex flex-wrap items-center gap-1 pt-0.5">
        <span className="font-display text-[10px] uppercase tracking-wider text-faded">
          Danger
        </span>
        {risks.map(({ stat, ratio }) => {
          const percent = Math.round(ratio * 100);
          const alarm = ratio >= 0.8;
          return (
            <span
              key={stat}
              className={`rounded-md border-2 px-1 py-0.5 font-pixel text-sm leading-none ${
                alarm
                  ? "border-ink bg-danger font-bold text-white"
                  : `border-ink/15 bg-paper ${ratio >= 0.7 ? "font-bold" : ""}`
              }`}
              style={alarm ? undefined : { color: riskColor(ratio) }}
            >
              {alarm && "⚠"}
              {STAT_LABEL[stat]} {percent}%
            </span>
          );
        })}
      </div>
      {worst && (
        <p className="text-xs font-bold text-danger" role="alert">
          {WARNING_FEEDBACK[worst.stat]}
        </p>
      )}
    </section>
  );
}
