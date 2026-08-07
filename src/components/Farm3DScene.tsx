import { useEffect, useState } from "react";

/**
 * Pure-CSS 3D animated agricultural scene: floating sun, a field plane tilted in
 * perspective, growing crop rows, drifting clouds and a protective shield dome.
 */
export function Farm3DScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mx-auto w-full max-w-lg select-none overflow-hidden rounded-3xl border border-border/50 bg-background/40 shadow-elevated backdrop-blur-sm"
    >
      <div className="relative h-[300px] w-full sm:h-[360px]" style={{ perspective: "800px" }}>
        {/* sun */}
        <div className="absolute left-1/2 top-8 h-20 w-20 -translate-x-1/2 rounded-full bg-harvest farm-sun" />
        <div className="absolute left-1/2 top-8 h-20 w-20 -translate-x-1/2 rounded-full bg-harvest/25 farm-pulse" />

        {/* clouds */}
        <div className="absolute top-12 h-5 w-20 rounded-full bg-background/80 blur-[2px] farm-cloud" />
        <div className="absolute top-24 h-4 w-14 rounded-full bg-background/70 blur-[2px] farm-cloud farm-cloud-slow" />

        {/* tilted field plane */}
        <div
          className="absolute bottom-2 left-1/2 h-[150px] w-[86%] overflow-hidden rounded-[36px] bg-gradient-hero farm-ground"
          style={{ transform: "translateX(-50%) rotateX(62deg)", transformStyle: "preserve-3d" }}
        >
          {Array.from({ length: 7 }).map((_, r) => (
            <div
              key={r}
              className="absolute left-0 h-[2px] w-full bg-primary-foreground/25"
              style={{ top: `${10 + r * 13}%` }}
            />
          ))}
        </div>

        {/* growing crops */}
        <div className="absolute bottom-[86px] left-1/2 flex -translate-x-1/2 items-end gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={mounted ? "farm-sprout" : "opacity-0"}
              style={{ animationDelay: `${i * 0.15}s`, height: `${32 + (i % 3) * 12}px` }}
            >
              <div className="mx-auto h-full w-[3px] rounded-full bg-primary" />
              <div className="-mt-4 flex justify-center">
                <span className="block h-3 w-3 rotate-45 rounded-tl-full rounded-br-full bg-primary/80" />
                <span className="block h-3 w-3 -rotate-45 rounded-tr-full rounded-bl-full bg-primary/60" />
              </div>
            </div>
          ))}
        </div>

        {/* shield dome */}
        <div className="absolute bottom-[78px] left-1/2 h-[140px] w-[62%] -translate-x-1/2 rounded-t-full border-2 border-primary/40 bg-primary/5 farm-dome" />
      </div>
    </div>
  );
}
