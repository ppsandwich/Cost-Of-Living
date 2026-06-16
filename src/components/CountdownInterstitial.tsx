import { useEffect, useState } from "react";

interface CountdownInterstitialProps {
  onComplete: () => void;
}

export function CountdownInterstitial({ onComplete }: CountdownInterstitialProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const two = window.setTimeout(() => setCount(2), 1000);
    const one = window.setTimeout(() => setCount(1), 2000);
    const done = window.setTimeout(onComplete, 3000);

    return () => {
      window.clearTimeout(two);
      window.clearTimeout(one);
      window.clearTimeout(done);
    };
  }, [onComplete]);

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-label={`Starting in ${count}`}
      className="fixed inset-0 z-[80] grid place-items-center bg-brand"
    >
      <span
        key={count}
        aria-hidden
        className="countdown-number font-knewave text-[min(44vw,18rem)] leading-none text-tag"
      >
        {count}
      </span>
    </div>
  );
}
