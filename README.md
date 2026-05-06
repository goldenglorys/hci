# Language Learning Experiment

An HCI research experiment studying how different types of AI feedback affect speaking motivation in EFL learners. Participants are randomly assigned to one of three groups: Control (fixed difficulty, no feedback), Adaptive (adaptive difficulty, no feedback), or Adaptive + AI Feedback (adaptive difficulty with live OpenAI-powered feedback read aloud via OpenAI TTS).

## AI stack (Group C feedback pipeline)

All three steps happen server-side before the feedback screen is shown — participants see and hear feedback in one go with no loading gaps.

1. **OpenAI Whisper** (`whisper-1`) — transcribes the participant's recorded audio immediately after they stop recording. The transcript is shown on the task screen ("We heard: …") before they submit, so they can verify or re-record. (~$0.006/min, ~$0.003 per 30-second response)
2. **OpenAI GPT-4o-mini** — generates 2-sentence personalised feedback grounded in the actual Whisper transcript
3. **OpenAI TTS** (`tts-1`, voice: `nova`) — converts the feedback text to an MP3 audio file server-side. The audio is fully loaded before the feedback screen appears, then plays automatically. (~$0.015/1K chars, ~$0.002 per feedback)

<!-- **Estimated OpenAI cost for the full study:** ~$1–$3 for 50 participants × 5 rounds each. -->

Fallback chain: if Whisper fails → GPT generates feedback from topic/difficulty alone. If GPT fails → pre-written static feedback is shown. If TTS fails → feedback text is still shown silently. Groups A and B never hit any of these APIs.

## Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/goldenglorys/hci.git
   cd hci
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - In the SQL Editor, run the schema below

4. **Run the SQL schema** (paste into Supabase SQL Editor → Run)
   ```sql
   create table experiment_sessions (
     id uuid primary key default gen_random_uuid(),
     participant_id text not null,
     assigned_group text not null check (assigned_group in ('A','B','C')),
     language text not null default 'en',
     age text,
     gender text,
     proficiency text,
     session_start timestamptz not null,
     session_end timestamptz,
     total_rounds int,
     imi_interest numeric(4,2),
     imi_competence numeric(4,2),
     imi_effort numeric(4,2),
     imi_pressure numeric(4,2),
     imi_value numeric(4,2),
     imi_raw jsonb,
     created_at timestamptz default now()
   );

   create table experiment_rounds (
     id uuid primary key default gen_random_uuid(),
     session_id uuid references experiment_sessions(id) on delete cascade,
     participant_id text not null,
     assigned_group text not null,
     round_number int not null,
     prompt_id text not null,
     prompt_text text not null,
     topic text not null,
     difficulty_level text not null,
     self_rating int,
     feedback_text text,
     feedback_delivered_as text,
     response_time_ms int,
     had_audio boolean default false,
     created_at timestamptz default now()
   );

   alter table experiment_sessions enable row level security;
   alter table experiment_rounds enable row level security;

   create policy "Allow anon insert sessions" on experiment_sessions for insert to anon with check (true);
   create policy "Allow anon insert rounds" on experiment_rounds for insert to anon with check (true);

   create policy "Allow anon select own session" on experiment_sessions
   for select to anon using (true);

   create policy "Allow anon update own session" on experiment_sessions
   for update to anon using (true);

   ```

5. **Add environment variables** — fill in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
   OPENAI_API_KEY=sk-...
   ```
   - Supabase URL and publishable key: Project Settings → API
   - OpenAI key: [platform.openai.com](https://platform.openai.com) → API keys

6. **Start the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Accessing experiment data from Supabase

1. Go to your Supabase project dashboard
2. Click **Table Editor** in the left sidebar
3. Select `experiment_sessions` or `experiment_rounds`
4. Use filters and sorting to explore responses
5. Click the download icon (top right of the table) to export as CSV

## URL parameters for researcher use

Force a specific group by appending `?_tg=A`, `?_tg=B`, or `?_tg=C` to the URL:

```
http://localhost:3000/experiment?_tg=C
```

This bypasses random assignment and places the participant directly into the specified group. Participants cannot guess this parameter.

## Exporting all session data as CSV from Supabase

**Option 1 — Table Editor UI:**
Table Editor → select table → click the download icon in the top-right corner.

**Option 2 — SQL Editor:**
```sql
copy (
  select
    s.participant_id,
    s.assigned_group,
    s.language,
    s.age,
    s.gender,
    s.proficiency,
    s.session_start,
    s.session_end,
    s.total_rounds,
    s.imi_interest,
    s.imi_competence,
    s.imi_effort,
    s.imi_pressure,
    s.imi_value,
    r.round_number,
    r.prompt_id,
    r.prompt_text,
    r.topic,
    r.difficulty_level,
    r.self_rating,
    r.feedback_delivered_as,
    r.response_time_ms,
    r.had_audio
  from experiment_sessions s
  left join experiment_rounds r on r.participant_id = s.participant_id
  order by s.created_at, r.round_number
) to stdout with csv header;
```

Paste into the SQL Editor and use the download button that appears with the results.

## Experimental design

| Group | Difficulty | Feedback |
|-------|-----------|----------|
| A (Control) | Fixed medium | None |
| B (Adaptive) | Adapts per self-rating | None |
| C (Adaptive + AI) | Adapts per self-rating | Whisper transcription → GPT-4o-mini feedback, read aloud |

Adaptive rule: self-rating ≥ 4 → harder; self-rating ≤ 2 → easier.
