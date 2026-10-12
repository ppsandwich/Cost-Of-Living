import type { NPC } from "@/types/npc";

export function NPCDifficulty({ npc }: { npc: NPC }) {
  return <p className="npc-difficulty" title={`${npc.wants.length} food wishes to meet`}>
    Difficulty {npc.wants.length}/4 <span aria-hidden>{"★".repeat(npc.wants.length)}{"☆".repeat(4 - npc.wants.length)}</span>
  </p>;
}
