import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { TOUR_STEPS } from "@/hooks/useFirstRoundTour";

export function TourSpotlight({ step, panel, controls, onNext, onSkip }: {
  step: number;
  panel: RefObject<HTMLElement | null>;
  controls: RefObject<HTMLElement | null>;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [bounds, setBounds] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const nextButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => nextButton.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const target = panel.current?.querySelector<HTMLElement>(`[data-tour-step="${step}"]`);
    if (!target) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        setBounds({ top: rect.top - 10, left: rect.left - 10, width: rect.width + 20, height: rect.height + 20 });
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [panel, step]);

  return createPortal(<>
    <div className="tour-shade" aria-hidden="true">
      {bounds && <div className="tour-window" style={bounds} />}
    </div>
    <section ref={controls} className="tour-controls" aria-label="Quick tour">
      <p id="tour-instruction"><span className="tour-progress">{step + 1} / {TOUR_STEPS.length}</span> {TOUR_STEPS[step]}</p>
      <div className="tour-buttons">
        <button ref={nextButton} type="button" className="btn bg-good text-white" aria-describedby="tour-instruction" onClick={onNext}>{step === TOUR_STEPS.length - 1 ? "Done ✓" : "Next →"}</button>
        <button type="button" className="btn bg-paper" onClick={onSkip}>Skip</button>
      </div>
    </section>
  </>, document.body);
}
