import { useState } from "react";
import type { PowerUpId } from "@/data/powerups";
import { POWER_UP_BY_ID } from "@/data/powerups";

/** A little playing card for one power-up. Rare cards get the golden treatment. */
export function PowerUpCard({
  powerUpId,
  size = "small",
}: {
  powerUpId: PowerUpId;
  size?: "small" | "medium" | "large";
}) {
  const powerUp = POWER_UP_BY_ID[powerUpId];
  const rare = powerUp.rarity === "rare";
  const rareBg = rare
    ? "border-happy [background:linear-gradient(135deg,#fff8e0,#ffe9a8_45%,#fff8e0)]"
    : "border-ink bg-receipt";
  if (size === "medium") {
    return (
      <span
        className={`relative flex h-full flex-col items-center gap-1 rounded-xl border-2 px-1 pb-2 pt-3 shadow-[2px_2px_0_rgba(51,36,28,0.2)] ${rareBg}`}
      >
        {rare && (
          <span className="sticker absolute -top-2 left-1/2 -translate-x-1/2 rounded-md bg-brand px-1 py-px font-display text-[8px] uppercase tracking-wide text-white">
            Rare!
          </span>
        )}
        <span aria-hidden className="text-2xl leading-none">
          {powerUp.icon}
        </span>
        <span className="text-center font-display text-[10.4px] uppercase leading-tight">
          {powerUp.name}
        </span>
      </span>
    );
  }
  if (size === "large") {
    return (
      <span
        className={`relative flex h-full flex-col items-center gap-1 rounded-xl border-[3px] px-2 pb-3 pt-4 shadow-[3px_3px_0_rgba(51,36,28,0.25)] ${rareBg}`}
      >
        {rare && (
          <span className="sticker absolute -top-2 left-1/2 -translate-x-1/2 rounded-md bg-brand px-1.5 py-0.5 font-display text-[10.4px] uppercase tracking-wide text-white">
            Rare!
          </span>
        )}
        <span aria-hidden className="text-4xl">
          {powerUp.icon}
        </span>
        <span className="font-display text-xs uppercase leading-tight">{powerUp.name}</span>
        <span className="text-center text-[11.5px] font-semibold leading-snug text-ink/70">
          {powerUp.description}
        </span>
      </span>
    );
  }
  return (
    <span
      className={`relative flex w-12 flex-col items-center gap-0.5 rounded-lg border-2 px-1 py-1.5 shadow-[2px_2px_0_rgba(51,36,28,0.2)] ${rareBg}`}
    >
      {rare && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1.5 text-[10.4px] drop-shadow-[1px_1px_0_rgba(51,36,28,0.4)]"
        >
          🌟
        </span>
      )}
      <span aria-hidden className="text-xl leading-none">
        {powerUp.icon}
      </span>
      <span className="w-full truncate text-center text-[8px] font-extrabold uppercase leading-none">
        {powerUp.name.split(" ")[0]}
      </span>
    </span>
  );
}

/**
 * The collected power-ups, as a row of cards with a tap-for-details
 * popover. Opens on the most recent pick — remount per round (via key)
 * so each round leads with the newest acquisition.
 */
export function PowerUpShelf({ powerUps }: { powerUps: PowerUpId[] }) {
  const [openId, setOpenId] = useState<PowerUpId | null>(
    () => powerUps[powerUps.length - 1] ?? null
  );
  if (powerUps.length === 0) return null;
  const open = openId ? POWER_UP_BY_ID[openId] : null;

  return (
    <section aria-label="Collected power-ups" className="panel p-3">
      <div className="flex items-start gap-2">
        <h2 className="mt-1 shrink-0 font-display text-[12.7px] uppercase tracking-wider text-brand">
          Power-ups
        </h2>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {powerUps.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setOpenId(openId === id ? null : id)}
              aria-expanded={openId === id}
              aria-label={`${POWER_UP_BY_ID[id].name} — show details`}
              className={`rounded-lg transition-transform ${
                openId === id ? "-translate-y-0.5" : ""
              }`}
            >
              <PowerUpCard powerUpId={id} />
            </button>
          ))}
        </div>
      </div>
      {open && (
        <div className="mt-2 rounded-lg border-2 border-dashed border-ink/25 bg-paper px-2.5 py-1.5 text-xs">
          <span className="font-display uppercase">
            {open.icon} {open.name}
          </span>{" "}
          <span className="font-semibold text-ink/70">{open.description}</span>
        </div>
      )}
    </section>
  );
}

/** Pick-one-of-two offer shown after a round win. */
export function PowerUpChoice({
  choices,
  onChoose,
}: {
  choices: PowerUpId[];
  onChoose: (id: PowerUpId) => void;
}) {
  return (
    <div className="mt-4">
      <h3 className="text-center font-display text-sm uppercase tracking-wider text-brand">
        Pick a power-up
      </h3>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {choices.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onChoose(id)}
            className="text-left transition-transform hover:-translate-y-0.5 active:translate-y-0"
            aria-label={`Choose ${POWER_UP_BY_ID[id].name}: ${POWER_UP_BY_ID[id].description}`}
          >
            <PowerUpCard powerUpId={id} size="large" />
          </button>
        ))}
      </div>
    </div>
  );
}
