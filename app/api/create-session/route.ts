import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { participantId, assignedGroup, sessionStart } = await req.json();

    if (!participantId || !assignedGroup || !sessionStart) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Insert a minimal session row — demographics and IMI are patched in later
    const { data, error } = await supabase
      .from("experiment_sessions")
      .insert({
        participant_id: participantId,
        assigned_group: assignedGroup,
        session_start: sessionStart,
        language: "en", // will be updated at survey completion
      })
      .select("id")
      .single();

    if (error) {
      console.error("create-session error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("create-session error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
