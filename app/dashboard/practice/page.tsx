"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Timer, CheckCircle2, XCircle, AlertCircle,
  Flag, Bookmark, ArrowRight, RotateCcw, BarChart2,
} from "lucide-react";
import { QUESTION_BANK, type Question } from "@/lib/questions";
import { recordAnswer, logSession, readStore, checkAndUpdateStreak, awardXP } from "@/lib/store";
import { cn } from "@/lib/utils";

const SYSTEMS = ["All Systems", ...Array.from(new Set(QUESTION_BANK.map((q) => q.system))).sort()];

const systemColor: Record<string, string> = {
  Cardiology: "text-rose-400 bg-rose-400/10 border-rose-400/25",
  Renal: "text-blue-400 bg-blue-400/10 border-blue-400/25",
  Pulmonology: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  Neurology: "text-violet-400 bg-violet-400/10 border-violet-400/25",
  Gastroenterology: "text-orange-400 bg-orange-400/10 border-orange-400/25",
  Endocrine: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  Hematology: "text-pink-400 bg-pink-400/10 border-pink-400/25",
  "Infectious Disease": "text-teal-400 bg-teal-400/10 border-teal-400/25",
  Pharmacology: "text-purple-400 bg-purple-400/10 border-purple-400/25",
};

const diffLabel: Record<number, { label: string; color: string }> = {
  1: { label: "Easy",   color: "text-[#4ade80]" },
  2: { label: "Medium", color: "text-amber-400" },
  3: { label: "Hard",   color: "text-rose-400" },
};

export default function PracticePage() {
  const [filter, setFilter]     = useState("All Systems");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex]       = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExp, setShowExp]   = useState(false);
  const [flagged, setFlagged]   = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(90);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [sessionDone, setSessionDone]   = useState(false);
  const [sessionStart] = useState(Date.now());

  // Load and shuffle questions
  const loadQuestions = useCallback((systemFilter: string) => {
    let pool = systemFilter === "All Systems"
      ? [...QUESTION_BANK]
      : QUESTION_BANK.filter((q) => q.system === systemFilter);
    // Shuffle
    pool = pool.sort(() => Math.random() - 0.5);
    setQuestions(pool);
    setIndex(0);
    setSelected(null);
    setShowExp(false);
    setTimeLeft(90);
    setSessionStats({ correct: 0, incorrect: 0, total: 0 });
    setSessionDone(false);
  }, []);

  useEffect(() => { checkAndUpdateStreak(); loadQuestions("All Systems"); }, []); // eslint-disable-line

  // Timer
  useEffect(() => {
    if (selected !== null || sessionDone) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; } // time's up — mark wrong
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [selected, sessionDone, timeLeft]); // eslint-disable-line

  const q = questions[index];

  function handleAnswer(idx: number) {
    if (selected !== null || !q) return;
    setSelected(idx);
    setShowExp(true);

    const isCorrect = idx === q.correct;
    recordAnswer({ questionId: q.id, selectedIndex: idx, isCorrect, timeSeconds: 90 - timeLeft });
    setSessionStats((s) => ({
      total: s.total + 1,
      correct: s.correct + (isCorrect ? 1 : 0),
      incorrect: s.incorrect + (isCorrect ? 0 : 1),
    }));
    if (isCorrect) awardXP(15);
    else awardXP(3);
  }

  function nextQuestion() {
    if (index + 1 >= questions.length) {
      const mins = Math.round((Date.now() - sessionStart) / 60000);
      logSession({ type: "practice", topic: filter, durationMinutes: mins, questionsCount: sessionStats.total + 1 });
      setSessionDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setShowExp(false);
      setFlagged(false);
      setTimeLeft(90);
    }
  }

  const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
  const timerColor = timeLeft > 45 ? "text-[#4ade80]" : timeLeft > 20 ? "text-amber-400" : "text-rose-400";

  // ── Session complete screen ────────────────────────────────────────────────
  if (sessionDone) {
    const color = accuracy >= 80 ? "#4ade80" : accuracy >= 60 ? "#fbbf24" : "#f87171";
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center gap-8 px-4">
        <div className="w-20 h-20 rounded-3xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center text-3xl">
          {accuracy >= 75 ? "🎯" : "📖"}
        </div>
        <div>
          <h2 className="text-3xl font-black text-white mb-2">Session Complete</h2>
          <p className="text-white/50">{filter} · {sessionStats.total} questions</p>
        </div>
        <div className="flex items-center gap-10">
          {[
            { label: "Score",    value: `${accuracy}%`, color },
            { label: "Correct",  value: sessionStats.correct,   color: "#4ade80" },
            { label: "Incorrect",value: sessionStats.incorrect, color: "#f87171" },
          ].map(({ label, value, color: c }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black" style={{ color: c }}>{value}</div>
              <div className="text-xs text-white/30 mt-1">{label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => loadQuestions(filter)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] font-bold text-sm transition-all active:scale-95">
            <RotateCcw className="w-4 h-4" /> New Session
          </button>
          <button onClick={() => { setFilter("All Systems"); loadQuestions("All Systems"); }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 font-semibold text-sm hover:text-white transition-colors">
            All Systems
          </button>
        </div>
      </div>
    );
  }

  if (!q) return <div className="flex items-center justify-center h-full text-white/40">Loading questions...</div>;

  return (
    <div className="flex h-[calc(100vh-57px)]">

      {/* Left stats sidebar */}
      <div className="hidden lg:flex flex-col w-56 bg-[#090c13] border-r border-white/[0.05] flex-shrink-0 p-4 gap-5">
        {/* Session stats */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Session</p>
          <div className="space-y-3">
            {[
              { label: "Correct",   value: sessionStats.correct,   color: "text-[#4ade80]" },
              { label: "Incorrect", value: sessionStats.incorrect, color: "text-rose-400" },
              { label: "Question",  value: `${index+1}/${questions.length}`, color: "text-white" },
              { label: "Accuracy",  value: `${accuracy}%`, color: accuracy >= 75 ? "text-[#4ade80]" : "text-amber-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-white/40">{label}</span>
                <span className={cn("text-sm font-black", color)}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System filter */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Filter</p>
          <div className="space-y-0.5">
            {SYSTEMS.map((s) => (
              <button key={s} onClick={() => { setFilter(s); loadQuestions(s); }}
                className={cn("w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  filter === s ? "bg-white/[0.07] text-white" : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"
                )}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <button onClick={() => loadQuestions(filter)}
            className="w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]
                       text-xs text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2">
            <RotateCcw className="w-3 h-3" /> Shuffle
          </button>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Question toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.05] flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40 font-mono">{index + 1} / {questions.length}</span>
            <span className={cn("text-xs font-bold border px-2 py-0.5 rounded-md", systemColor[q.system] ?? "text-white/50 bg-white/10 border-white/20")}>
              {q.system}
            </span>
            <span className={cn("text-xs font-bold", diffLabel[q.difficulty].color)}>
              {diffLabel[q.difficulty].label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("flex items-center gap-1.5 font-mono text-sm font-bold", timerColor)}>
              <Timer className="w-3.5 h-3.5" />
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
            <button onClick={() => setFlagged(!flagged)}
              className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                flagged ? "text-amber-400 bg-amber-400/10" : "text-white/25 hover:text-amber-400 hover:bg-amber-400/10"
              )}>
              <Flag className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setBookmarked((prev) => { const n = new Set(prev); n.has(q.id) ? n.delete(q.id) : n.add(q.id); return n; })}
              className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                bookmarked.has(q.id) ? "text-[#60a5fa] bg-[#60a5fa]/10" : "text-white/25 hover:text-[#60a5fa] hover:bg-[#60a5fa]/10"
              )}>
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/[0.05]">
          <div className="h-full bg-gradient-to-r from-[#4ade80] to-[#2dd4bf] transition-all duration-300"
            style={{ width: `${((index) / questions.length) * 100}%` }} />
        </div>

        {/* Scrollable question content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto">

            {/* Stem */}
            <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">{q.topic}</p>
              <p className="text-base text-white/85 leading-relaxed">{q.stem}</p>
            </div>

            {/* Answer options */}
            <div className="space-y-3 mb-5">
              {q.options.map((opt, i) => {
                const isCorrect  = i === q.correct;
                const isSelected = selected === i;
                const answered   = selected !== null;
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                    className={cn(
                      "w-full text-left px-5 py-4 rounded-2xl border text-sm transition-all duration-200",
                      !answered
                        ? "border-white/[0.08] bg-white/[0.03] text-white/75 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                        : isSelected && isCorrect
                        ? "border-[#4ade80]/60 bg-[#4ade80]/10 text-white"
                        : isSelected && !isCorrect
                        ? "border-rose-400/60 bg-rose-400/10 text-white"
                        : isCorrect
                        ? "border-[#4ade80]/30 bg-[#4ade80]/5 text-white/70"
                        : "border-white/[0.04] bg-white/[0.015] text-white/25"
                    )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                        !answered ? "border-white/20 text-white/35" :
                        isCorrect ? "border-[#4ade80] text-[#4ade80]" :
                        isSelected ? "border-rose-400 text-rose-400" : "border-white/10 text-white/20"
                      )}>
                        {answered && isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                         answered && isSelected ? <XCircle className="w-3.5 h-3.5" /> :
                         String.fromCharCode(65 + i)}
                      </div>
                      <span className="leading-relaxed">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExp && (
              <div className={cn("rounded-2xl border overflow-hidden mb-5",
                selected === q.correct ? "border-[#4ade80]/20 bg-[#4ade80]/5" : "border-rose-400/20 bg-rose-400/5"
              )}>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
                  {selected === q.correct
                    ? <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />
                    : <AlertCircle className="w-5 h-5 text-rose-400" />}
                  <span className="font-bold text-white">
                    {selected === q.correct ? "Correct!" : `Incorrect — Answer is ${String.fromCharCode(65 + q.correct)}`}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-sm text-white/80 leading-relaxed">{q.explanation}</p>
                  {q.wrongExplanations.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Why the others are wrong</p>
                      <div className="space-y-1.5">
                        {q.wrongExplanations.map((exp, i) => (
                          <p key={i} className="text-xs text-white/50 leading-relaxed">{exp}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Next */}
            {selected !== null && (
              <button onClick={nextQuestion}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl
                           bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] font-bold text-sm
                           transition-all duration-200 active:scale-[0.98]">
                {index + 1 >= questions.length ? "Complete Session" : "Next Question"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
