"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CountUp({
  to,
  durationMs = 900,
  format,
}: {
  to: number;
  durationMs?: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const formatter = useMemo(() => {
    return (
      format ??
      ((n: number) =>
        new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 }).format(n))
    );
  }, [format]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHasStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const target = Math.max(0, Math.floor(to));
    const dur = clamp(durationMs, 200, 3000);

    const tick = (now: number) => {
      const t = clamp((now - start) / dur, 0, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (target - from) * eased);
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasStarted, to, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      {formatter(value)}
    </span>
  );
}

