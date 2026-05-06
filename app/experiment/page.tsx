"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { T } from "@/lib/translations";
import { PROMPTS, shuffle } from "@/lib/prompts";
import { IMI_ITEMS } from "@/lib/imi";
import AudioRecorder, { type AudioResult } from "@/components/experiment/AudioRecorder";
import LikertItem from "@/components/experiment/LikertItem";
import SelfRating from "@/components/experiment/SelfRating";
import FeedbackDisplay from "@/components/experiment/FeedbackDisplay";
import ProgressBar from "@/components/experiment/ProgressBar";
import type {
  Group,
  Difficulty,
  Screen,
  Language,
  RoundResponse,
  SessionData,
  Demographics,
  IMIScores,
  Prompt,
} from "@/types/experiment";

// ── constants ────────────────────────────────────────────────────────────────
const TOTAL_ROUNDS = 5;
const GROUPS: Group[] = ["A", "B", "C"];

const genId = () =>
  "P" +
  Date.now().toString(36).toUpperCase() +
  Math.random().toString(36).substr(2, 4).toUpperCase();

// ── colour tokens ─────────────────────────────────────────────────────────────
const s = {
  bg: "#0f172a",
  card: "#1e293b",
  accent: "#6366f1",
  accentL: "#818cf8",
  glow: "rgba(99,102,241,0.15)",
  txt: "#f1f5f9",
  muted: "#94a3b8",
  dim: "#64748b",
  ok: "#22c55e",
  warn: "#f59e0b",
  err: "#ef4444",
  brd: "#334155",
  r: "12px",
  gA: "#64748b",
  gB: "#f59e0b",
  gC: "#22c55e",
};

// ── inline style helpers ──────────────────────────────────────────────────────
const btn = {
  background: `linear-gradient(135deg,${s.accent},#7c3aed)`,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "12px 28px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
} as const;

const dis = { opacity: 0.4, cursor: "not-allowed" as const };

const card = {
  background: s.card,
  borderRadius: s.r,
  padding: 32,
  marginBottom: 24,
  border: `1px solid ${s.brd}`,
  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
};

const inp = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  border: `1px solid ${s.brd}`,
  background: s.bg,
  color: s.txt,
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box" as const,
};

const badge = (color: string) => ({
  display: "inline-block",
  padding: "4px 14px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background: color + "22",
  color,
  marginBottom: 12,
});

// ── main component ────────────────────────────────────────────────────────────
export default function ExperimentPage() {
  const [lang, setLang] = useState<Language>("en");
  const [screen, setScreen] = useState<Screen>("welcome");
  const [pid] = useState<string>(genId);
  const [group, setGroup] = useState<Group | null>(null);
  const [demo, setDemo] = useState<Demographics>({ age: "", gender: "", prof: "" });
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [round, setRound] = useState(0);
  const [taskPrompts, setTaskPrompts] = useState<Prompt[]>([]);
  const [responses, setResponses] = useState<RoundResponse[]>([]);
  const [audioResp, setAudioResp] = useState<AudioResult | null>(null);
  const [selfRating, setSelfRating] = useState<number | null>(null);
  const [imi, setImi] = useState<Record<string, number>>({});
  const [shuffledIMI, setShuffledIMI] = useState(IMI_ITEMS);
  const [sData, setSData] = useState<SessionData>({
    start: 0,
    times: [],
    difficulties: [],
    ratings: [],
  });
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [feedbackAudioUrl, setFeedbackAudioUrl] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [transcribing, setTranscribing] = useState(false);
  const [sessionStart] = useState<number>(() => Date.now());
  const [supabaseSessionId, setSupabaseSessionId] = useState<string | null>(null);

  const roundStart = useRef<number>(0);
  // Tracks data for the round currently in progress so goNext can flush it
  const pendingRound = useRef<{
    roundNumber: number;
    promptId: string;
    promptText: string;
    topic: string;
    difficultyLevel: string;
    responseTimeMs: number;
    hadAudio: boolean;
  } | null>(null);

  const t = T[lang];

  // ── derived values ──────────────────────────────────────────────────────────
  const groupColor =
    group === "A" ? s.gA : group === "B" ? s.gB : s.gC;
  const groupLabel =
    group === "A"
      ? t.control
      : group === "B"
      ? t.adaptive
      : t.adaptiveAI;

  const pct =
    screen === "survey"
      ? 85
      : screen === "complete"
      ? 100
      : screen === "task" || screen === "rate" || screen === "feedback"
      ? 15 + (round / TOTAL_ROUNDS) * 70
      : 8;

  const getCurrentPrompt = (): Prompt | null =>
    taskPrompts[round] ?? taskPrompts[taskPrompts.length - 1] ?? null;

  // ── session start ───────────────────────────────────────────────────────────
  const startSession = () => {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("_tg")?.toUpperCase() as Group | undefined;
    const g: Group =
      forced && GROUPS.includes(forced)
        ? forced
        : GROUPS[Math.floor(Math.random() * 3)];

    setGroup(g);
    setShuffledIMI(shuffle(IMI_ITEMS));
    setSData({ start: Date.now(), times: [], difficulties: [], ratings: [] });
    setDifficulty("easy");

    const firstDiff = g === "A" ? "medium" : "easy";
    const pool = shuffle(PROMPTS[firstDiff]);
    setTaskPrompts([pool[0]]);

    // Create the session row now so we have a UUID for experiment_rounds foreign key
    fetch("/api/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: pid, assignedGroup: g, sessionStart: new Date().toISOString() }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.id) setSupabaseSessionId(d.id); })
      .catch(console.error);

    setScreen("demographics");
  };

  // ── adaptive difficulty ─────────────────────────────────────────────────────
  const adaptDifficulty = (rating: number) => {
    setSelfRating(rating);
    if (!group || group === "A") return;
    let newDiff: Difficulty = difficulty;
    if (rating >= 4) {
      if (difficulty === "easy") newDiff = "medium";
      else if (difficulty === "medium") newDiff = "hard";
    } else if (rating <= 2) {
      if (difficulty === "hard") newDiff = "medium";
      else if (difficulty === "medium") newDiff = "easy";
    }
    setDifficulty(newDiff);
  };

  // ── auto-transcribe for Group C as soon as recording stops ─────────────────
  const handleAudioDone = (result: AudioResult | null) => {
    setAudioResp(result);
    setTranscript("");
    if (!result || group !== "C") return;
    setTranscribing(true);
    const form = new FormData();
    form.append("audio", result.blob, "response.webm");
    fetch("/api/transcribe", { method: "POST", body: form })
      .then((r) => r.json())
      .then((d) => setTranscript(d.transcript ?? ""))
      .catch(() => setTranscript(""))
      .finally(() => setTranscribing(false));
  };

  // ── submit recording ────────────────────────────────────────────────────────
  const submitRecording = () => {
    const rt = Date.now() - roundStart.current;
    const prompt = getCurrentPrompt();
    if (!prompt || !group) return;

    const diffLabel = group === "A" ? "fixed-medium" : difficulty;
    setResponses((p) => [
      ...p,
      {
        round: round + 1,
        promptId: prompt.id,
        prompt: prompt.prompt,
        topic: prompt.topic,
        difficulty: diffLabel,
        hasAudio: !!audioResp,
        ms: rt,
      },
    ]);
    setSData((p) => ({
      ...p,
      times: [...p.times, rt],
      difficulties: [...p.difficulties, diffLabel],
    }));

    // Stash round data — we save to Supabase in goNext() once we have
    // selfRating and feedbackText (both unknown at this point)
    pendingRound.current = {
      roundNumber: round + 1,
      promptId: prompt.id,
      promptText: prompt.prompt,
      topic: prompt.topic,
      difficultyLevel: diffLabel,
      responseTimeMs: rt,
      hadAudio: !!audioResp,
    };

    setScreen("rate");
  };

  // ── after self-rating ───────────────────────────────────────────────────────
  const afterRating = useCallback(async () => {
    if (!group) return;
    setSData((p) => ({
      ...p,
      ratings: [...p.ratings, selfRating ?? 0],
    }));

    if (group === "C") {
      const prompt = getCurrentPrompt();
      if (prompt) {
        setFeedbackLoading(true);
        setFeedbackText("");
        setFeedbackAudioUrl(null);
        setScreen("feedback");
        try {
          // Step 1 — generate feedback text (pass pre-fetched transcript)
          const form = new FormData();
          form.append("promptText", prompt.prompt);
          form.append("topic", prompt.topic);
          form.append("difficulty", difficulty);
          form.append("selfRating", String(selfRating ?? 3));
          form.append("language", lang);
          form.append("transcript", transcript);
          const feedbackRes = await fetch("/api/feedback", { method: "POST", body: form });
          const feedbackData = await feedbackRes.json();
          const text = feedbackData.feedback || prompt.feedback;
          setFeedbackText(text);

          // Step 2 — fetch TTS audio for that text before revealing the screen
          const ttsRes = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (ttsRes.ok) {
            const blob = await ttsRes.blob();
            setFeedbackAudioUrl(URL.createObjectURL(blob));
          }
        } catch {
          setFeedbackText(prompt.feedback);
          setFeedbackAudioUrl(null);
        } finally {
          setFeedbackLoading(false);
        }
      } else {
        setScreen("feedback");
      }
    } else {
      // Groups A & B: no feedback, go straight to next round
      goNext(selfRating, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, selfRating, difficulty, lang]);

  // ── next round / end ────────────────────────────────────────────────────────
  const goNext = useCallback((currentSelfRating: number | null, currentFeedback: string) => {
    if (!group) return;

    // Flush the completed round to Supabase — now we have selfRating and feedbackText
    if (pendingRound.current) {
      fetch("/api/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "round",
          sessionId: supabaseSessionId,
          participantId: pid,
          assignedGroup: group,
          ...pendingRound.current,
          selfRating: currentSelfRating,
          feedbackText: group === "C" ? currentFeedback : null,
          feedbackDeliveredAs: group === "C" ? "spoken" : "none",
        }),
      }).catch(console.error);
      pendingRound.current = null;
    }

    if (round + 1 >= TOTAL_ROUNDS) {
      setScreen("survey");
    } else {
      const nextRound = round + 1;
      setRound(nextRound);
      setAudioResp(null);
      setSelfRating(null);
      setTranscript("");
      setFeedbackAudioUrl(null);

      const diff: Difficulty = group === "A" ? "medium" : difficulty;
      const usedIds = taskPrompts.map((p) => p.id);
      const available = PROMPTS[diff].filter((p) => !usedIds.includes(p.id));
      const pool = available.length > 0 ? available : PROMPTS[diff];
      const pick = shuffle(pool)[0];
      setTaskPrompts((prev) => [...prev, pick]);
      setScreen("task");
    }
  }, [group, round, difficulty, taskPrompts, supabaseSessionId, pid]);

  useEffect(() => {
    if (screen === "task") roundStart.current = Date.now();
  }, [screen, round]);

  // ── IMI calculation ─────────────────────────────────────────────────────────
  const calcIMI = (): IMIScores => {
    const sc: Record<string, number[]> = {
      interest: [],
      competence: [],
      effort: [],
      pressure: [],
      value: [],
    };
    IMI_ITEMS.forEach((item) => {
      const raw = imi[item.id];
      if (raw !== undefined) sc[item.sub].push(item.rev ? 8 - raw : raw);
    });
    const avg = (a: number[]) =>
      a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : "N/A";
    return {
      interest: avg(sc.interest),
      competence: avg(sc.competence),
      effort: avg(sc.effort),
      pressure: avg(sc.pressure),
      value: avg(sc.value),
    };
  };

  // ── submit survey → save full session ──────────────────────────────────────
  const submitSurvey = () => {
    const im = calcIMI();
    const toNum = (v: string) => (v === "N/A" ? 0 : parseFloat(v));

    fetch("/api/save-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "session",
        sessionId: supabaseSessionId,
        participantId: pid,
        assignedGroup: group,
        language: lang,
        age: demo.age,
        gender: demo.gender,
        proficiency: demo.prof,
        sessionStart: new Date(sessionStart).toISOString(),
        sessionEnd: new Date().toISOString(),
        totalRounds: responses.length,
        imiInterest: toNum(im.interest),
        imiCompetence: toNum(im.competence),
        imiEffort: toNum(im.effort),
        imiPressure: toNum(im.pressure),
        imiValue: toNum(im.value),
        imiRaw: imi,
      }),
    }).catch(console.error);

    setScreen("complete");
  };

  // ── CSV export ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const im = calcIMI();
    const rows: (string | number | boolean)[][] = [
      [
        "Participant ID",
        "Group",
        "Age",
        "Gender",
        "Proficiency",
        "Session Start",
        "IMI Interest",
        "IMI Competence",
        "IMI Effort",
        "IMI Pressure",
        "IMI Value",
        "Round",
        "Prompt ID",
        "Prompt",
        "Topic",
        "Difficulty",
        "Self Rating",
        "Had Audio",
        "Time (ms)",
      ],
    ];
    responses.forEach((r, i) => {
      rows.push([
        pid,
        "Group " + group,
        demo.age,
        demo.gender,
        demo.prof,
        new Date(sData.start).toISOString(),
        im.interest,
        im.competence,
        im.effort,
        im.pressure,
        im.value,
        r.round,
        r.promptId,
        '"' + r.prompt.replace(/"/g, '""') + '"',
        r.topic,
        r.difficulty,
        sData.ratings[i] ?? "",
        r.hasAudio,
        r.ms,
      ]);
    });
    rows.push([]);
    rows.push(["IMI Individual Responses"]);
    rows.push(["Item ID", "Text", "Subscale", "Reverse", "Raw", "Adjusted"]);
    IMI_ITEMS.forEach((item) => {
      const raw = imi[item.id] ?? "";
      const adj = raw ? (item.rev ? 8 - (raw as number) : raw) : "";
      rows.push([
        item.id,
        '"' + item.text + '"',
        item.sub,
        item.rev,
        raw,
        adj,
      ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `experiment_${pid}_Group${group}.csv`;
    a.click();
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg,${s.bg} 0%,#1a1a2e 50%,${s.bg} 100%)`,
        color: s.txt,
        fontFamily: "'Segoe UI',-apple-system,sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>

        {/* Language Toggle */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            style={{
              background: s.glow,
              color: s.accentL,
              border: `1px solid ${s.accent}`,
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.langToggle}
          </button>
        </div>

        {screen !== "welcome" && <ProgressBar pct={pct} />}

        {/* ── WELCOME ── */}
        {screen === "welcome" && (
          <div style={{ textAlign: "center", paddingTop: 50 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🌐</div>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 700,
                marginBottom: 8,
                background: `linear-gradient(135deg,${s.accentL},${s.ok})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.title}
            </h1>
            <p style={{ fontSize: 14, color: s.muted, marginBottom: 24 }}>
              {t.subtitle}
            </p>
            <div
              style={{
                ...card,
                textAlign: "left",
                maxWidth: 520,
                margin: "0 auto 24px",
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: s.accentL,
                }}
              >
                {t.consent}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: s.muted,
                  marginBottom: 12,
                }}
              >
                {t.consentIntro}
              </p>
              {([t.c1, t.c2, t.c3, t.c4, t.c5, t.c6, t.c7] as string[]).map(
                (c, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: 14,
                      lineHeight: 1.8,
                      color: i === 6 ? s.accentL : s.muted,
                      marginBottom: 6,
                      fontWeight: i === 6 ? 600 : 400,
                    }}
                  >
                    • {c}
                  </p>
                )
              )}
            </div>
            <button style={btn} onClick={startSession}>
              {t.agree}
            </button>
          </div>
        )}

        {/* ── DEMOGRAPHICS ── */}
        {screen === "demographics" && (
          <div style={card}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 8,
                color: s.txt,
              }}
            >
              {t.aboutYou}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: s.accentL,
                marginBottom: 24,
                lineHeight: 1.7,
                fontWeight: 500,
              }}
            >
              {t.aboutYouDesc}
            </p>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  color: s.muted,
                  marginBottom: 6,
                }}
              >
                {t.age}
              </label>
              <input
                type="number"
                style={inp}
                placeholder="e.g. 14"
                value={demo.age}
                onChange={(e) => setDemo({ ...demo, age: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  color: s.muted,
                  marginBottom: 6,
                }}
              >
                {t.gender}
              </label>
              <select
                style={inp}
                value={demo.gender}
                onChange={(e) => setDemo({ ...demo, gender: e.target.value })}
              >
                <option value="">{t.select}</option>
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
                <option value="non-binary">{t.nonBinary}</option>
                <option value="prefer-not">{t.preferNot}</option>
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  color: s.accentL,
                  marginBottom: 6,
                }}
              >
                {t.proficiency}
              </label>
              <select
                style={inp}
                value={demo.prof}
                onChange={(e) => setDemo({ ...demo, prof: e.target.value })}
              >
                <option value="">{t.select}</option>
                <option value="beginner">{t.beginner}</option>
                <option value="intermediate">{t.intermediate}</option>
                <option value="advanced">{t.advanced}</option>
              </select>
            </div>
            <button
              style={{
                ...btn,
                ...(!demo.age || !demo.gender || !demo.prof ? dis : {}),
              }}
              disabled={!demo.age || !demo.gender || !demo.prof}
              onClick={() => setScreen("instructions")}
            >
              {t.continue}
            </button>
          </div>
        )}

        {/* ── INSTRUCTIONS ── */}
        {screen === "instructions" && group && (
          <div style={card}>
            <span style={badge(groupColor)}>
              {t.group} {group} - {groupLabel}
            </span>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 16,
                color: s.txt,
              }}
            >
              {t.howItWorks}
            </h2>
            <p style={{ fontSize: 15, color: s.muted, lineHeight: 1.8, marginBottom: 8 }}>
              {t.instrSpeak}
            </p>
            <p style={{ fontSize: 15, color: s.muted, lineHeight: 1.8 }}>
              1. {t.step1}
            </p>
            <p style={{ fontSize: 15, color: s.muted, lineHeight: 1.8 }}>
              2. {t.step2}
            </p>
            <p style={{ fontSize: 15, color: s.muted, lineHeight: 1.8 }}>
              3. {t.step3}
            </p>
            {group === "C" && (
              <p style={{ fontSize: 15, color: s.ok, lineHeight: 1.8 }}>
                4. {t.step4}
              </p>
            )}
            <p style={{ fontSize: 15, color: s.muted, lineHeight: 1.8, marginTop: 8 }}>
              {t.instrAfter}
            </p>
            {group === "B" || group === "C" ? (
              <p style={{ fontSize: 14, color: s.warn, marginTop: 16, lineHeight: 1.7 }}>
                ⚡ {t.instrAdapt}
              </p>
            ) : (
              <p style={{ fontSize: 14, color: s.muted, marginTop: 16, lineHeight: 1.7 }}>
                {t.instrFixed}
              </p>
            )}
            <button
              style={{ ...btn, marginTop: 20 }}
              onClick={() => setScreen("task")}
            >
              {t.begin}
            </button>
          </div>
        )}

        {/* ── TASK ── */}
        {screen === "task" && group && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span style={badge(s.accentL)}>
                {t.round} {round + 1} {t.of} {TOTAL_ROUNDS}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {(group === "B" || group === "C") && (
                  <span
                    style={badge(
                      difficulty === "easy"
                        ? s.ok
                        : difficulty === "medium"
                        ? s.warn
                        : s.err
                    )}
                  >
                    {t.difficulty}: {difficulty}
                  </span>
                )}
                <span style={{ fontSize: 13, color: s.dim }}>
                  {t.group} {group}
                </span>
              </div>
            </div>
            {(() => {
              const prompt = getCurrentPrompt();
              return prompt ? (
                <div style={card}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>
                    {prompt.img}
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 8,
                      color: s.accentL,
                    }}
                  >
                    {lang === "zh" ? prompt.topicZh : prompt.topic}
                  </h3>
                  <p
                    style={{ fontSize: 17, color: s.txt, lineHeight: 1.8 }}
                  >
                    {lang === "zh" ? prompt.promptZh : prompt.prompt}
                  </p>
                  {lang === "zh" && (
                    <p
                      style={{
                        fontSize: 14,
                        color: s.muted,
                        lineHeight: 1.8,
                        marginTop: 8,
                      }}
                    >
                      {prompt.prompt}
                    </p>
                  )}
                </div>
              ) : null;
            })()}
            <AudioRecorder onDone={handleAudioDone} t={t} />

            {/* Transcript preview — Group C only, shown after recording stops */}
            {group === "C" && (transcribing || transcript) && (
              <div
                style={{
                  background: s.bg,
                  border: `1px solid ${transcribing ? s.brd : s.accentL}`,
                  borderRadius: 8,
                  padding: "14px 18px",
                  marginBottom: 16,
                  transition: "border-color 0.3s",
                }}
              >
                <p style={{ fontSize: 12, color: s.dim, marginBottom: 4 }}>
                  🎙 We heard:
                </p>
                {transcribing ? (
                  <p style={{ fontSize: 14, color: s.muted, fontStyle: "italic" }}>
                    Transcribing…
                  </p>
                ) : (
                  <p style={{ fontSize: 14, color: s.txt, lineHeight: 1.6 }}>
                    {transcript || (
                      <span style={{ color: s.dim, fontStyle: "italic" }}>
                        (nothing detected — try recording again)
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            <button
              style={{ ...btn, ...(!audioResp || transcribing ? dis : {}) }}
              disabled={!audioResp || transcribing}
              onClick={submitRecording}
            >
              {t.submitRec} →
            </button>
          </div>
        )}

        {/* ── SELF RATING ── */}
        {screen === "rate" && group && (
          <div>
            <span style={badge(s.accentL)}>
              {t.round} {round + 1}
            </span>
            <SelfRating onRate={adaptDifficulty} t={t} />
            <button
              style={{ ...btn, ...(!selfRating ? dis : {}), marginTop: 8 }}
              disabled={!selfRating}
              onClick={afterRating}
            >
              {group === "C"
                ? t.seeFeedback + " →"
                : round + 1 >= TOTAL_ROUNDS
                ? t.goSurvey + " →"
                : t.nextTask + " →"}
            </button>
          </div>
        )}

        {/* ── AI FEEDBACK (Group C only) ── */}
        {screen === "feedback" && group === "C" && (
          <div>
            <span style={badge(s.ok)}>
              {t.aiFeedback} - {t.round} {round + 1}
            </span>

            {feedbackLoading ? (
              <div
                style={{
                  ...card,
                  borderColor: s.ok,
                  textAlign: "center",
                  padding: 40,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                <p style={{ color: s.muted, fontSize: 15 }}>
                  {t.generatingFeedback}
                </p>
              </div>
            ) : (
              <FeedbackDisplay
                feedbackText={feedbackText}
                audioUrl={feedbackAudioUrl}
                t={t}
              />
            )}

            {!feedbackLoading && (
              <button
                style={{ ...btn, marginTop: 8 }}
                onClick={() => goNext(selfRating, feedbackText)}
              >
                {round + 1 >= TOTAL_ROUNDS
                  ? t.goSurvey + " →"
                  : t.nextTask + " →"}
              </button>
            )}
          </div>
        )}

        {/* ── IMI SURVEY ── */}
        {screen === "survey" && (
          <div>
            <div style={card}>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: s.txt,
                }}
              >
                {t.surveyTitle}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: s.muted,
                  lineHeight: 1.7,
                  marginBottom: 8,
                }}
              >
                {t.surveyDesc}
              </p>
              <p style={{ fontSize: 13, color: s.dim }}>
                {Object.keys(imi).length} / {IMI_ITEMS.length} {t.answered}
              </p>
            </div>
            {shuffledIMI.map((item) => (
              <LikertItem
                key={item.id}
                item={item}
                value={imi[item.id]}
                onChange={(v) => setImi((p) => ({ ...p, [item.id]: v }))}
                lang={lang}
                t={t}
              />
            ))}
            <button
              style={{
                ...btn,
                marginTop: 16,
                ...(Object.keys(imi).length < IMI_ITEMS.length ? dis : {}),
              }}
              disabled={Object.keys(imi).length < IMI_ITEMS.length}
              onClick={submitSurvey}
            >
              {t.submitSurvey} →
            </button>
          </div>
        )}

        {/* ── COMPLETE ── */}
        {screen === "complete" && group && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 8,
                background: `linear-gradient(135deg,${s.accentL},${s.ok})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.thankYou}
            </h1>
            <p
              style={{
                fontSize: 15,
                color: s.muted,
                maxWidth: 500,
                margin: "0 auto 24px",
                lineHeight: 1.7,
              }}
            >
              {t.thankYouDesc}
            </p>
            <div
              style={{
                ...card,
                textAlign: "left",
                maxWidth: 450,
                margin: "0 auto 24px",
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  marginBottom: 16,
                  color: s.accentL,
                }}
              >
                {t.sessionSummary}
              </h3>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <span style={badge(groupColor)}>
                  {t.group} {group}
                </span>
                <span style={{ ...badge(s.accentL), background: s.glow }}>
                  {groupLabel}
                </span>
              </div>
              <p style={{ fontSize: 14, color: s.muted, marginBottom: 6 }}>
                <strong>{t.participantId}:</strong> {pid}
              </p>
              <p style={{ fontSize: 14, color: s.muted, marginBottom: 6 }}>
                <strong>{t.roundsCompleted}:</strong> {responses.length}
              </p>
              <p style={{ fontSize: 14, color: s.muted, marginBottom: 6 }}>
                <strong>{t.avgTime}:</strong>{" "}
                {sData.times.length
                  ? (
                      sData.times.reduce((a, b) => a + b, 0) /
                      sData.times.length /
                      1000
                    ).toFixed(1) + "s"
                  : "N/A"}
              </p>
              {(group === "B" || group === "C") && (
                <p style={{ fontSize: 14, color: s.muted, marginBottom: 6 }}>
                  <strong>{t.diffProgression}:</strong>{" "}
                  {sData.difficulties.join(" → ")}
                </p>
              )}
              <div
                style={{
                  background: s.bg,
                  borderRadius: 8,
                  padding: 16,
                  border: `1px solid ${s.brd}`,
                  marginTop: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: s.accentL,
                    marginBottom: 8,
                  }}
                >
                  {t.imiScores}
                </p>
                {(() => {
                  const im = calcIMI();
                  return (
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          color: s.muted,
                          marginBottom: 4,
                        }}
                      >
                        {t.interest}:{" "}
                        <strong style={{ color: s.txt }}>{im.interest}</strong>
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: s.muted,
                          marginBottom: 4,
                        }}
                      >
                        {t.competence}:{" "}
                        <strong style={{ color: s.txt }}>
                          {im.competence}
                        </strong>
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: s.muted,
                          marginBottom: 4,
                        }}
                      >
                        {t.effort}:{" "}
                        <strong style={{ color: s.txt }}>{im.effort}</strong>
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: s.muted,
                          marginBottom: 4,
                        }}
                      >
                        {t.pressure}:{" "}
                        <strong style={{ color: s.txt }}>{im.pressure}</strong>
                      </p>
                      <p style={{ fontSize: 13, color: s.muted }}>
                        {t.value}:{" "}
                        <strong style={{ color: s.txt }}>{im.value}</strong>
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
            <button style={btn} onClick={exportCSV}>
              📥 {t.download}
            </button>
            <p style={{ fontSize: 12, color: s.dim, marginTop: 16 }}>
              {t.downloadNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
