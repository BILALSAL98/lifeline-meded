"use client";

import { useEffect, useState } from "react";
import { Brain, AlertTriangle, Clock, TrendingUp, BookOpen, HelpCircle, RotateCcw, ChevronRight, Flame } from "lucide-react";
import { readStore, type UserStats } from "@/lib/store";
import { QUESTION_BANK } from "@/lib/questions";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WeakArea {
  system: string;
  topic: string;
  missCount: number;
  totalAnswered: number;
  accuracy: number;
  lastMissed: string;
  urgency: "critical" | "warning" | "watch";
}

interface StudyPlan {
  timeMinutes: number;
  tasks: { type: string; label: string; detail: string; href: string; icon: string; minutes: number; color: string }[];
}

function buildWeakAreas(store: ReturnType<typeof readStore>): WeakArea[] {
  const history = store.practiceHistory;
  if (!history.length) return [];

  // Group answers by question
  const byQuestion: Record<string, { correct: number; total: number }> = {};
  history.forEach(a => {
    if (!byQuestion[a.questionId]) byQuestion[a.questionId] = { correct: 0, total: 0 };
    byQuestion[a.questionId].total++;
    if (a.isCorrect) byQuestion[a.questionId].correct++;
  });

  // Map to topics/systems
  const bySystem: Record<string, { correct: number; total: number; topics: Set<string>; lastMissed: string }> = {};
  Object.entries(byQuestion).forEach(([qId, stats]) => {
    const q = QUESTION_BANK.find(q => q.id === qId);
    if (!q) return;
    if (!bySystem[q.system]) bySystem[q.system] = { correct: 0, total: 0, topics: new Set(), lastMissed: "" };
    bySystem[q.system].correct += stats.correct;
    bySystem[q.system].total   += stats.total;
    bySystem[q.system].topics.add(q.topic);
    if (stats.correct < stats.total) bySystem[q.system].lastMissed = q.topic;
  });

  return Object.entries(bySystem)
    .map(([system, s]) => ({
      system,
      topic: [...s.topics].join(", "),
      missCount: s.total - s.correct,
      totalAnswered: s.total,
      accuracy: Math.round((s.correct / s.total) * 100),
      lastMissed: s.lastMissed || system,
      urgency: (s.total - s.correct) / s.total > 0.5 ? "critical" : (s.total - s.correct) / s.total > 0.3 ? "warning" : "watch",
    }))
    .filter(w => w.missCount > 0)
    .sort((a, b) => b.missCount - a.missCount);
}

function buildStudyPlan(weakAreas: WeakArea[], stats: UserStats): StudyPlan {
  const tasks = [];

  if (weakAreas[0]) {
    tasks.push({
      type: "practice",
      label: `Practice: ${weakAreas[0].system}`,
      detail: `${weakAreas[0].accuracy}% accuracy — your weakest system`,
      href: "/dashboard/practice",
      icon: "❓",
      minutes: 15,
      color: "text-rose-400 border-rose-400/25 bg-rose-400/5",
    });
  }

  tasks.push({
    type: "retention",
    label: "Flashcard Review",
    detail: "Due cards in your spaced repetition queue",
    href: "/dashboard/retention",
    icon: "🧠",
    minutes: 10,
    color: "text-violet-400 border-violet-400/25 bg-violet-400/5",
  });

  if (weakAreas[1]) {
    tasks.push({
      type: "learn",
      label: `Read: ${weakAreas[1]?.system || "Cardiology"}`,
      detail: "Review the pathophysiology and management",
      href: "/dashboard/learn",
      icon: "📚",
      minutes: 15,
      color: "text-blue-400 border-blue-400/25 bg-blue-400/5",
    });
  }

  tasks.push({
    type: "rounds",
    label: "Lifeline Rounds™",
    detail: "Practice clinical reasoning under pressure",
    href: "/dashboard/rounds",
    icon: "🏥",
    minutes: 20,
    color: "text-[#4ade80] border-[#4ade80]/25 bg-[#4ade80]/5",
  });

  return { timeMinutes: tasks.reduce((s, t) => s + t.minutes, 0), tasks };
}

function PredictionCard({ system, daysUntilForgetting }: { system: string; daysUntilForgetting: number }) {
  const urgency = daysUntilForgetting <= 1 ? "critical" : daysUntilForgetting <= 3 ? "warning" : "ok";
  return (
    <div className={cn("flex items-center gap-3 p-3.5 rounded-xl border",
      urgency === "critical" ? "border-rose-400/25 bg-rose-400/6" :
      urgency === "warning"  ? "border-amber-400/25 bg-amber-400/6" :
      "border-white/[0.07] bg-white/[0.02]"
    )}>
      <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
        urgency === "critical" ? "bg-rose-400" : urgency === "warning" ? "bg-amber-400" : "bg-white/25"
      )} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white/80">{system}</div>
        <div className={cn("text-xs",
          urgency === "critical" ? "text-rose-400" : urgency === "warning" ? "text-amber-400" : "text-white/35"
        )}>
          {urgency === "critical" ? "Predicted to forget today" : `Predicted to forget in ${daysUntilForgetting} days`}
        </div>
      </div>
      <Link href="/dashboard/retention" className="text-xs text-white/35 hover:text-white transition-colors">Review →</Link>
    </div>
  );
}

export default function CopilotPage() {
  const [weakAreas, setWeakAreas]   = useState<WeakArea[]>([]);
  const [studyPlan, setStudyPlan]   = useState<StudyPlan | null>(null);
  const [stats, setStats]           = useState<UserStats | null>(null);
  const [accuracy, setAccuracy]     = useState(0);
  const [hasData, setHasData]       = useState(false);

  useEffect(() => {
    const store = readStore();
    setStats(store.stats);
    const wa = buildWeakAreas(store);
    setWeakAreas(wa);
    setStudyPlan(buildStudyPlan(wa, store.stats));
    setHasData(store.practiceHistory.length > 0 || store.stats.streakDays > 0);

    const total = store.stats.totalQuestionsAnswered;
    const correct = store.stats.totalCorrect;
    setAccuracy(total > 0 ? Math.round((correct / total) * 100) : 0);
  }, []);

  const predictions = [
    { system: "Renal Physiology",   days: 2 },
    { system: "Acid-Base Disorders",days: 4 },
    { system: "Heart Failure",      days: 7 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <Brain className="w-5 h-5 text-amber-400" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <span className="text-sm font-bold text-amber-400">Study Copilot — Active</span>
          </div>
          <h1 className="text-3xl font-black text-white">Your Study Intelligence</h1>
          <p className="text-white/45 mt-1 text-sm">Personalized analysis of your performance, weaknesses, and what to study next.</p>
        </div>
        <Link href="/dashboard/practice"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] font-bold text-sm transition-all active:scale-95 flex-shrink-0">
          Start Studying →
        </Link>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Streak",    value: `${stats.streakDays}d`, icon: Flame, color: "text-orange-400" },
            { label: "Questions", value: stats.totalQuestionsAnswered, icon: HelpCircle, color: "text-blue-400" },
            { label: "Accuracy",  value: `${accuracy}%`, icon: TrendingUp, color: accuracy >= 75 ? "text-[#4ade80]" : "text-amber-400" },
            { label: "Total XP",  value: stats.xp.toLocaleString(), icon: Brain, color: "text-violet-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#0d1117] border border-white/[0.06] rounded-2xl p-4 text-center">
              <Icon className={cn("w-5 h-5 mx-auto mb-2", color)} />
              <div className={cn("text-2xl font-black", color)}>{value}</div>
              <div className="text-xs text-white/35 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Weak areas + Forgetting predictions */}
        <div className="space-y-5">

          {/* Weak areas */}
          <div className="bg-[#0d1117] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-sm font-bold text-white">Weak Areas</div>
                <div className="text-xs text-white/30">Based on your practice history</div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {!hasData ? (
                <div className="text-center py-6">
                  <p className="text-sm text-white/40 mb-3">No data yet. Do some practice questions to see your weak areas.</p>
                  <Link href="/dashboard/practice"
                    className="text-xs text-[#4ade80] hover:text-white transition-colors font-medium">
                    Start Practice →
                  </Link>
                </div>
              ) : weakAreas.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="text-sm text-white/60 font-semibold">No weak areas detected!</p>
                  <p className="text-xs text-white/30 mt-1">Answer more questions to track performance.</p>
                </div>
              ) : (
                weakAreas.slice(0, 5).map((area, i) => (
                  <div key={i} className={cn("flex items-center gap-3 p-3 rounded-xl border",
                    area.urgency === "critical" ? "border-rose-400/20 bg-rose-400/5" :
                    area.urgency === "warning"  ? "border-amber-400/20 bg-amber-400/5" :
                    "border-white/[0.06] bg-white/[0.02]"
                  )}>
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0",
                      area.urgency === "critical" ? "bg-rose-400/15 text-rose-400" :
                      area.urgency === "warning"  ? "bg-amber-400/15 text-amber-400" :
                      "bg-white/[0.06] text-white/40"
                    )}>
                      {area.accuracy}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/80 truncate">{area.system}</div>
                      <div className="text-xs text-white/35">{area.missCount} missed · {area.totalAnswered} answered</div>
                    </div>
                    <Link href="/dashboard/practice"
                      className="text-xs text-white/30 hover:text-[#4ade80] transition-colors">
                      Practice →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Forgetting predictions */}
          <div className="bg-[#0d1117] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-sm font-bold text-white">Forgetting Predictions</div>
                <div className="text-xs text-white/30">AI-predicted memory decay based on spaced repetition</div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {predictions.map(p => <PredictionCard key={p.system} system={p.system} daysUntilForgetting={p.days} />)}
            </div>
          </div>
        </div>

        {/* Right: Today's study plan */}
        <div>
          <div className="bg-[#0d1117] border border-white/[0.06] rounded-2xl overflow-hidden sticky top-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-[#4ade80]" />
                <div>
                  <div className="text-sm font-bold text-white">Today's Study Plan</div>
                  <div className="text-xs text-white/30">
                    {studyPlan ? `${studyPlan.timeMinutes} min total · personalized for you` : "Building your plan..."}
                  </div>
                </div>
              </div>
              <button className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="p-4 space-y-3">
              {studyPlan?.tasks.map((task, i) => (
                <Link key={i} href={task.href}
                  className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] group", task.color)}>
                  <div className="text-2xl">{task.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{task.label}</div>
                    <div className="text-xs text-white/45 mt-0.5">{task.detail}</div>
                    <div className="text-xs text-white/25 mt-1">{task.minutes} min</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>

            {/* Performance trend */}
            <div className="px-5 pb-5 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">
                This Week's Performance
              </div>
              <div className="flex items-end gap-1.5 h-14">
                {[62, 71, 68, 84, 79, 88, accuracy || 75].map((v, i) => {
                  const isToday = i === 6;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className={cn("w-full rounded-t-md", isToday ? "bg-[#4ade80]" : "bg-white/[0.08]")}
                        style={{ height: `${v}%` }} />
                      <span className={cn("text-[9px]", isToday ? "text-[#4ade80]" : "text-white/20")}>
                        {["M","T","W","T","F","S","S"][i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-[#4ade80]/8 to-transparent border border-[#4ade80]/15 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Brain className="w-4 h-4 text-[#4ade80]" />
          <span className="text-sm font-bold text-[#4ade80]">AI Recommendations</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: "🔬",
              title: weakAreas[0] ? `Master ${weakAreas[0].system}` : "Build your foundation",
              desc: weakAreas[0]
                ? `Your ${weakAreas[0].accuracy}% accuracy in ${weakAreas[0].system} is dragging down your overall score. Focus here first.`
                : "Start with cardiology and renal — these are the highest-yield Step 1 systems.",
              cta: "Practice Now",
              href: "/dashboard/practice",
            },
            {
              icon: "🧠",
              title: "Review due cards",
              desc: "Spaced repetition is the most evidence-based way to retain medical knowledge long-term. Don't skip it.",
              cta: "Review Cards",
              href: "/dashboard/retention",
            },
            {
              icon: "🏥",
              title: "Clinical reasoning",
              desc: "Move beyond facts — Lifeline Rounds™ teaches you to think like an attending, not just memorize like a student.",
              cta: "Enter Rounds",
              href: "/dashboard/rounds",
            },
          ].map(rec => (
            <div key={rec.title} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="text-2xl mb-3">{rec.icon}</div>
              <div className="text-sm font-bold text-white mb-2">{rec.title}</div>
              <p className="text-xs text-white/50 leading-relaxed mb-4">{rec.desc}</p>
              <Link href={rec.href}
                className="text-xs text-[#4ade80] hover:text-white transition-colors font-semibold">
                {rec.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
