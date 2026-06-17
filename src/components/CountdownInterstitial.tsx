import { useEffect, useState } from "react";

interface CountdownInterstitialProps {
  onProceed: () => void;
  onDone: () => void;
}

export function CountdownInterstitial({ onProceed, onDone }: CountdownInterstitialProps) {
  const [label, setLabel] = useState("3");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const two = window.setTimeout(() => setLabel("2"), 1000);
    const one = window.setTimeout(() => setLabel("1"), 2000);
    const go = window.setTimeout(() => setLabel("GO!"), 3000);
    const fade = window.setTimeout(() => {
      setFading(true);
      onProceed();
    }, 3400);
    const done = window.setTimeout(onDone, 3850);

    return () => {
      window.clearTimeout(two);
      window.clearTimeout(one);
      window.clearTimeout(go);
      window.clearTimeout(fade);
      window.clearTimeout(done);
    };
  }, [onDone, onProceed]);

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-label={label === "GO!" ? "Go" : `Starting in ${label}`}
      className={`countdown-screen fixed inset-0 z-[80] grid place-items-center bg-brand ${
        fading ? "countdown-screen-fade" : ""
      }`}
    >
      <span
        key={label}
        aria-hidden
        className={`countdown-number font-knewave leading-none text-tag ${
          label === "GO!" ? "text-[min(32vw,12rem)]" : "text-[min(44vw,18rem)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
