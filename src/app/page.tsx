"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { gameReducer, INITIAL_STATE } from "@/game/reducer";
import {
  dismissTutorial,
  recordRunProgress,
  useRecords,
} from "@/utils/records";
import { StatusBar } from "@/components/StatusBar";
import { NPCPanel } from "@/components/NPCPanel";
import { StoreList } from "@/components/StoreList";
import { BasketDrawer } from "@/components/BasketDrawer";
import { OutcomeModal } from "@/components/OutcomeModal";
import { RunSummary } from "@/components/RunSummary";
import { StartScreen } from "@/components/StartScreen";
import { PowerUpShelf } from "@/components/PowerUps";
import { CountdownInterstitial } from "@/components/CountdownInterstitial";
import { PauseModal } from "@/components/PauseModal";
import { PlanningPanel } from "@/components/PlanningPanel";
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
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<GameMode>("learning");
  const records = useRecords(mode);

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
    <div className="flex min-h-dvh flex-col">
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
        budgetMultiplier={state.budgetMultiplier}
        timeRemainingSeconds={state.timeRemainingSeconds}
        roundDurationSeconds={state.roundDurationSeconds}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        onPause={() => {
          if (state.status === "playing") setPaused(true);
        }}
        canPause={state.status === "playing" && !pendingCountdown}
      />

      <main
        className={`mx-auto w-full max-w-md flex-1 px-3 pb-3 pt-2 lg:grid lg:max-w-6xl lg:items-start lg:gap-4 ${state.status === "planning" ? "lg:grid-cols-[340px_1fr]" : "lg:grid-cols-[280px_1fr_320px]"}`}
      >
        <div
          className={`space-y-3 ${state.status === "planning" ? "" : "lg:sticky lg:top-28"}`}
        >
          <NPCPanel npc={npc} basket={state.basket} />
          {state.status === "planning" && (
            <PlanningPanel
              key={`${state.roundNumber}-${state.previousAttempt ? "retry" : "first"}`}
              state={state}
              onBegin={(estimateCents) => {
                const begin = () =>
                  dispatch({
                    type: "BEGIN_SHOPPING",
                    estimateCents,
                  });
                if (state.mode === "standard_run") withCountdown(begin);
                else begin();
              }}
            />
          )}
          <PowerUpShelf
            key={state.roundNumber}
            powerUps={state.powerUps}
            canUseEscapeRope={
              state.status === "playing" && state.roundNumber < FINAL_ROUND
            }
            onUseEscapeRope={() => dispatch({ type: "USE_ESCAPE_ROPE" })}
          />
          <p
            aria-live="polite"
            className="min-h-5 px-1 text-xs font-semibold italic text-ink/70"
          >
            {state.lastFeedback && <>💬 {state.lastFeedback}</>}
          </p>
        </div>

        {/* bottom padding keeps the last food card clear of the fixed mobile drawer */}
        <div
          className={`mt-3 lg:mt-0 lg:pb-0 ${state.status === "planning" ? "pb-24" : "pb-64"}`}
        >
          <StoreList
            inventory={state.inventory}
            canShop={state.status === "playing" && !paused && !pendingCountdown}
            basket={state.basket}
            npc={npc}
            powerUps={state.powerUps}
            bulkAddsUsed={state.bulkAddsUsed}
            onAdd={(foodItemId) => dispatch({ type: "ADD_ITEM", foodItemId })}
            onRemove={(foodItemId) =>
              dispatch({ type: "REMOVE_ITEM", foodItemId })
            }
            onBulkAdd={(foodItemId) =>
              dispatch({ type: "BULK_ADD", foodItemId })
            }
          />
        </div>

        {state.status !== "planning" && (
          <div className="fixed inset-x-0 bottom-0 z-30 lg:sticky lg:top-28">
            <BasketDrawer
              basket={state.basket}
              npc={npc}
              remainingBudgetCents={state.remainingBudgetCents}
              onRemove={(foodItemId) =>
                dispatch({ type: "REMOVE_ITEM", foodItemId })
              }
              onAdd={(foodItemId) => dispatch({ type: "ADD_ITEM", foodItemId })}
              onCheckout={() => dispatch({ type: "CHECKOUT" })}
            />
          </div>
        )}
      </main>

      {state.status === "planning" && (
        <a
          href="#shopping-plan"
          className="btn fixed inset-x-3 bottom-3 z-30 flex min-h-12 items-center justify-center bg-good text-white lg:hidden"
        >
          Back to start shopping
        </a>
      )}
      {state.status === "round_won" && (
        <OutcomeModal
          state={state}
          onRetry={() => dispatch({ type: "RETRY_ROUND" })}
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
          onRetry={() => dispatch({ type: "RETRY_ROUND" })}
        />
      )}
      {state.status === "game_won" && (
        <RunSummary
          state={state}
          won
          onReplay={startRun}
          onRetry={() => dispatch({ type: "RETRY_ROUND" })}
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
