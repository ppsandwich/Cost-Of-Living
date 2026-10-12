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
  const [bounds, setBounds] = useState<{
    top: number; left: number; width: number; height: number;
    controlsLeft: number; controlsWidth: number;
  } | null>(null);
  const nextButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => nextButton.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const panelElement = panel.current;
    const target = panelElement?.querySelector<HTMLElement>(`[data-tour-step="${step}"]`);
    if (!target) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = Math.min(target.getBoundingClientRect().width + 20, 352, window.innerWidth - 24);
        if (controls.current) {
          controls.current.style.width = `${width}px`;
          // Reserve space below the final, normally pinned Start button.
          panelElement?.style.setProperty("--tour-controls-height", `${controls.current.offsetHeight}px`);
        }
        const rect = target.getBoundingClientRect();
        setBounds({
          top: rect.top - 10, left: rect.left - 10, width: rect.width + 20, height: rect.height + 20,
          controlsLeft: Math.max(12, Math.min(rect.left - 10, window.innerWidth - width - 12)),
          controlsWidth: width,
        });
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    if (controls.current) observer.observe(controls.current);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      panelElement?.style.removeProperty("--tour-controls-height");
    };
  }, [controls, panel, step]);

  return createPortal(<>
    <div className="tour-shade" aria-hidden="true">
      {bounds && <div className="tour-window" style={{ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }} />}
    </div>
    <section ref={controls} className="tour-controls" aria-label="Quick tour" style={bounds ? {
      top: bounds.top + bounds.height + 8,
      left: bounds.controlsLeft,
      width: bounds.controlsWidth,
    } : { visibility: "hidden" }}>
      <p id="tour-instruction"><span className="tour-progress">{step + 1} / {TOUR_STEPS.length}</span> {TOUR_STEPS[step]}</p>
      <div className="tour-buttons">
        <button ref={nextButton} type="button" className="btn bg-good text-white" aria-describedby="tour-instruction" onClick={onNext}>{step === TOUR_STEPS.length - 1 ? "Done ✓" : "Next →"}</button>
        <button type="button" className="btn bg-paper" onClick={onSkip}>Skip</button>
      </div>
    </section>
  </>, document.body);
}
