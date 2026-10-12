import type { GameState } from "@/types/game";
import { MUST_NOT_LABEL, WANT_BADGE, WANT_EMOJI } from "@/data/labels";
import { POWER_UP_BY_ID } from "@/data/powerups";
import { FINAL_ROUND } from "@/game/progression";
import { formatCents } from "@/utils/money";
import { NPCAvatar } from "./NPCAvatar";

/** An inline introduction: each part arrives in order, then stays available while planning. */
export function RoundIntro({ state }: { state: GameState }) {
  const npc = state.npc!;
  const powerUps = state.powerUps.filter((id) =>
    !(id === "timewalker" && state.mode === "learning") &&
    !(id === "escape_rope" && state.roundNumber === FINAL_ROUND));

  return <div className="round-brief" aria-label="Meet your customer and plan">
    <section className="brief-part brief-person" aria-label={`Meet ${npc.name}`}>
      <div className="brief-person-heading">
        <NPCAvatar npc={npc} />
        <div><p className="brief-label"><span aria-hidden>1</span> Your customer</p><h2 className="font-title text-3xl">Meet {npc.name}</h2><p className="text-xs text-faded">{npc.ageLabel}</p></div>
      </div>
      <p className="brief-speech">“{npc.mood}”</p>
      <details className="brief-about"><summary>About {npc.name}</summary><p>{npc.description}</p></details>
    </section>

    <section className="brief-part" aria-label="Lunch wishes and foods to avoid">
      <h3 className="brief-label"><span aria-hidden>2</span> Lunch wishes</h3>
      <div className="brief-wishes">{npc.wants.map((want) => <span className="wish-sticker" key={want}><span aria-hidden>{WANT_EMOJI[want]}</span> {want === "likes_variety" ? "3+ aisles" : WANT_BADGE[want]}</span>)}</div>
      {npc.wants.includes("likes_variety") && <p className="brief-hint">Pick from 3 food aisles. Each food’s aisle is on its card.</p>}
      <p className="order-rule"><span aria-hidden>🚫</span> {MUST_NOT_LABEL[npc.mustNot]}</p>
      <p className="brief-hint">Include a base, protein and fruit or veg. One food can cover more than one part.</p>
    </section>

    <section className="brief-part" aria-label="Your spending limit">
      <div className="brief-budget"><h3 className="brief-label"><span aria-hidden>3</span> Your budget</h3><strong>{formatCents(state.roundBudgetCents)}</strong></div>
      <p className="brief-hint">{state.mode === "learning" ? "Take your time. There’s no timer." : `${state.roundDurationSeconds} seconds to shop. The clock is off until you start. Putting food back costs 3 seconds.`}</p>
      {state.retryChallenge && <p className="challenge-ticket mt-2">🎯 Same checklist. Try to spend {formatCents(state.retryChallenge.targetSpendCents)} or less.</p>}
      {state.previousAttempt && !state.retryChallenge && <p className="brief-hint">Same shop. Last spend: {formatCents(state.previousAttempt.spentCents)}.</p>}
    </section>

    <section className="brief-part" aria-label="Power-ups for this shop">
      <h3 className="brief-label"><span aria-hidden>4</span> Your power-ups</h3>
      {powerUps.length ? <ul className="brief-powerups">{powerUps.map((id) => {
        const boost = POWER_UP_BY_ID[id];
        return <li key={id}><span aria-hidden>{boost.icon}</span><div><strong>{boost.name}</strong><p>{id === "embezzler" ? "Your carried savings are included in the budget." : boost.description}</p></div></li>;
      })}</ul> : <p className="brief-hint">🎁 {state.roundNumber === 1 ? "Finish this shop to choose your first power-up." : "No power-ups this shop. You’re ready to go!"}</p>}
      {powerUps.length > 0 && <p className="brief-hint">Ready to use. Your budget and shelves include these boosts.</p>}
    </section>
  </div>;
}
