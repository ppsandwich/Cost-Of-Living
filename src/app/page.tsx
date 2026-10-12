"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { gameReducer, INITIAL_STATE } from "@/game/reducer";
import {
  recordRunProgress,
  useRecords,
} from "@/utils/records";
import { useGameSettings, saveGameSettings } from "@/utils/settings";
import { StatusBar } from "@/components/StatusBar";
import { StoreList } from "@/components/StoreList";
import { BasketDrawer } from "@/components/BasketDrawer";
import { OutcomeModal } from "@/components/OutcomeModal";
import { RunSummary } from "@/components/RunSummary";
import { StartScreen } from "@/components/StartScreen";
import { PowerUpShelf } from "@/components/PowerUps";
import { Dialog } from "@/components/Dialog";
import { PauseModal } from "@/components/PauseModal";
import { PlanningPanel } from "@/components/PlanningPanel";
import { ShoppingOrder } from "@/components/ShoppingOrder";
import { Journey } from "@/components/Journey";
import { shopForRound } from "@/game/shops";
import { useShopAudio } from "@/hooks/useShopAudio";
import type { GameMode } from "@/types/game";
import { FINAL_ROUND } from "@/game/progression";

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [restartOpen, setRestartOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [openingShop, setOpeningShop] = useState(false);
  const [shelfVisit, setShelfVisit] = useState(0);
  const openingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (openingTimer.current) clearTimeout(openingTimer.current); }, []);
  const [mode, setMode] = useState<GameMode>("learning");
  const records = useRecords(mode);
  const settings = useGameSettings();
  const { muted, toggle: toggleSound } = useShopAudio(state.basketEvent, state.roundNumber, state.status === "playing" && !paused && !restartOpen && !state.basketReviewOpen);

  // Shopping timer
  useEffect(() => {
    if (state.status !== "playing" || state.mode === "learning") return;
    if (paused || restartOpen || state.basketReviewOpen) return;
    const interval = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(interval);
  }, [paused, restartOpen, state.mode, state.status, state.roundNumber, state.basketReviewOpen]);

  // Only a fresh plan resets the scroll; starting shopping keeps the same shelves.
  useEffect(() => {
    if (state.status !== "playing" && state.status !== "planning") return;
    if (state.status === "planning") window.scrollTo(0, 0);
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

  const resetRun = () => {
    if (openingTimer.current) clearTimeout(openingTimer.current);
    openingTimer.current = null;
    setOpeningShop(false);
    setPaused(false);
    setRestartOpen(false);
    dispatch({ type: "RESET_RUN" });
    window.scrollTo(0, 0);
  };
  const startRun = () => {
    setPaused(false);
    setShelfVisit((visit) => visit + 1);
    dispatch({
      type: "START_RUN",
      mode,
      ...settings,
      seed: Date.now() % 2147483647,
      bestScore: records.bestScore,
      highestRound: records.highestRound,
    });
  };

  const beginShopping = (estimateCents: number | null) => {
    if (state.status !== "planning" || openingShop || openingTimer.current) return;
    document.getElementById("store-shelves")?.focus({ preventScroll: true });
    setOpeningShop(true);
    const begin = () => {
      dispatch({ type: "BEGIN_SHOPPING", estimateCents });
      setOpeningShop(false);
    };
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 560;
    openingTimer.current = setTimeout(() => {
      openingTimer.current = null;
      begin();
    }, duration);
  };
  const retryRound = (challenge = false) => {
    setShelfVisit((visit) => visit + 1);
    dispatch({ type: "RETRY_ROUND", challenge });
  };
  const planningView = state.status === "planning" && !openingShop;
  const npc = state.npc;
  const isIdle = state.status === "idle" || !npc;
  const content = isIdle ? (
    <StartScreen
      bestScore={records.bestScore}
      highestRound={records.highestRound}
      settings={settings}
      onSettingsChange={saveGameSettings}
      onStart={startRun}
      mode={mode}
      onModeChange={setMode}
    />
  ) : (
    <div className="game-world flex min-h-dvh flex-col" data-shop={shopForRound(state.roundNumber).id}>
      <div className="store-backdrop" aria-hidden="true" />
      <StatusBar
        npc={npc}
        clockLabel={
          state.status === "planning"
            ? "Planning · clock off"
            : state.mode === "learning"
              ? "Learning · no timer"
              : state.basketReviewOpen ? "Review · clock paused" : undefined
        }
        roundNumber={state.roundNumber}
        timeRemainingSeconds={state.timeRemainingSeconds}
        roundDurationSeconds={state.roundDurationSeconds}
        muted={muted}
        onToggleMute={toggleSound}
        onPause={() => {
          if (state.status === "playing") setPaused(true);
        }}
        onRestart={() => {
          if (openingTimer.current) clearTimeout(openingTimer.current);
          openingTimer.current = null;
          setOpeningShop(false);
          setRestartOpen(true);
        }}
        canPause={state.status === "playing" && !restartOpen}
      />

      <main className={`shop-workspace ${planningView ? "workspace-planning" : "workspace-shopping"}`}>
        <div className="flow-heading">
          <div><p className="text-xs font-bold text-brand-dark">Lunch run · Stop {state.roundNumber}{state.previousAttempt && state.status === "planning" ? " · Try again" : ""}</p><h1 tabIndex={-1} className="font-title text-3xl focus:outline-none" id="shop-heading">{state.status === "planning" ? "Meet & plan" : "Let’s build a lunch."}</h1></div>
          <ol className="flow-steps" aria-label="Your shop">
            <li aria-current={state.status === "planning" ? "step" : undefined}><span>{state.status === "planning" ? "1" : "✓"}</span>Plan</li>
            <li aria-current={state.status !== "planning" ? "step" : undefined}><span>2</span>Shop</li>
            <li><span>3</span>Review</li>
          </ol>
        </div>
        <aside className="shop-companion planning-companion" aria-label="Your lunch order and plan" aria-hidden={!planningView} inert={!planningView}>
          <div className="companion-content">
            <PlanningPanel
              key={`${state.roundNumber}-${shelfVisit}`}
              state={state}
              onBegin={beginShopping}
            />
            <details className="trail-disclosure"><summary>Your neighbourhood trail</summary><Journey state={state} /></details>
          </div>
        </aside>
        <aside className="shop-companion shopping-companion" aria-label="Your order and basket" aria-hidden={planningView} inert={planningView || openingShop}>
          <div className="companion-content">
            <ShoppingOrder key={`order-${state.roundNumber}-${shelfVisit}`} state={state} />
            <PowerUpShelf key={`powerups-${state.roundNumber}`} powerUps={state.powerUps}
              canUseEscapeRope={state.status === "playing" && state.roundNumber < FINAL_ROUND}
              onUseEscapeRope={() => dispatch({ type: "USE_ESCAPE_ROPE" })} />
            <BasketDrawer
              key={`basket-${state.roundNumber}-${shelfVisit}`}
              open={state.basketReviewOpen}
              onOpen={() => dispatch({ type: "OPEN_BASKET" })}
              onClose={() => dispatch({ type: "CLOSE_BASKET" })}
              roundBudgetCents={state.roundBudgetCents}
              event={state.basketEvent}
              challengeTarget={state.retryChallenge?.targetSpendCents}
              basket={state.basket} npc={npc}
              remainingBudgetCents={state.remainingBudgetCents}
              active={state.status === "playing" && !paused && !restartOpen}
              timed={state.mode === "standard_run"}
              timeRemainingSeconds={state.timeRemainingSeconds}
              onRemove={(foodItemId) => dispatch({ type: "REMOVE_ITEM", foodItemId })}
              onCheckout={() => dispatch({ type: "CHECKOUT" })} />
          </div>
        </aside>
        <div className="shop-products">
          <StoreList key={`${state.roundNumber}-${shelfVisit}`}
            inventory={state.inventory} roundNumber={state.roundNumber}
            planning={planningView}
            canShop={state.status === "playing" && !paused && !restartOpen}
            basket={state.basket} npc={npc} powerUps={state.powerUps}
            onAdd={(foodItemId) => dispatch({ type: "ADD_ITEM", foodItemId })}
            onRemove={(foodItemId) => dispatch({ type: "REMOVE_ITEM", foodItemId })}
          />
        </div>
      </main>

      {state.status === "round_won" && (
        <OutcomeModal
          state={state}
          onNextRound={() => dispatch({ type: "NEXT_ROUND" })}
          onChoosePowerUp={(powerUpId) =>
            dispatch({ type: "CHOOSE_POWERUP", powerUpId })
          }
        />
      )}
      {state.status === "lost" && (
        <RunSummary
          state={state}
          onReplay={resetRun}
          onRetry={retryRound}
        />
      )}
      {state.status === "game_won" && (
        <RunSummary
          state={state}
          won
          onReplay={resetRun}
          onRetry={retryRound}
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
      {restartOpen && <Dialog title="Restart this run?" onClose={() => setRestartOpen(false)}>
        <p className="my-4 text-sm">You’ll lose this run’s progress and return to the start screen. Your saved settings and best scores will stay.</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn min-h-12 bg-paper" onClick={() => setRestartOpen(false)}>Keep playing</button>
          <button className="btn min-h-12 bg-danger text-white" onClick={resetRun}>Restart run</button>
        </div>
      </Dialog>}
    </>
  );
}
