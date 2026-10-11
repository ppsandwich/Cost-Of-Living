import { useEffect, useId, useRef, type ReactNode } from "react";
export function Dialog({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={(e) => e.preventDefault()}
      className="panel fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto p-5 backdrop:bg-ink/70"
    >
      <h2 id={id} className="font-title text-3xl text-brand">
        {title}
      </h2>
      {children}
    </dialog>
  );
}
