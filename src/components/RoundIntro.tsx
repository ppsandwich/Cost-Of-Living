import type { GameState } from "@/types/game";
import { MUST_NOT_LABEL, WANT_BADGE, WANT_EMOJI } from "@/data/labels";
import { POWER_UP_BY_ID } from "@/data/powerups";
import { PowerUpShelf } from "./PowerUps";
import { FINAL_ROUND } from "@/game/progression";
import { formatCents } from "@/utils/money";
import { NPCDifficulty } from "./NPCDifficulty";
import { NPCAvatar } from "./NPCAvatar";

/** An inline introduction: each part arrives in order, then stays available while planning. */
export function RoundIntro({ state, tourStep = -1 }: { state: GameState; tourStep?: number }) {
  const npc = state.npc!;
  const powerUps = state.powerUps.filter((id) =>
    !(id === "timewalker" && state.mode === "learning") &&
    !(id === "escape_rope" && state.roundNumber === FINAL_ROUND));

  return <div className="round-brief" aria-label="Meet your customer and plan">
    <section className="brief-part brief-person tour-target" data-tour-step="0" data-tour-current={tourStep === 0} data-tour-label="1 / 5" aria-label={`Meet ${npc.name}`}>
      <div className="brief-person-heading">
        <NPCAvatar npc={npc} />
        <div><p className="brief-label"><span aria-hidden>1</span> Your customer</p><h2 className="font-title text-3xl">Meet {npc.name}</h2><NPCDifficulty npc={npc} /><p className="text-xs text-faded">{npc.ageLabel}</p></div>
      </div>
      <div className="brief-about"><h3>About {npc.name}</h3><p>{npc.description}</p></div>
    </section>

    <section className="brief-part tour-target" data-tour-step="1" data-tour-current={tourStep === 1} data-tour-label="2 / 5" aria-label="Lunch wishes and foods to avoid">
      <h3 className="brief-label"><span aria-hidden>2</span> Lunch wishes</h3>
      <div className="brief-wishes">{npc.wants.map((want) => <span className="wish-sticker" key={want}><span aria-hidden>{WANT_EMOJI[want]}</span> {want === "likes_variety" ? "3+ aisles" : WANT_BADGE[want]}</span>)}</div>
      {npc.wants.includes("likes_variety") && <p className="brief-hint">Pick from 3 food aisles. Each food’s aisle is on its card.</p>}
      <p className="order-rule"><span aria-hidden>🚫</span> {MUST_NOT_LABEL[npc.mustNot]}</p>
    </section>

    <section className="brief-part tour-target" data-tour-step="2" data-tour-current={tourStep === 2} data-tour-label="3 / 5" aria-label="Your spending limit">
      <div className="brief-budget"><h3 className="brief-label"><span aria-hidden>3</span> Your budget</h3><strong>{formatCents(state.roundBudgetCents)}</strong></div>
      <p className="brief-hint">{state.mode === "learning" ? "Take your time. There’s no timer." : `${state.roundDurationSeconds} seconds to shop. The clock is off until you start. Putting food back costs 3 seconds.`}</p>
      {state.retryChallenge && <p className="challenge-ticket mt-2">🎯 Same checklist. Try to spend {formatCents(state.retryChallenge.targetSpendCents)} or less.</p>}
      {state.previousAttempt && !state.retryChallenge && <p className="brief-hint">Same shop. Last spend: {formatCents(state.previousAttempt.spentCents)}.</p>}
    </section>

    <section className="brief-part tour-target" data-tour-step="3" data-tour-current={tourStep === 3} data-tour-label="4 / 5" aria-label="Power-ups for this shop">
      <h3 className="brief-label"><span aria-hidden>4</span> Your power-ups</h3>
      {powerUps.length > 2 ? <PowerUpShelf powerUps={powerUps} embedded /> : powerUps.length ? <ul className="brief-powerups">{powerUps.map((id) => {
        const boost = POWER_UP_BY_ID[id];
        return <li key={id}><span aria-hidden>{boost.icon}</span><div><strong>{boost.name}</strong><p>{id === "embezzler" ? "Your carried savings are included in the budget." : boost.description}</p></div></li>;
      })}</ul> : <p className="brief-hint">{state.powerUpsEnabled && <span aria-hidden>🎁 </span>}{!state.powerUpsEnabled ? "Power-ups are off for this run." : state.roundNumber === 1 ? "Finish this shop to choose your first power-up." : "No power-ups this shop. You’re ready to go!"}</p>}
      {powerUps.length > 0 && <p className="brief-hint">Ready to use. Your budget and shelves include these boosts.</p>}
    </section>
  </div>;
}
