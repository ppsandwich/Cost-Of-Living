import { useEffect, useId, useRef, useState } from "react";
import type { GameState } from "@/types/game";
import { MUST_NOT_LABEL, WANT_BADGE, WANT_EMOJI } from "@/data/labels";
import { POWER_UP_BY_ID } from "@/data/powerups";
import { FINAL_ROUND } from "@/game/progression";
import { formatCents } from "@/utils/money";
import { NPCAvatar } from "./NPCAvatar";
import { StatsPanel } from "./StatsPanel";

const STEPS = ["Meet", "Lunch", "Budget", "Power-ups"];

/** Lives only in planning: a new round or retry mounts a fresh introduction. */
export function RoundIntro({ state }: { state: GameState }) {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const npc = state.npc!;
  const powerUps = state.powerUps.filter((id) =>
    !(id === "timewalker" && state.mode === "learning") &&
    !(id === "escape_rope" && state.roundNumber === FINAL_ROUND));
  const titles = [`Meet ${npc.name}`, `${npc.name}’s lunch`, "Your spending limit", "Your power-ups"];

  useEffect(() => {
    if (!open) return;
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, [open]);
  useEffect(() => {
    if (open) heading.current?.focus({ preventScroll: true });
  }, [open, step]);

  const finish = () => {
    setOpen(false);
    requestAnimationFrame(() => document.getElementById("shop-heading")?.focus({ preventScroll: true }));
  };

  return <>
    <button type="button" className="intro-replay" onClick={() => { setStep(0); setOpen(true); }}>↻ Replay round intro</button>
    {open && <dialog ref={dialog} aria-labelledby={id} onCancel={(event) => { event.preventDefault(); finish(); }} className="panel round-intro">
      <header className="intro-header">
        <p>Stop {state.roundNumber} / {FINAL_ROUND}{state.previousAttempt ? " · Try again" : ""}</p>
        <button type="button" onClick={finish}>Skip intro →</button>
      </header>
      <ol className="intro-progress" aria-label="Round introduction">
        {STEPS.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} className={index < step ? "intro-step-done" : ""}><span aria-hidden>{index < step ? "✓" : index + 1}</span>{label}</li>)}
      </ol>
      <div className="intro-stage" key={step}>
        <h2 ref={heading} id={id} tabIndex={-1} className="font-title text-3xl focus:outline-none">{titles[step]}</h2>
        {step === 0 && <div className="intro-person">
          <div className="intro-portrait"><span className="intro-spark" aria-hidden>✦</span><NPCAvatar npc={npc} /><span className="intro-spark" aria-hidden>✧</span></div>
          <p className="font-display text-sm text-brand-dark">{npc.ageLabel}</p>
          <p className="mt-2 text-sm">{npc.description}</p>
          <p className="intro-speech">{npc.mood}</p>
        </div>}
        {step === 1 && <div className="intro-lunch">
          <p className="intro-caption">Build a lunch with all three parts.</p>
          <StatsPanel npc={npc} basket={[]} visual />
          <p className="intro-caption">Add both food wishes.</p>
          <div className="intro-wishes">{npc.wants.map((want) => <span className="wish-sticker" key={want}><span aria-hidden>{WANT_EMOJI[want]}</span> {want === "likes_variety" ? "3+ aisles" : WANT_BADGE[want]}</span>)}</div>
          {npc.wants.includes("likes_variety") && <p className="mt-2 text-xs">Choose from 3 food aisles, like grains, fruit and dairy. Check each item’s aisle label.</p>}
          <p className="intro-food-rule">🚫 {MUST_NOT_LABEL[npc.mustNot]}</p>
          <p className="text-xs text-faded">One food can tick more than one box.</p>
        </div>}
        {step === 2 && <div className="intro-budget">
          <div className="intro-money"><span aria-hidden>👛</span><strong>{formatCents(state.roundBudgetCents)}</strong><span>to spend this shop</span></div>
          <p className="text-sm font-bold">Finish the checklist. Stay within this amount.</p>
          {state.retryChallenge && <p className="challenge-ticket mt-3">🎯 Try to spend {formatCents(state.retryChallenge.targetSpendCents)} or less.</p>}
          <p className="mt-3 text-xs text-faded">{state.mode === "learning" ? "No timer. You can change your mind." : `${state.roundDurationSeconds} seconds to shop. The clock stays off while you plan.`}</p>
        </div>}
        {step === 3 && <div className="intro-boosts">
          {powerUps.length ? <>
            <p className="intro-caption">Ready for this shop. Prices, budget and shelves already include your boosts.</p>
            <ul className="intro-powerups">{powerUps.map((id, index) => {
              const boost = POWER_UP_BY_ID[id];
              return <li key={id} style={{ animationDelay: `${index * 60}ms` }}><span aria-hidden>{boost.icon}</span><div><strong>{boost.name}</strong><p>{id === "embezzler" ? "Your carried savings are included in the budget." : boost.description}</p></div></li>;
            })}</ul>
          </> : <div className="intro-no-boosts"><span aria-hidden>🎁</span><strong>A fresh start!</strong><p>{state.roundNumber === 1 ? "No power-ups yet. Finish this shop to choose your first one." : "No power-ups for this shop. Let’s make the budget work."}</p></div>}
          <p className="intro-next">Next: browse the food and plan your picks.</p>
        </div>}
      </div>
      <footer className="intro-controls">
        <button type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)} className="btn bg-paper">← Back</button>
        <button type="button" onClick={() => step === 3 ? finish() : setStep((current) => current + 1)} className="btn bg-good text-white">{step === 3 ? "Let’s plan →" : `Next: ${STEPS[step + 1]} →`}</button>
      </footer>
    </dialog>}
  </>;
}
