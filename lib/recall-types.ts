// ─── Core enumerations ───────────────────────────────────────────────────────

export type CardType = "basic" | "cloze" | "vignette" | "comparison";

export type SourceType =
  | "qbank"
  | "video"
  | "lecture"
  | "textbook"
  | "notes"
  | "other";

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type BoardRelevance = "step1" | "step2" | "both" | "clinical" | "comlex";

export type WeaknessReason =
  | "got-wrong"
  | "guessed-correctly"
  | "mechanism-unclear"
  | "forgot-fact"
  | "confused-diseases"
  | "need-memorize"
  | "high-yield";

export type WeaknessCategory =
  | "knowledge-gap"
  | "mechanism"
  | "diagnostic"
  | "management"
  | "pharmacology"
  | "anatomy"
  | "pathophysiology"
  | "test-taking"
  | "memory";

export type PimpLevel =
  | "ms1"
  | "ms2"
  | "step1"
  | "step2"
  | "clinical"
  | "intern"
  | "resident";

export type PimpQuestionType =
  | "definition"
  | "mechanism"
  | "lab"
  | "differential"
  | "treatment"
  | "complication"
  | "vignette"
  | "pharmacology"
  | "comparison";

export type AnswerScore = "correct" | "partial" | "incorrect" | "pending";

export type RecallStep =
  | "capture"
  | "generating"
  | "review"
  | "choose-path"
  | "study-guide"
  | "pimp-mode"
  | "export"
  | "summary";

// ─── Flashcard ────────────────────────────────────────────────────────────────

export interface FlashCard {
  id: string;
  type: CardType;

  // Card content
  front: string;
  back: string;
  clozeText?: string;         // text with {{c1::...}} markers for cloze cards
  explanation: string;        // why this card matters / extra context

  // Metadata
  tags: string[];
  deck: string;               // e.g. "Step 1::Renal::Nephrotic Syndrome"
  topic: string;              // e.g. "Nephrotic Syndrome"
  system: string;             // e.g. "Renal"
  difficulty: DifficultyLevel;
  boardRelevance: BoardRelevance;

  // Source tracking
  sourceType: SourceType;
  sourceText: string;         // the original captured text that generated this card

  // Weakness tracking
  weaknessReason?: WeaknessReason;
  weaknessCategory?: WeaknessCategory;

  // Anki integration
  exportedToAnki: boolean;
  ankiNoteId?: number;

  // Timestamps
  createdAt: Date;
  reviewedAt?: Date;
}

// ─── Study Guide ──────────────────────────────────────────────────────────────

export type StudyGuideSectionType =
  | "concept"
  | "presentation"
  | "diagnostics"
  | "management"
  | "pharmacology"
  | "pearls"
  | "traps"
  | "pathophysiology";

export interface StudyGuideSection {
  id: string;
  heading: string;
  content: string[];          // array of bullet points / paragraphs
  type: StudyGuideSectionType;
}

export interface StudyGuide {
  id: string;
  topic: string;
  system: string;
  sections: StudyGuideSection[];
  relatedCardIds: string[];
  generatedAt: Date;
}

// ─── AI Pimping Session ───────────────────────────────────────────────────────

export interface PimpQuestion {
  id: string;
  question: string;
  type: PimpQuestionType;
  expectedAnswer: string;
  studentAnswer?: string;
  score?: AnswerScore;
  feedback?: string;
  followUpQuestion?: string;
  generatedCardId?: string;   // card created from a missed answer
}

export interface PimpChatMessage {
  id: string;
  role: "attending" | "student" | "system";
  content: string;
  score?: AnswerScore;
  timestamp: Date;
}

export interface PimpSession {
  id: string;
  topic: string;
  system: string;
  level: PimpLevel;
  questions: PimpQuestion[];
  messages: PimpChatMessage[];
  overallScore: number;         // 0–100
  strengths: string[];
  weaknesses: string[];
  missedConcepts: string[];
  recommendedCardIds: string[];
  newCardsCreated: string[];
  startedAt: Date;
  completedAt?: Date;
}

// ─── Capture session ─────────────────────────────────────────────────────────

export interface CaptureSession {
  id: string;
  sourceType: SourceType;
  rawText: string;
  detectedTopic?: string;
  detectedSystem?: string;
  cards: FlashCard[];
  studyGuide?: StudyGuide;
  pimpSession?: PimpSession;
  weaknessReason?: WeaknessReason;
  createdAt: Date;
}

// ─── Weakness profile (dashboard data) ───────────────────────────────────────

export interface WeakTopic {
  topic: string;
  system: string;
  missCount: number;
  categories: WeaknessCategory[];
  lastMissed: Date;
  cardIds: string[];
}

export interface UserWeaknessProfile {
  weakTopics: WeakTopic[];
  weakSystems: { system: string; missCount: number }[];
  totalCardsMade: number;
  totalPimpSessions: number;
  totalPimpQuestions: number;
  averagePimpScore: number;
}

// ─── Deck hierarchy ───────────────────────────────────────────────────────────

export interface DeckNode {
  id: string;
  name: string;
  fullPath: string;           // "Step 1::Renal::Nephrotic Syndrome"
  cardCount: number;
  children: DeckNode[];
}

// ─── Export options ──────────────────────────────────────────────────────────

export type ExportFormat = "anki-apkg" | "csv" | "pdf" | "markdown";

export interface ExportResult {
  format: ExportFormat;
  fileUrl?: string;
  ankiSynced?: boolean;
  cardCount: number;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

export const WEAKNESS_REASON_LABELS: Record<WeaknessReason, string> = {
  "got-wrong": "I got this question wrong",
  "guessed-correctly": "I guessed correctly",
  "mechanism-unclear": "I didn't understand the mechanism",
  "forgot-fact": "I forgot this fact",
  "confused-diseases": "I confused it with another disease",
  "need-memorize": "I need to memorize this",
  "high-yield": "This is high-yield",
};

export const PIMP_LEVEL_LABELS: Record<PimpLevel, string> = {
  ms1: "MS1 — Foundations",
  ms2: "MS2 — Pathology & Pharm",
  step1: "Step 1 Prep",
  step2: "Step 2 Prep",
  clinical: "Clinical Rotations",
  intern: "Intern Level",
  resident: "Resident Level",
};

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  basic: "Basic",
  cloze: "Cloze Deletion",
  vignette: "Clinical Vignette",
  comparison: "Comparison",
};

export const SYSTEM_COLORS: Record<string, string> = {
  Renal: "#60a5fa",
  Cardiology: "#f87171",
  Pulmonology: "#38bdf8",
  Neurology: "#a78bfa",
  GI: "#fb923c",
  Endocrine: "#fbbf24",
  Hematology: "#f472b6",
  Immunology: "#4ade80",
  "Infectious Disease": "#2dd4bf",
  Rheumatology: "#c084fc",
  MSK: "#94a3b8",
  Dermatology: "#f97316",
  Psychiatry: "#818cf8",
  Pharmacology: "#e879f9",
};
