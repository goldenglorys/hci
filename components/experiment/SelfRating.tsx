"use client";

import { useState } from "react";

interface SelfRatingProps {
  onRate: (rating: number) => void;
  t: {
    rateTitle: string;
    rateDesc: string;
    r1: string;
    r1d: string;
    r2: string;
    r2d: string;
    r3: string;
    r3d: string;
    r4: string;
    r4d: string;
    r5: string;
    r5d: string;
  };
}

const s = {
  card: "#1e293b",
  accentL: "#818cf8",
  muted: "#94a3b8",
  brd: "#334155",
  bg: "#0f172a",
  txt: "#f1f5f9",
  ok: "#22c55e",
  warn: "#f59e0b",
  err: "#ef4444",
};

export default function SelfRating({ onRate, t }: SelfRatingProps) {
  const [rating, setRating] = useState<number | null>(null);

  const opts = [
    { val: 1, label: t.r1, desc: t.r1d, color: s.err },
    { val: 2, label: t.r2, desc: t.r2d, color: s.warn },
    { val: 3, label: t.r3, desc: t.r3d, color: s.ok },
    { val: 4, label: t.r4, desc: t.r4d, color: s.accentL },
    { val: 5, label: t.r5, desc: t.r5d, color: s.accentL },
  ];

  return (
    <div
      style={{
        background: s.card,
        borderRadius: 12,
        padding: 24,
        border: `1px solid ${s.brd}`,
        marginBottom: 16,
      }}
    >
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: s.accentL,
          marginBottom: 4,
        }}
      >
        {t.rateTitle}
      </h3>
      <p style={{ fontSize: 13, color: s.muted, marginBottom: 16 }}>
        {t.rateDesc}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.map((o) => (
          <button
            key={o.val}
            onClick={() => {
              setRating(o.val);
              onRate(o.val);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 8,
              border:
                rating === o.val
                  ? `2px solid ${o.color}`
                  : `1px solid ${s.brd}`,
              background:
                rating === o.val ? s.bg + "ee" : s.bg,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: rating === o.val ? o.color : s.brd,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: rating === o.val ? "#fff" : s.muted,
                fontSize: 14,
                fontWeight: 700,
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {o.val}
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: rating === o.val ? o.color : s.txt,
                }}
              >
                {o.label}
              </div>
              <div style={{ fontSize: 12, color: s.muted }}>{o.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
