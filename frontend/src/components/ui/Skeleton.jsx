// ─── Base Skeleton ────────────────────────────────────────────────────────────
// A single pulsing gray rectangle — compose these to match real layouts.

export function Skeleton({ className = "" }) {
  return (
    <div className={`bg-gray-800 rounded-md animate-pulse ${className}`} />
  );
}

// Circular skeleton (avatars)
export function SkeletonCircle({ size = "md" }) {
  const s = { sm: "w-6 h-6", md: "w-9 h-9", lg: "w-11 h-11" };
  return (
    <div
      className={`bg-gray-800 rounded-full animate-pulse shrink-0 ${s[size] ?? s.md}`}
    />
  );
}

// Multiple stacked text lines — last line is narrower (natural look)
export function SkeletonText({ lines = 2, className = "" }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 && lines > 1 ? "w-3/5" : "w-full"}`}
        />
      ))}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
// Inline spinning ring — use for buttons, overlays, small states.

export function Spinner({ size = "md", className = "" }) {
  const s = {
    xs: "w-3 h-3 border-[1.5px]",
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-[3px]",
  };
  return (
    <span
      className={`
        ${s[size] ?? s.md}
        border-indigo-500 border-t-transparent
        rounded-full animate-spin inline-block shrink-0
        ${className}
      `}
    />
  );
}
