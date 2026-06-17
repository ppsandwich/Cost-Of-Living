import type { NPC, NutritionStats } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import type { CSSProperties } from "react";
import { DANGER_STATS, dangerRatio } from "@/game/thresholds";
import { getRequirementsStatus } from "@/game/requirements";
import { WANT_BADGE } from "@/data/labels";
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
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 font-display text-xs uppercase tracking-wide">
        <span aria-hidden>{emoji}</span> {label}
      </span>
      <div
        className="meter-track relative h-5 min-w-0 flex-1 overflow-hidden"
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
      <span className="w-12 shrink-0 text-right text-sm font-bold leading-none tabular-nums text-faded">
        {Math.round(value)}/{target}
      </span>
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

function riskBarFill(ratio: number): string {
  if (ratio >= 0.8) return "var(--color-danger)";
  if (ratio >= 0.6) return "var(--color-happy)";
  return "#d8d0c2";
}

export function StatsPanel({
  stats,
  npc,
  basket,
}: {
  stats: NutritionStats;
  npc: NPC;
  basket: BasketItem[];
}) {
  const risks = DANGER_STATS.map((stat) => ({
    stat,
    ratio: dangerRatio(stats, npc.maxThresholds, stat),
  }));
  const worst = risks.filter((r) => r.ratio >= 0.8).sort((a, b) => b.ratio - a.ratio)[0];
  const wants = getRequirementsStatus(basket, npc).wants;

  return (
    <section aria-label="Needs and risk" className="space-y-2.5">
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
      <div className="space-y-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-1 lg:flex-col lg:items-stretch">
          {risks.map(({ stat, ratio }) => {
            const percent = Math.round(ratio * 100);
            const cappedPercent = Math.min(100, percent);
            const alarm = ratio >= 1;
            const labelOnLeft = cappedPercent >= 78;
            return (
              <span
                key={stat}
                className={`relative overflow-hidden rounded-md border-2 px-1 py-0.5 text-xs font-bold leading-none lg:h-4 lg:w-full lg:px-0 lg:py-0 ${
                  alarm
                    ? "border-ink bg-danger text-white lg:bg-paper"
                    : `border-ink/15 bg-paper ${ratio >= 0.7 ? "font-bold" : ""}`
                }`}
                style={alarm ? undefined : { color: riskColor(ratio) }}
                role="meter"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${STAT_LABEL[stat]} ${percent}% of limit`}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 hidden lg:block"
                  style={{
                    width: `${cappedPercent}%`,
                    backgroundColor: riskBarFill(ratio),
                  }}
                />
                <span
                  className={`relative z-10 block lg:absolute lg:left-[calc(var(--risk-label-left)+var(--risk-label-gap))] lg:top-1/2 lg:-translate-y-1/2 lg:whitespace-nowrap lg:px-1 lg:py-[2px] lg:text-[11px] lg:leading-[0.85rem] ${
                    labelOnLeft ? "lg:-translate-x-full lg:text-white" : "lg:text-ink"
                  }`}
                  style={
                    {
                      "--risk-label-left": `${cappedPercent}%`,
                      "--risk-label-gap": labelOnLeft ? "-2px" : "2px",
                    } as CSSProperties
                  }
                >
                  {alarm && "⚠"}
                  {STAT_LABEL[stat]} {percent}%
                </span>
              </span>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {wants.map(({ want, satisfied }) => (
            <span
              key={want}
              className={`rounded-md border-2 px-1 py-0.5 text-xs font-bold uppercase leading-none ${
                satisfied
                  ? "border-ink bg-good text-white"
                  : "border-ink/15 bg-paper text-faded"
              }`}
            >
              {WANT_BADGE[want] ?? "Variety"} {satisfied ? "✓" : "✗"}
            </span>
          ))}
        </div>
      </div>
      {worst && (
        <p className="text-xs font-bold text-danger" role="alert">
          {worst.ratio >= 1
            ? "⚠ Over the limit. The till refuses the basket until it comes back down."
            : WARNING_FEEDBACK[worst.stat]}
        </p>
      )}
    </section>
  );
}
