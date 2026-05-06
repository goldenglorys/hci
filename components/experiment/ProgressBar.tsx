"use client";

interface ProgressBarProps {
  pct: number;
}

export default function ProgressBar({ pct }: ProgressBarProps) {
  return (
    <div
      style={{
        height: 6,
        borderRadius: 3,
        background: "#334155",
        overflow: "hidden",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 3,
          background: "linear-gradient(90deg,#6366f1,#22c55e)",
          width: `${pct}%`,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}
