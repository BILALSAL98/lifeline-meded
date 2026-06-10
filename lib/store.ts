/**
 * Lifeline MEDed — Client-side state store
 * Persists everything to localStorage so data survives page reloads.
 * No backend required for core functionality.
 */

"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  email: string;
  program: string;
  year: string;
  school: string;
  examDate: string;
  aiLevel: string;
  aiMode: string;
  theme: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;       // ISO date string "2025-01-15"
  totalCardsMade: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalPimpSessions: number;
  todayCards: number;
  todayQuestions: number;
  todayStudyMinutes: number;
  sessionStartTime: number | null;
}

export interface SavedCard {
  id: string;
  type: string;
  front: string;
  back: string;
  clozeText?: string;
  explanation: string;
  tags: string[];
  deck: string;
  topic: string;
  system: string;
  difficulty: number;
  // Spaced repetition (SM-2)
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string;              // ISO date string
  lastReviewed: string | null;
  createdAt: string;
}

export interface PracticeAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSeconds: number;
  answeredAt: string;
}

export interface StudySession {
  id: string;
  type: "practice" | "retention" | "tutor" | "recall";
  topic: string;
  score?: number;
  cardsCount?: number;
  questionsCount?: number;
  durationMinutes: number;
  completedAt: string;
}

export interface LifelineStore {
  profile: UserProfile;
  stats: UserStats;
  cards: SavedCard[];
  practiceHistory: PracticeAnswer[];
  sessions: StudySession[];
  notifications: { drill: boolean; copilot: boolean; streak: boolean; email: boolean };
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  name: "Bilal",
  email: "bilal.salous1@gmail.com",
  program: "MD",
  year: "MS2",
  school: "Medical University",
  examDate: "2025-06-15",
  aiLevel: "Step 1",
  aiMode: "socratic",
  theme: "dark",
};

const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
  streakDays: 0,
  lastActiveDate: "",
  totalCardsMade: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  totalPimpSessions: 0,
  todayCards: 0,
  todayQuestions: 0,
  todayStudyMinutes: 0,
  sessionStartTime: null,
};

// ─── Storage key ──────────────────────────────────────────────────────────────

const KEY = "lifeline_store_v1";

// ─── Core read/write ──────────────────────────────────────────────────────────

export function readStore(): LifelineStore {
  if (typeof window === "undefined") return makeDefault();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return makeDefault();
    return { ...makeDefault(), ...JSON.parse(raw) };
  } catch {
    return makeDefault();
  }
}

export function writeStore(store: LifelineStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    console.warn("[Lifeline] Could not save to localStorage");
  }
}

function makeDefault(): LifelineStore {
  return {
    profile: { ...DEFAULT_PROFILE },
    stats: { ...DEFAULT_STATS },
    cards: [],
    practiceHistory: [],
    sessions: [],
    notifications: { drill: true, copilot: true, streak: true, email: true },
  };
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

/** Update only the stats portion */
export function updateStats(updates: Partial<UserStats>): UserStats {
  const store = readStore();
  store.stats = { ...store.stats, ...updates };
  writeStore(store);
  return store.stats;
}

/** Update only the profile portion */
export function updateProfile(updates: Partial<UserProfile>): void {
  const store = readStore();
  store.profile = { ...store.profile, ...updates };
  writeStore(store);
}

/** Award XP and update level */
export function awardXP(amount: number): { xp: number; level: number; leveledUp: boolean } {
  const store = readStore();
  const oldLevel = store.stats.level;
  store.stats.xp += amount;
  store.stats.level = Math.max(1, Math.floor(store.stats.xp / 500) + 1);
  const leveledUp = store.stats.level > oldLevel;
  writeStore(store);
  return { xp: store.stats.xp, level: store.stats.level, leveledUp };
}

/** Call once per day to update streak */
export function checkAndUpdateStreak(): number {
  const store = readStore();
  const today = new Date().toISOString().slice(0, 10);
  const last  = store.stats.lastActiveDate;

  if (last === today) return store.stats.streakDays; // already counted today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (last === yesterday) {
    store.stats.streakDays += 1;
  } else if (last !== today) {
    store.stats.streakDays = 1; // reset — missed a day
  }

  store.stats.lastActiveDate = today;
  store.stats.todayCards = 0;
  store.stats.todayQuestions = 0;
  store.stats.todayStudyMinutes = 0;
  writeStore(store);
  return store.stats.streakDays;
}

/** Save a flashcard */
export function saveCard(card: Omit<SavedCard, "id" | "createdAt" | "easeFactor" | "intervalDays" | "repetitions" | "dueDate" | "lastReviewed">): SavedCard {
  const store = readStore();
  const now = new Date().toISOString();
  const full: SavedCard = {
    ...card,
    id: crypto.randomUUID(),
    createdAt: now,
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    dueDate: now,
    lastReviewed: null,
  };
  store.cards.push(full);
  store.stats.totalCardsMade += 1;
  store.stats.todayCards += 1;
  store.stats.xp += 10;
  store.stats.level = Math.max(1, Math.floor(store.stats.xp / 500) + 1);
  writeStore(store);
  return full;
}

/** Get cards due for spaced repetition review */
export function getDueCards(limit = 20): SavedCard[] {
  const { cards } = readStore();
  const now = new Date().toISOString();
  return cards
    .filter((c) => c.dueDate <= now)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit);
}

/** SM-2 spaced repetition rating update */
export function rateCard(cardId: string, rating: "again" | "hard" | "good" | "easy"): void {
  const store = readStore();
  const idx = store.cards.findIndex((c) => c.id === cardId);
  if (idx === -1) return;

  const card = store.cards[idx];
  const q = { again: 0, hard: 2, good: 3, easy: 5 }[rating];

  if (q < 3) {
    card.repetitions = 0;
    card.intervalDays = 1;
  } else {
    if (card.repetitions === 0) card.intervalDays = 1;
    else if (card.repetitions === 1) card.intervalDays = 6;
    else card.intervalDays = Math.round(card.intervalDays * card.easeFactor);
    card.repetitions += 1;
  }

  card.easeFactor = Math.max(1.3, card.easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  card.lastReviewed = new Date().toISOString();
  const due = new Date(Date.now() + card.intervalDays * 86400000);
  card.dueDate = due.toISOString();

  store.cards[idx] = card;
  store.stats.xp += rating === "again" ? 2 : rating === "hard" ? 5 : rating === "good" ? 8 : 12;
  store.stats.level = Math.max(1, Math.floor(store.stats.xp / 500) + 1);
  writeStore(store);
}

/** Record a practice answer */
export function recordAnswer(answer: Omit<PracticeAnswer, "answeredAt">): void {
  const store = readStore();
  store.practiceHistory.push({ ...answer, answeredAt: new Date().toISOString() });
  store.stats.totalQuestionsAnswered += 1;
  if (answer.isCorrect) {
    store.stats.totalCorrect += 1;
    store.stats.xp += 15;
  } else {
    store.stats.xp += 3;
  }
  store.stats.todayQuestions += 1;
  store.stats.level = Math.max(1, Math.floor(store.stats.xp / 500) + 1);
  writeStore(store);
}

/** Log a completed study session */
export function logSession(session: Omit<StudySession, "id" | "completedAt">): void {
  const store = readStore();
  store.sessions.unshift({
    ...session,
    id: crypto.randomUUID(),
    completedAt: new Date().toISOString(),
  });
  store.sessions = store.sessions.slice(0, 50); // keep last 50
  store.stats.todayStudyMinutes += session.durationMinutes;
  writeStore(store);
}

/** Get accuracy across all practice answers */
export function getAccuracy(): number {
  const { practiceHistory } = readStore();
  if (!practiceHistory.length) return 0;
  return Math.round((practiceHistory.filter((a) => a.isCorrect).length / practiceHistory.length) * 100);
}

/** Export all cards as CSV string */
export function exportCardsCSV(): string {
  const { cards } = readStore();
  const headers = ["Front", "Back", "Type", "Deck", "Topic", "System", "Tags", "Difficulty"];
  const rows = cards.map((c) => [
    `"${(c.front || c.clozeText || "").replace(/"/g, '""')}"`,
    `"${(c.back || "").replace(/"/g, '""')}"`,
    c.type,
    c.deck,
    c.topic,
    c.system,
    (c.tags || []).join("; "),
    c.difficulty,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/** Trigger CSV download in browser */
export function downloadCSV(filename = "lifeline_cards.csv"): void {
  const csv = exportCardsCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export cards as Anki-compatible text (tab-separated) */
export function exportAnkiText(): string {
  const { cards } = readStore();
  return cards.map((c) => {
    const front = c.clozeText || c.front;
    const back  = c.back || "";
    return `${front}\t${back}\t${(c.tags || []).join(" ")}`;
  }).join("\n");
}
