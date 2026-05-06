"use client";

import { useEffect, useRef, useState } from "react";

interface FeedbackDisplayProps {
  feedbackText: string;
  audioUrl: string | null; // pre-fetched MP3 blob URL — null means TTS unavailable
  t: {
    aiFeedback: string;
    aiFeedbackDesc: string;
    replayFeedback: string;
    speaking: string;
  };
}

const s = {
  card: "#1e293b",
  ok: "#22c55e",
  dim: "#64748b",
  txt: "#f1f5f9",
  brd: "#334155",
  accent: "#6366f1",
  accentL: "#818cf8",
};

export default function FeedbackDisplay({ feedbackText, audioUrl, t }: FeedbackDisplayProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = () => {
    if (!audioUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onplay = () => setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    audio.play();
  };

  // Auto-play once when audio URL is available
  useEffect(() => {
    if (!audioUrl) return;
    play();
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  return (
    <div
      style={{
        background: s.card,
        borderRadius: 12,
        padding: 24,
        border: `1px solid ${s.ok}`,
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: s.ok + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          🤖
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: s.ok }}>{t.aiFeedback}</h3>
          <p style={{ fontSize: 12, color: s.dim }}>{t.aiFeedbackDesc}</p>
        </div>
      </div>

      {/* Waveform while speaking */}
      {playing && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: s.ok, marginRight: 8 }}>{t.speaking}</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="wave-bar"
              style={{
                width: 4,
                height: 20,
                borderRadius: 2,
                background: s.ok,
                animationDelay: `${i * 0.15}s`,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
      )}

      {/* Feedback text */}
      <p style={{ fontSize: 15, color: s.txt, lineHeight: 1.9 }}>{feedbackText}</p>

      {/* Replay — only shown once finished and TTS was available */}
      {!playing && audioUrl && (
        <button
          onClick={play}
          style={{
            marginTop: 16,
            background: "transparent",
            color: s.accentL,
            border: `1px solid ${s.accent}`,
            borderRadius: 8,
            padding: "8px 20px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.replayFeedback}
        </button>
      )}
    </div>
  );
}
