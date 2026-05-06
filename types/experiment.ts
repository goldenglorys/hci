export type Group = "A" | "B" | "C";
export type Difficulty = "easy" | "medium" | "hard";
export type Screen =
  | "welcome"
  | "demographics"
  | "instructions"
  | "task"
  | "rate"
  | "feedback"
  | "survey"
  | "complete";
export type Language = "en" | "zh";

export interface Prompt {
  id: string;
  prompt: string;
  promptZh: string;
  topic: string;
  topicZh: string;
  img: string;
  feedback: string;
}

export interface IMIItem {
  id: string;
  text: string;
  zh: string;
  sub: "interest" | "competence" | "effort" | "pressure" | "value";
  rev: boolean;
}

export interface RoundResponse {
  round: number;
  promptId: string;
  prompt: string;
  topic: string;
  difficulty: string;
  hasAudio: boolean;
  ms: number;
  selfRating?: number;
  feedbackText?: string;
}

export interface SessionData {
  start: number;
  times: number[];
  difficulties: string[];
  ratings: number[];
}

export interface Demographics {
  age: string;
  gender: string;
  prof: string;
}

export interface IMIScores {
  interest: string;
  competence: string;
  effort: string;
  pressure: string;
  value: string;
}

export interface SaveRoundPayload {
  type: "round";
  sessionId?: string;
  participantId: string;
  assignedGroup: Group;
  roundNumber: number;
  promptId: string;
  promptText: string;
  topic: string;
  difficultyLevel: string;
  selfRating?: number;
  feedbackText?: string;
  feedbackDeliveredAs: "none" | "text" | "spoken";
  responseTimeMs: number;
  hadAudio: boolean;
}

export interface SaveSessionPayload {
  type: "session";
  sessionId?: string;
  participantId: string;
  assignedGroup: Group;
  language: Language;
  age: string;
  gender: string;
  proficiency: string;
  sessionStart: string;
  sessionEnd: string;
  totalRounds: number;
  imiInterest: number;
  imiCompetence: number;
  imiEffort: number;
  imiPressure: number;
  imiValue: number;
  imiRaw: Record<string, number>;
}
