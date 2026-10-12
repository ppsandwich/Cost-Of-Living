import { useEffect, useState, type RefObject } from "react";

export const TOUR_STEPS = [
  "Meet your customer",
  "Check their wishes and foods to avoid",
  "Check your budget",
  "Check your power-ups",
  "Start shopping when you’re ready",
] as const;

/** A short, non-blocking tour. Interaction hands control back to the player. */
export function useFirstRoundTour(enabled: boolean, panel: RefObject<HTMLElement | null>) {
  const [step, setStep] = useState(0);
  const running = enabled && step < TOUR_STEPS.length;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), 1000);
    return () => window.clearTimeout(timer);
  }, [running, step]);

  useEffect(() => {
    if (!running) return;
    const finish = () => setStep(TOUR_STEPS.length);
    window.addEventListener("pointerdown", finish, { once: true });
    window.addEventListener("keydown", finish, { once: true });
    return () => {
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
    };
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const frame = requestAnimationFrame(() => {
      const target = panel.current?.querySelector<HTMLElement>(`[data-tour-step="${step}"]`);
      const companion = panel.current?.closest<HTMLElement>(".planning-companion");
      if (!target || !companion) return;
      const rect = target.getBoundingClientRect();
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      // The mobile start button is fixed to the viewport and needs no scrolling.
      if (step === 4 && !desktop) return;
      const behaviour = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const actions = panel.current?.querySelector(".plan-actions")?.getBoundingClientRect();
      const start = panel.current?.querySelector(".planning-start")?.getBoundingClientRect();
      const bounds = companion.getBoundingClientRect();
      let top = Math.max(headerBottom, desktop ? bounds.top : 0) + 16;
      // On desktop the estimate and start area stays pinned inside the ticket.
      let bottom = Math.min(window.innerHeight, desktop ? bounds.bottom : window.innerHeight,
        step === 4 ? Infinity : desktop ? actions?.top ?? Infinity : start?.top ?? Infinity) - 16;
      if (rect.top >= top && rect.bottom <= bottom) return;
      // On short desktop windows, first bring the whole sticky ticket into view.
      const pageOffset = desktop ? Math.min(
        Math.max(0, bounds.top - headerBottom - 16),
        Math.max(0, bounds.bottom - window.innerHeight + 16),
      ) : 0;
      if (pageOffset > 0) {
        window.scrollBy({ top: pageOffset, behavior: behaviour });
        top = Math.max(headerBottom, bounds.top - pageOffset) + 16;
        bottom = Math.min(window.innerHeight, bounds.bottom - pageOffset,
          step === 4 ? Infinity : (actions?.top ?? Infinity) - pageOffset) - 16;
      }
      const targetTop = rect.top - pageOffset;
      const targetBottom = rect.bottom - pageOffset;
      if (targetTop >= top && targetBottom <= bottom) return;
      const offset = rect.height > bottom - top ? targetTop - top : (targetTop + targetBottom - top - bottom) / 2;
      if (desktop) companion.scrollBy({ top: offset, behavior: behaviour });
      else window.scrollBy({ top: offset, behavior: behaviour });
    });
    return () => cancelAnimationFrame(frame);
  }, [panel, running, step]);

  return running ? step : -1;
}
