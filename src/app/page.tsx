"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { gameReducer, INITIAL_STATE } from "@/game/reducer";
import {
  dismissTutorial,
  recordRunProgress,
  useRecords,
} from "@/utils/records";
import { StatusBar } from "@/components/StatusBar";
import { StoreList } from "@/components/StoreList";
import { BasketDrawer } from "@/components/BasketDrawer";
import { OutcomeModal } from "@/components/OutcomeModal";
import { RunSummary } from "@/components/RunSummary";
import { StartScreen } from "@/components/StartScreen";
import { PowerUpShelf } from "@/components/PowerUps";
import { CountdownInterstitial } from "@/components/CountdownInterstitial";
import { PauseModal } from "@/components/PauseModal";
import { PlanningPanel } from "@/components/PlanningPanel";
import { ShoppingOrder } from "@/components/ShoppingOrder";
import { Journey } from "@/components/Journey";
import { shopForRound } from "@/game/shops";
import { useShopAudio } from "@/hooks/useShopAudio";
import type { GameMode } from "@/types/game";
import { FINAL_ROUND } from "@/game/progression";

interface PendingCountdown {
  id: number;
  onProceed: () => void;
}

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [pendingCountdown, setPendingCountdown] =
    useState<PendingCountdown | null>(null);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<GameMode>("learning");
  const records = useRecords(mode);
  const { muted, toggle: toggleSound } = useShopAudio(state.basketEvent, state.roundNumber, state.status === "playing" && !paused && !pendingCountdown);

  // Round countdown
  useEffect(() => {
    if (state.status !== "playing" || state.mode === "learning") return;
    if (paused || pendingCountdown) return;
    const interval = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(interval);
  }, [paused, pendingCountdown, state.mode, state.status, state.roundNumber]);

  // A fresh round starts at the top of the shelves
  useEffect(() => {
    if (state.status !== "playing" && state.status !== "planning") return;
    window.scrollTo(0, 0);
    document.getElementById(state.status === "planning" ? "shop-heading" : "store-shelves")?.focus({ preventScroll: true });
  }, [state.status, state.roundNumber]);

  // Persist records (external system) whenever a round resolves
  useEffect(() => {
    if (
      state.status !== "round_won" &&
      state.status !== "lost" &&
      state.status !== "game_won"
    )
      return;
    recordRunProgress(state.totalScore, state.successfulRounds, state.mode);
  }, [state.status, state.totalScore, state.successfulRounds, state.mode]);

  const startRun = () => {
    setPaused(false);
    dispatch({
      type: "START_RUN",
      mode,
      seed: Date.now() % 2147483647,
      bestScore: records.bestScore,
      highestRound: records.highestRound,
    });
  };

  const withCountdown = useCallback((onComplete: () => void) => {
    setPendingCountdown({
      id: Date.now(),
      onProceed: onComplete,
    });
  }, []);
  const endCountdown = useCallback(() => setPendingCountdown(null), []);

  const npc = state.npc;
  const isIdle = state.status === "idle" || !npc;
  const content = isIdle ? (
    <StartScreen
      bestScore={records.bestScore}
      highestRound={records.highestRound}
      showTutorial={!records.tutorialDismissed}
      onDismissTutorial={dismissTutorial}
      onStart={startRun}
      mode={mode}
      onModeChange={setMode}
    />
  ) : (
    <div className="game-world flex min-h-dvh flex-col" data-shop={shopForRound(state.roundNumber).id}>
      <StatusBar
        npc={npc}
        clockLabel={
          state.status === "planning"
            ? "Planning · clock off"
            : state.mode === "learning"
              ? "Learning · no timer"
              : undefined
        }
        roundNumber={state.roundNumber}
        timeRemainingSeconds={state.timeRemainingSeconds}
        roundDurationSeconds={state.roundDurationSeconds}
        muted={muted}
        onToggleMute={toggleSound}
        onPause={() => {
          if (state.status === "playing") setPaused(true);
        }}
        canPause={state.status === "playing" && !pendingCountdown}
      />

      <main className={`shop-workspace ${state.status === "planning" ? "workspace-planning" : "workspace-shopping"}`}>
        <div className="flow-heading">
          <div><p className="text-xs font-bold text-brand-dark">Lunch run · Stop {state.roundNumber}{state.previousAttempt && state.status === "planning" ? " · Try again" : ""}</p><h1 tabIndex={-1} className="font-title text-3xl focus:outline-none" id="shop-heading">{state.status === "planning" ? "Meet & plan" : "Let’s build a lunch."}</h1></div>
          <ol className="flow-steps" aria-label="Your shop">
            <li aria-current={state.status === "planning" ? "step" : undefined}><span>{state.status === "planning" ? "1" : "✓"}</span>Plan</li>
            <li aria-current={state.status !== "planning" ? "step" : undefined}><span>2</span>Shop</li>
            <li><span>3</span>Review</li>
          </ol>
        </div>
        <aside className="shop-companion" aria-label={state.status === "planning" ? "Your lunch order and plan" : "Your order and basket"}>
          {state.status === "planning" ?
            <PlanningPanel
              key={`${state.roundNumber}-${state.previousAttempt ? "retry" : "first"}`}
              state={state}
              onBegin={(estimateCents) => {
                const begin = () => dispatch({ type: "BEGIN_SHOPPING", estimateCents });
                if (state.mode === "standard_run") withCountdown(begin);
                else begin();
              }}
            />
          : <ShoppingOrder key={`order-${state.roundNumber}`} state={state} />}
          {state.status !== "planning" && <PowerUpShelf key={`powerups-${state.roundNumber}`} powerUps={state.powerUps}
            canUseEscapeRope={state.status === "playing" && state.roundNumber < FINAL_ROUND}
            onUseEscapeRope={() => dispatch({ type: "USE_ESCAPE_ROPE" })} />}
          {state.status !== "planning" && <BasketDrawer
            key={`basket-${state.roundNumber}`}
            roundBudgetCents={state.roundBudgetCents}
            event={state.basketEvent}
            challengeTarget={state.retryChallenge?.targetSpendCents}
            basket={state.basket} npc={npc}
            inventory={state.inventory}
            remainingBudgetCents={state.remainingBudgetCents}
            active={state.status === "playing" && !paused && !pendingCountdown}
            timed={state.mode === "standard_run"}
            timeRemainingSeconds={state.timeRemainingSeconds}
            onRemove={(foodItemId) => dispatch({ type: "REMOVE_ITEM", foodItemId })}
            onAdd={(foodItemId) => dispatch({ type: "ADD_ITEM", foodItemId })}
            onCheckout={() => dispatch({ type: "CHECKOUT" })} />}
          {state.status === "planning" && <details className="trail-disclosure"><summary>Your neighbourhood trail</summary><Journey state={state} /></details>}
        </aside>
        <div className="shop-products">
          <StoreList key={`${state.roundNumber}-${state.status === "planning" ? "plan" : "shop"}`}
            inventory={state.inventory} roundNumber={state.roundNumber}
            planning={state.status === "planning"}
            canShop={state.status === "playing" && !paused && !pendingCountdown}
            basket={state.basket} npc={npc} powerUps={state.powerUps} bulkAddsUsed={state.bulkAddsUsed}
            onAdd={(foodItemId) => dispatch({ type: "ADD_ITEM", foodItemId })}
            onRemove={(foodItemId) => dispatch({ type: "REMOVE_ITEM", foodItemId })}
            onBulkAdd={(foodItemId) => dispatch({ type: "BULK_ADD", foodItemId })} />
        </div>
      </main>

      {state.status === "round_won" && (
        <OutcomeModal
          state={state}
          onRetry={(challenge = false) => dispatch({ type: "RETRY_ROUND", challenge })}
          onNextRound={() => dispatch({ type: "NEXT_ROUND" })}
          onChoosePowerUp={(powerUpId) =>
            dispatch({ type: "CHOOSE_POWERUP", powerUpId })
          }
        />
      )}
      {state.status === "lost" && (
        <RunSummary
          state={state}
          onReplay={startRun}
          onRetry={(challenge = false) => dispatch({ type: "RETRY_ROUND", challenge })}
        />
      )}
      {state.status === "game_won" && (
        <RunSummary
          state={state}
          won
          onReplay={startRun}
          onRetry={(challenge = false) => dispatch({ type: "RETRY_ROUND", challenge })}
        />
      )}
    </div>
  );

  return (
    <>
      <div
        className={
          paused ? "blur-sm transition-[filter]" : "transition-[filter]"
        }
        aria-hidden={paused}
      >
        {content}
      </div>
      {paused && <PauseModal onResume={() => setPaused(false)} />}
      {pendingCountdown && (
        <CountdownInterstitial
          key={pendingCountdown.id}
          onProceed={pendingCountdown.onProceed}
          onDone={endCountdown}
        />
      )}
    </>
  );
}
