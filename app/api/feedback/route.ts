import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const promptText = form.get("promptText") as string;
    const topic = form.get("topic") as string;
    const difficulty = form.get("difficulty") as string;
    const selfRating = form.get("selfRating") as string;
    const language = form.get("language") as string;
    // Accept a pre-fetched transcript so we skip re-transcribing
    const existingTranscript = (form.get("transcript") as string | null) ?? "";

    if (!promptText || !topic || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const transcript = existingTranscript.trim();

    const systemPrompt = `You are a warm, encouraging English speaking coach giving feedback to an EFL learner. You will be given the speaking prompt they were given AND a transcript of what they actually said. Give exactly 2 sentences of feedback. Sentence 1: acknowledge something specific and positive from their actual transcript. Sentence 2: give one concrete, actionable tip to improve, referencing something real from what they said. Be specific, warm, and age-appropriate. Keep total response under 60 words.`;

    const userMessage = transcript
      ? `Speaking prompt: "${promptText}"
Topic: ${topic}
Difficulty: ${difficulty}
Self-rated difficulty: ${selfRating}/5 (1=very hard, 5=very easy)

What the learner actually said (transcript):
"${transcript}"

Generate feedback based on what they actually said.`
      : `Speaking prompt: "${promptText}"
Topic: ${topic}
Difficulty: ${difficulty}
Self-rated difficulty: ${selfRating}/5 (1=very hard, 5=very easy)
Language preference: ${language}

No transcript available — generate encouraging feedback based on the topic and difficulty.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 120,
      temperature: 0.7,
    });

    const feedback = completion.choices[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ feedback, transcript });
  } catch (err) {
    console.error("Feedback API error:", err);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}
