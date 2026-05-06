import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const audioFile = form.get("audio") as File | null;

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({ transcript: transcription.text.trim() });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
