import { useCallback, useEffect, useRef, useState } from "react";
import type { BasketEvent } from "@/types/game";
import { shopForRound } from "@/game/shops";

export function useShopAudio(event: BasketEvent | null, round: number, active: boolean) {
  const [muted, setMuted] = useState(true);
  const context = useRef<AudioContext | null>(null);
  const tone = useCallback((notes: readonly number[], volume = 0.025) => {
    const ctx = context.current;
    if (!ctx || ctx.state !== "running") return;
    notes.forEach((frequency, i) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.09;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.22);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }, []);
  const toggle = useCallback(() => {
    if (muted) {
      // Create/resume only from the player's sound button gesture.
      if (!window.AudioContext) return;
      context.current ??= new AudioContext();
      void context.current.resume().then(() => tone([523, 659])).catch(() => setMuted(true));
    } else {
      void context.current?.suspend();
    }
    setMuted(!muted);
  }, [muted, tone]);
  useEffect(() => {
    if (event && active) tone(event.kind === "remove" ? [520, 390] : event.newRoles.length >= 2 ? [523, 659, 784] : [660, 880]);
  }, [event, active, tone]);
  useEffect(() => {
    if (muted || !active) { void context.current?.suspend(); return; }
    void context.current?.resume();
    const interval = window.setInterval(() => tone(shopForRound(round).sound, 0.007), 10000);
    return () => window.clearInterval(interval);
  }, [muted, active, round, tone]);
  useEffect(() => () => { void context.current?.close(); }, []);
  return { muted, toggle };
}
