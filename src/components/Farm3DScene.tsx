import { useEffect, useState } from "react";

/**
 * Pure-CSS 3D animated agricultural scene: rotating sun, layered fields in
 * perspective, growing crop rows, drifting clouds and a protective shield dome.
 */
export function Farm3DScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mx-auto h-[320px] w-full max-w-xl select-none overflow-hidden rounded-3xl sm:h-[400px]"
      style={{ perspective: "900px" }}
    >
      {/* sun */}
      <div className="absolute left-1/2 top-6 h-24 w-24 -translate-x-1/2 rounded-full bg-harvest/80 blur-[2px] farm-sun" />
      <div className="absolute left-1/2 top-6 h-24 w-24 -translate-x-1/2 rounded-full bg-harvest/30 farm-pulse" />

      {/* clouds */}
      <div className="absolute top-10 h-6 w-24 rounded-full bg-background/70 blur-sm farm-cloud" />
      <div className="absolute top-24 h-4 w-16 rounded-full bg-background/60 blur-sm farm-cloud farm-cloud-slow" />

      {/* ground plane */}
      <div
        className="absolute bottom-0 left-1/2 h-[200px] w-[120%] -translate-x-1/2 overflow-hidden rounded-t-[40%] farm-ground"
        style={{ transform: "translateX(-50%) rotateX(62deg)", transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        {/* crop rows */}
        {Array.from({ length: 7 }).map((_, r) => (
          <div
            key={r}
            className="absolute left-0 h-[3px] w-full bg-primary-foreground/25"
            style={{ top: `${8 + r * 14}%` }}
          />
        ))}
      </div>

      {/* growing crops */}
      <div className="absolute bottom-[70px] left-1/2 flex -translate-x-1/2 items-end gap-3 sm:gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={mounted ? "farm-sprout" : ""}
            style={{ animationDelay: `${i * 0.14}s`, height: `${34 + (i % 3) * 12}px` }}
          >
            <div className="mx-auto h-full w-[3px] rounded-full bg-primary" />
            <div className="-mt-3 flex justify-center gap-[2px]">
              <span className="block h-3 w-3 rotate-45 rounded-tl-full rounded-br-full bg-primary/80" />
              <span className="block h-3 w-3 -rotate-45 rounded-tr-full rounded-bl-full bg-primary/60" />
            </div>
          </div>
        ))}
      </div>

      {/* shield dome */}
      <div className="absolute bottom-[64px] left-1/2 h-[170px] w-[260px] -translate-x-1/2 rounded-t-full border-2 border-primary/40 bg-primary/5 farm-dome sm:w-[360px]" />
    </div>
  );
}
