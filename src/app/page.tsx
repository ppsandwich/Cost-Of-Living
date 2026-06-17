"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { gameReducer, INITIAL_STATE } from "@/game/reducer";
import { dismissTutorial, recordRunProgress, useRecords } from "@/utils/records";
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

interface PendingCountdown {
  id: number;
  onProceed: () => void;
}

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [pendingCountdown, setPendingCountdown] = useState<PendingCountdown | null>(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const records = useRecords();

  // Round countdown
  useEffect(() => {
    if (state.status !== "playing") return;
    if (paused) return;
    const interval = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(interval);
  }, [paused, state.status, state.roundNumber]);

  // A fresh round starts at the top of the shelves
  useEffect(() => {
    if (state.status !== "playing") return;
    window.scrollTo(0, 0);
  }, [state.status, state.roundNumber]);

  // Persist records (external system) whenever a round resolves
  useEffect(() => {
    if (state.status !== "round_won" && state.status !== "lost" && state.status !== "game_won")
      return;
    recordRunProgress(state.totalScore, state.successfulRounds);
  }, [state.status, state.totalScore, state.successfulRounds]);

  const startRun = () => {
    setPaused(false);
    dispatch({
      type: "START_RUN",
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
      onStart={() => withCountdown(startRun)}
    />
  ) : (
    <div className="flex min-h-dvh flex-col">
      <StatusBar
        npc={npc}
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

      <main className="mx-auto w-full max-w-md flex-1 px-3 pb-3 pt-2 lg:grid lg:max-w-6xl lg:grid-cols-[320px_1fr_340px] lg:items-start lg:gap-4">
        <div className="space-y-3 lg:sticky lg:top-28">
          <NPCPanel npc={npc} basket={state.basket} />
          <PowerUpShelf key={state.roundNumber} powerUps={state.powerUps} />
          <p
            aria-live="polite"
            className="min-h-5 px-1 text-xs font-semibold italic text-ink/70"
          >
            {state.lastFeedback && <>💬 {state.lastFeedback}</>}
          </p>
        </div>

        {/* bottom padding keeps the last food card clear of the fixed mobile drawer */}
        <div className="mt-3 pb-80 lg:mt-0 lg:pb-0">
          <StoreList
            inventory={state.inventory}
            basket={state.basket}
            npc={npc}
            powerUps={state.powerUps}
            bulkAddsUsed={state.bulkAddsUsed}
            onAdd={(foodItemId) => dispatch({ type: "ADD_ITEM", foodItemId })}
            onRemove={(foodItemId) => dispatch({ type: "REMOVE_ITEM", foodItemId })}
            onBulkAdd={(foodItemId) => dispatch({ type: "BULK_ADD", foodItemId })}
          />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 lg:sticky lg:top-28">
          <BasketDrawer
            basket={state.basket}
            stats={state.stats}
            npc={npc}
            remainingBudgetCents={state.remainingBudgetCents}
            onRemove={(foodItemId) => dispatch({ type: "REMOVE_ITEM", foodItemId })}
            onAdd={(foodItemId) => dispatch({ type: "ADD_ITEM", foodItemId })}
            onCheckout={() => dispatch({ type: "CHECKOUT" })}
          />
        </div>
      </main>

      {state.status === "round_won" && (
        <OutcomeModal
          state={state}
          onNextRound={() => dispatch({ type: "NEXT_ROUND" })}
          onChoosePowerUp={(powerUpId) => dispatch({ type: "CHOOSE_POWERUP", powerUpId })}
        />
      )}
      {state.status === "lost" && <RunSummary state={state} onReplay={startRun} />}
      {state.status === "game_won" && <RunSummary state={state} won onReplay={startRun} />}
    </div>
  );

  return (
    <>
      <div
        className={paused ? "blur-sm transition-[filter]" : "transition-[filter]"}
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
