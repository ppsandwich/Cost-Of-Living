import { Dialog } from "./Dialog";
export function PauseModal({ onResume }: { onResume: () => void }) {
  return (
    <Dialog title="Game paused">
      <button
        onClick={onResume}
        className="btn mt-5 min-h-12 w-full bg-good text-white"
      >
        Resume
      </button>
    </Dialog>
  );
}
