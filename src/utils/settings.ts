import { useSyncExternalStore } from "react";
import type { Difficulty } from "@/types/game";

export interface GameSettings {
  difficulty: Difficulty;
  powerUpsEnabled: boolean;
  allowRetries: boolean;
}
export const DEFAULT_SETTINGS: GameSettings = { difficulty: 2, powerUpsEnabled: true, allowRetries: false };
const STORAGE_KEY = "cost-of-living-settings";
let snapshot: GameSettings | undefined;
const listeners = new Set<() => void>();

export function parseGameSettings(raw: string | null): GameSettings {
  try {
    const value = JSON.parse(raw ?? "null");
    return {
      allowRetries: value?.allowRetries === true,
      difficulty: [1, 2, 3].includes(value?.difficulty) ? value.difficulty : 2,
      powerUpsEnabled: typeof value?.powerUpsEnabled === "boolean" ? value.powerUpsEnabled : true,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
function getSnapshot(): GameSettings {
  if (!snapshot) {
    try { snapshot = parseGameSettings(localStorage.getItem(STORAGE_KEY)); }
    catch { snapshot = { ...DEFAULT_SETTINGS }; }
  }
  return snapshot;
}
function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  snapshot = undefined;
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  if (!listeners.size) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
export function saveGameSettings(changes: Partial<GameSettings>) {
  snapshot = { ...getSnapshot(), ...changes };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Keep this visit's settings when storage is unavailable. */ }
  listeners.forEach((listener) => listener());
}
export function useGameSettings(): GameSettings {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_SETTINGS);
}
