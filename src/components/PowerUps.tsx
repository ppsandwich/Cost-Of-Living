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
  const mutated = powerUp.presentation === "mutated";
  const cardBg = mutated
    ? "border-danger bg-danger text-white"
    : rare
      ? "border-happy [background:linear-gradient(135deg,#fff8e0,#ffe9a8_45%,#fff8e0)]"
      : "border-ink bg-receipt";
  const shadow = mutated
    ? "shadow-[0_0_18px_rgba(214,64,46,0.75),3px_3px_0_rgba(51,36,28,0.25)]"
    : "shadow-[2px_2px_0_rgba(51,36,28,0.2)]";
  const largeShadow = mutated
    ? "shadow-[0_0_22px_rgba(214,64,46,0.85),3px_3px_0_rgba(51,36,28,0.25)]"
    : "shadow-[3px_3px_0_rgba(51,36,28,0.25)]";
  if (size === "medium") {
    return (
      <span
        className={`relative flex h-full flex-col items-center gap-1 rounded-xl border-2 px-1 pb-2 pt-3 ${shadow} ${cardBg}`}
      >
        {rare && (
          <span className="sticker absolute -top-2 left-1/2 -translate-x-1/2 rounded-md bg-brand px-1 py-px font-display text-xs uppercase tracking-wide text-white">
            Rare!
          </span>
        )}
        <span aria-hidden className="text-2xl leading-none">
          {powerUp.icon}
        </span>
        <span className="text-center font-display text-xs uppercase leading-tight">
          {powerUp.name}
        </span>
      </span>
    );
  }
  if (size === "large") {
    return (
      <span
        className={`relative flex h-full flex-col items-center gap-1 rounded-xl border-[3px] px-2 pb-3 pt-4 ${largeShadow} ${cardBg}`}
      >
        {rare && (
          <span className="sticker absolute -top-2 left-1/2 -translate-x-1/2 rounded-md bg-brand px-1.5 py-0.5 font-display text-xs uppercase tracking-wide text-white">
            Rare!
          </span>
        )}
        <span aria-hidden className="text-4xl">
          {powerUp.icon}
        </span>
        <span className="font-display text-xs uppercase leading-tight">
          {powerUp.name}
        </span>
        <span
          className={`text-center text-xs font-semibold leading-snug ${
            mutated ? "text-white" : "text-faded"
          }`}
        >
          {powerUp.description}
        </span>
      </span>
    );
  }
  return (
    <span
      className={`powerup-mini relative flex flex-col items-center gap-0.5 rounded-lg border-2 px-1 py-1.5 ${shadow} ${cardBg}`}
    >
      {rare && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1.5 text-xs drop-shadow-[1px_1px_0_rgba(51,36,28,0.4)]"
        >
          🌟
        </span>
      )}
      <span aria-hidden className="text-xl leading-none">
        {powerUp.icon}
      </span>
      <span className="w-full text-center text-xs font-extrabold uppercase leading-none">
        {powerUp.name}
      </span>
    </span>
  );
}

/**
 * The collected power-ups, as a row of cards with a tap-for-details
 * popover. Details stay tucked away until requested.
 */
export function PowerUpShelf({
  powerUps,
  canUseEscapeRope = false,
  onUseEscapeRope,
  embedded = false,
}: {
  powerUps: PowerUpId[];
  canUseEscapeRope?: boolean;
  embedded?: boolean;
  onUseEscapeRope?: () => void;
}) {
  const [openId, setOpenId] = useState<PowerUpId | null>(null);
  if (powerUps.length === 0) return null;
  const open = openId ? POWER_UP_BY_ID[openId] : null;

  return (
    <section aria-label="Your power-ups" className={embedded ? "compact-boosts" : "panel p-3"}>
      <div className="powerup-shelf-heading flex items-start gap-2">
        {!embedded && <h2 className="mt-1 shrink-0 font-display text-xs uppercase tracking-wider text-brand-dark">
          Power-ups
        </h2>}
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
              {powerUps.length > 2 ? <span className="boost-chip"><span aria-hidden>{POWER_UP_BY_ID[id].icon}</span>{POWER_UP_BY_ID[id].name}</span> : <PowerUpCard powerUpId={id} size="medium" />}
            </button>
          ))}
        </div>
      </div>
      {open && (
        <div className="mt-2 rounded-lg border-2 border-dashed border-ink/25 bg-paper px-2.5 py-1.5 text-xs">
          <span className="font-display uppercase">
            {open.icon} {open.name}
          </span>{" "}
          <span className="font-semibold text-faded">{open.description}</span>
          {open.id === "escape_rope" && canUseEscapeRope && onUseEscapeRope && (
            <button
              type="button"
              onClick={onUseEscapeRope}
              className="btn mt-2 min-h-10 w-full bg-danger text-xs uppercase text-white"
            >
              Skip this shop
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/** Pick-one-of-two offer shown after a round win. */
export function PowerUpChoice({
  choices,
  onChoose,
  compact = false,
}: {
  choices: PowerUpId[];
  onChoose: (id: PowerUpId) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "compact-powerups" : "mt-4"}>
      <h3 className="text-center font-display text-sm uppercase tracking-wider text-brand-dark">
        Choose a power-up
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
            {compact ? (
              <span className="compact-powerup">
                <span className="flex items-center gap-1 font-display">
                  <span aria-hidden>{POWER_UP_BY_ID[id].icon}</span>
                  {POWER_UP_BY_ID[id].name}
                  {POWER_UP_BY_ID[id].rarity === "rare" && <span className="text-brand-dark">★</span>}
                </span>
                <span className="mt-1 block">{POWER_UP_BY_ID[id].description}</span>
              </span>
            ) : <PowerUpCard powerUpId={id} size="large" />}
          </button>
        ))}
      </div>
    </div>
  );
}
