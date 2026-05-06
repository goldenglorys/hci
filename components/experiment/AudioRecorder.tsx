"use client";

import { useState, useRef, useEffect } from "react";

export interface AudioResult {
  url: string;
  blob: Blob;
}

interface AudioRecorderProps {
  onDone: (result: AudioResult | null) => void;
  t: {
    startRec: string;
    stopRec: string;
    reRecord: string;
    micDenied: string;
  };
  maxSeconds?: number; // hard stop (default 90)
  warnSeconds?: number; // colour warning (default 60)
}

const s = {
  card: "#1e293b",
  accent: "#6366f1",
  accentL: "#818cf8",
  err: "#ef4444",
  warn: "#f59e0b",
  brd: "#334155",
  bg: "#0f172a",
  muted: "#94a3b8",
};

export default function AudioRecorder({
  onDone,
  t,
  maxSeconds = 90,
  warnSeconds = 60,
}: AudioRecorderProps) {
  const [rec, setRec] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [sec, setSec] = useState(0);
  const mr = useRef<MediaRecorder | null>(null);
  const ch = useRef<Blob[]>([]);
  const ti = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-stop when limit is hit
  useEffect(() => {
    if (rec && sec >= maxSeconds) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec, rec]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mr.current = new MediaRecorder(stream);
      ch.current = [];
      mr.current.ondataavailable = (e) => ch.current.push(e.data);
      mr.current.onstop = () => {
        const b = new Blob(ch.current, { type: "audio/webm" });
        const u = URL.createObjectURL(b);
        setUrl(u);
        onDone({ url: u, blob: b });
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.current.start();
      setRec(true);
      setSec(0);
      ti.current = setInterval(() => setSec((x) => x + 1), 1000);
    } catch {
      alert(t.micDenied);
    }
  };

  const stop = () => {
    if (mr.current && rec) {
      mr.current.stop();
      setRec(false);
      if (ti.current) clearInterval(ti.current);
    }
  };

  const fmt = (x: number) =>
    `${Math.floor(x / 60)}:${(x % 60).toString().padStart(2, "0")}`;

  const remaining = maxSeconds - sec;
  const isWarning = rec && sec >= warnSeconds;
  const timerColor = isWarning ? s.warn : s.err;

  return (
    <div
      style={{
        background: s.card,
        borderRadius: 12,
        padding: 24,
        border: `1px solid ${s.brd}`,
        textAlign: "center",
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 12 }}>
        {rec ? "🔴" : url ? "✅" : "🎤"}
      </div>

      {rec && (
        <>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: timerColor,
              marginBottom: 6,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmt(sec)}
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: "#334155",
              overflow: "hidden",
              margin: "0 auto 8px",
              width: "80%",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 2,
                background: timerColor,
                width: `${(sec / maxSeconds) * 100}%`,
                transition: "width 1s linear, background 0.3s",
              }}
            />
          </div>
          {isWarning && (
            <p style={{ fontSize: 12, color: s.warn, marginBottom: 8 }}>
              {remaining}s remaining — recording stops at {maxSeconds}s
            </p>
          )}
        </>
      )}

      {!url ? (
        <button
          onClick={rec ? stop : start}
          style={{
            background: rec
              ? s.err
              : `linear-gradient(135deg,${s.accent},#7c3aed)`,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "14px 32px",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {rec ? `⏹ ${t.stopRec}` : `🎤 ${t.startRec}`}
        </button>
      ) : (
        <div>
          <audio controls src={url} style={{ marginBottom: 12, width: "100%" }} />
          <button
            onClick={() => {
              setUrl(null);
              onDone(null);
            }}
            style={{
              background: "transparent",
              color: s.accentL,
              border: `2px solid ${s.accent}`,
              borderRadius: 8,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.reRecord}
          </button>
        </div>
      )}

      {!rec && !url && (
        <p style={{ fontSize: 12, color: s.muted, marginTop: 10 }}>
          Max {maxSeconds}s
        </p>
      )}
    </div>
  );
}
