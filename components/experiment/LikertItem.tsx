"use client";

import type { IMIItem } from "@/types/experiment";

interface LikertItemProps {
  item: IMIItem;
  value: number | undefined;
  onChange: (v: number) => void;
  lang: string;
  t: { notTrue: string; veryTrue: string };
}

const s = {
  card: "#1e293b",
  accent: "#6366f1",
  txt: "#f1f5f9",
  muted: "#94a3b8",
  dim: "#64748b",
  brd: "#334155",
  bg: "#0f172a",
};

export default function LikertItem({
  item,
  value,
  onChange,
  lang,
  t,
}: LikertItemProps) {
  return (
    <div
      style={{
        background: s.card,
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 12,
        border: `1px solid ${s.brd}`,
      }}
    >
      <p
        style={{
          fontSize: 15,
          color: s.txt,
          fontWeight: 500,
          marginBottom: 4,
          lineHeight: 1.6,
        }}
      >
        {item.text}
      </p>
      {lang === "zh" && (
        <p
          style={{
            fontSize: 14,
            color: s.muted,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          {item.zh}
        </p>
      )}
      {lang === "en" && <div style={{ marginBottom: 16 }} />}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border:
                value === n
                  ? `2px solid ${s.accent}`
                  : `1px solid ${s.brd}`,
              background: value === n ? s.accent : s.bg,
              color: value === n ? "#fff" : s.muted,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
        }}
      >
        <span style={{ fontSize: 11, color: s.dim }}>{t.notTrue}</span>
        <span style={{ fontSize: 11, color: s.dim }}>{t.veryTrue}</span>
      </div>
    </div>
  );
}
