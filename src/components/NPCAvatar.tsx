import type { NPC } from "@/types/npc";

export function NPCAvatar({
  npc,
  compact = false,
  happy = false,
}: {
  npc: NPC;
  compact?: boolean;
  happy?: boolean;
}) {
  return (
    <span
      key={`${npc.id}-${happy}`}
      aria-hidden
      className={`npc-avatar ${compact ? "npc-avatar-compact" : ""} ${happy ? "npc-avatar-happy" : ""}`}
    >
      <span className="npc-face">{npc.emoji}</span>
      {!compact && <span className="npc-avatar-spark">{happy ? "♥" : "✦"}</span>}
    </span>
  );
}

export function NPCelebration({ npc, won = true }: { npc: NPC; won?: boolean }) {
  return (
    <div className={`npc-celebration ${won ? "npc-celebration-won" : ""}`}>
      {won && <div aria-hidden className="sunburst-spin round-clear-burst absolute" />}
      <div className="relative flex items-center justify-center gap-5">
        {won && <span aria-hidden className="star-pop text-3xl">✨</span>}
        <NPCAvatar npc={npc} happy={won} />
        {won && <span aria-hidden className="star-pop text-3xl" style={{ animationDelay: "180ms" }}>✨</span>}
      </div>
      <p className="relative mt-3 font-display text-lg">
        {won ? `${npc.name}’s lunch is in the bag!` : `A fresh plan for ${npc.name}`}
      </p>
    </div>
  );
}
