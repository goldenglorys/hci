import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { SaveRoundPayload, SaveSessionPayload } from "@/types/experiment";

export async function POST(req: NextRequest) {
  try {
    const body: SaveRoundPayload | SaveSessionPayload = await req.json();
    const supabase = await createClient();

    if (body.type === "round") {
      const payload = body as SaveRoundPayload;
      const { error } = await supabase.from("experiment_rounds").insert({
        session_id: payload.sessionId ?? null,
        participant_id: payload.participantId,
        assigned_group: payload.assignedGroup,
        round_number: payload.roundNumber,
        prompt_id: payload.promptId,
        prompt_text: payload.promptText,
        topic: payload.topic,
        difficulty_level: payload.difficultyLevel,
        self_rating: payload.selfRating ?? null,
        feedback_text: payload.feedbackText ?? null,
        feedback_delivered_as: payload.feedbackDeliveredAs,
        response_time_ms: payload.responseTimeMs,
        had_audio: payload.hadAudio,
      });

      if (error) {
        console.error("Supabase round insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (body.type === "session") {
      const payload = body as SaveSessionPayload;

      // The session row was created at session start — update it with full data
      const { error } = payload.sessionId
        ? await supabase
            .from("experiment_sessions")
            .update({
              language: payload.language,
              age: payload.age,
              gender: payload.gender,
              proficiency: payload.proficiency,
              session_end: payload.sessionEnd,
              total_rounds: payload.totalRounds,
              imi_interest: payload.imiInterest,
              imi_competence: payload.imiCompetence,
              imi_effort: payload.imiEffort,
              imi_pressure: payload.imiPressure,
              imi_value: payload.imiValue,
              imi_raw: payload.imiRaw,
            })
            .eq("id", payload.sessionId)
        : await supabase.from("experiment_sessions").insert({
            participant_id: payload.participantId,
            assigned_group: payload.assignedGroup,
            language: payload.language,
            age: payload.age,
            gender: payload.gender,
            proficiency: payload.proficiency,
            session_start: payload.sessionStart,
            session_end: payload.sessionEnd,
            total_rounds: payload.totalRounds,
            imi_interest: payload.imiInterest,
            imi_competence: payload.imiCompetence,
            imi_effort: payload.imiEffort,
            imi_pressure: payload.imiPressure,
            imi_value: payload.imiValue,
            imi_raw: payload.imiRaw,
          });

      if (error) {
        console.error("Supabase session save error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown payload type" }, { status: 400 });
  } catch (err) {
    console.error("save-session error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
