export function PauseModal({ onResume }: { onResume: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="fixed inset-0 z-[70] grid place-items-center bg-ink/75 p-4 backdrop-blur-md"
    >
      <div className="panel w-full max-w-xs p-5 text-center">
        <h2 id="pause-title" className="font-title text-4xl tracking-wide text-brand">
          Game paused
        </h2>
        <button
          type="button"
          onClick={onResume}
          className="btn font-knewave mt-5 min-h-13 w-full bg-good py-2.5 text-base uppercase text-white"
        >
          Resume
        </button>
      </div>
    </div>
  );
}
