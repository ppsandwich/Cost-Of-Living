import { useEffect, useId, useRef, type ReactNode } from "react";
export function Dialog({
  title,
  children,
  compact = false,
  portrait,
}: {
  title: string;
  children: ReactNode;
  compact?: boolean;
  portrait?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    titleRef.current?.focus({ preventScroll: true });
    dialog.scrollTop = 0;
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={(e) => e.preventDefault()}
      className={`panel dialog-enter fixed inset-0 m-auto w-[calc(100%_-_1.5rem)] overflow-y-auto backdrop:bg-ink/70 ${compact ? "round-result max-h-[calc(100dvh_-_1.5rem)] max-w-xl p-3" : "max-h-[90dvh] max-w-md p-5"}`}
    >
      <div className="flex items-center gap-3">
        {portrait}
        <h2 ref={titleRef} tabIndex={-1} id={id} className={`font-title text-brand focus:outline-none ${compact ? "text-2xl" : "text-3xl"}`}>
          {title}
        </h2>
      </div>
      {children}
    </dialog>
  );
}
