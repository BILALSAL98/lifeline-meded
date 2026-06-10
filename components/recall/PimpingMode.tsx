"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  ChevronDown,
  Mic,
  MicOff,
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import {
  type PimpLevel,
  type PimpChatMessage,
  type AnswerScore,
  PIMP_LEVEL_LABELS,
} from "@/lib/recall-types";
import { cn } from "@/lib/utils";

interface PimpingModeProps {
  topic: string;
  system: string;
  onComplete: (score: number, weaknesses: string[]) => void;
  onExit: () => void;
}

// Simulated AI conversation for the demo
const DEMO_SCRIPT: { role: "attending" | "student"; content: string; score?: AnswerScore }[] = [
  { role: "attending", content: "You're on rounds. A patient is brought in with periorbital puffiness, frothy urine, and significant swelling in both legs. Labs show serum albumin of 1.6 g/dL. What syndrome is this?" },
  { role: "student", content: "Nephritic syndrome." },
  { role: "attending", content: "Not quite — you're on the right track thinking about kidney pathology, but look at those labs again. Serum albumin at 1.6 and periorbital edema. What massive urinary loss causes that albumin level?", score: "incorrect" },
  { role: "student", content: "Nephrotic syndrome — massive proteinuria." },
  { role: "attending", content: "Correct. Now explain the mechanism of edema in nephrotic syndrome. Walk me through it step by step.", score: "correct" },
];

const levelColors: Record<PimpLevel, string> = {
  ms1: "text-green-400 border-green-400/30 bg-green-400/10",
  ms2: "text-teal-400 border-teal-400/30 bg-teal-400/10",
  step1: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  step2: "text-indigo-400 border-indigo-400/30 bg-indigo-400/10",
  clinical: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  intern: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  resident: "text-rose-400 border-rose-400/30 bg-rose-400/10",
};

const scoreConfig: Record<AnswerScore, { icon: React.ElementType; color: string; label: string }> = {
  correct: { icon: CheckCircle, color: "text-[#4ade80]", label: "Correct" },
  partial: { icon: AlertCircle, color: "text-amber-400", label: "Partial" },
  incorrect: { icon: XCircle, color: "text-rose-400", label: "Incorrect" },
  pending: { icon: AlertCircle, color: "text-white/30", label: "" },
};

function ScoreBadge({ score }: { score: AnswerScore }) {
  const { icon: Icon, color, label } = scoreConfig[score];
  if (score === "pending" || !label) return null;
  return (
    <div className={cn("flex items-center gap-1 text-xs font-bold", color)}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

function RealTimeScore({ score }: { score: number }) {
  const color =
    score >= 80 ? "#4ade80" : score >= 60 ? "#fbbf24" : "#f87171";
  return (
    <div className="flex flex-col items-center">
      <div
        className="text-3xl font-black tabular-nums"
        style={{ color }}
      >
        {score}
      </div>
      <div className="text-[10px] text-white/30 font-medium">Score</div>
      <div className="mt-2 w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function PimpingMode({ topic, system, onComplete, onExit }: PimpingModeProps) {
  const [level, setLevel] = useState<PimpLevel>("step1");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<PimpChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [score, setScore] = useState(75);
  const [questionCount, setQuestionCount] = useState(0);
  const [micActive, setMicActive] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const startSession = () => {
    setStarted(true);
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      addMessage({
        id: crypto.randomUUID(),
        role: "attending",
        content: `Welcome. I'm your attending today. We're covering **${topic}** — ${system} system. I'll be asking you a series of clinical questions. Think carefully before answering. Let's begin.

You're on morning rounds. A 12-year-old boy presents with significant periorbital edema and frothy urine that started 10 days after a viral upper respiratory infection. His serum albumin is 1.6 g/dL and his total cholesterol is 320 mg/dL. What syndrome does this presentation suggest?`,
        timestamp: new Date(),
      });
      setQuestionCount(1);
    }, 1200);
  };

  const addMessage = (msg: PimpChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const sendAnswer = () => {
    if (!input.trim() || isThinking) return;

    const studentMsg: PimpChatMessage = {
      id: crypto.randomUUID(),
      role: "student",
      content: input,
      timestamp: new Date(),
    };
    addMessage(studentMsg);
    setInput("");
    setIsThinking(true);

    // Simulate AI evaluating and responding
    setTimeout(() => {
      setIsThinking(false);
      const responses = [
        {
          content: `Good instinct on the kidney pathology. The key differentiator here is the **massive proteinuria** combined with **hypoalbuminemia** and **hyperlipidemia** — that triad points to nephrotic syndrome, not nephritic. Nephritic syndrome causes hematuria, RBC casts, and hypertension.

Now — why does nephrotic syndrome specifically cause **hyperlipidemia**? What's the mechanism?`,
          score: score - 8,
          scoreMsg: "partial" as AnswerScore,
        },
        {
          content: `Excellent. The liver upregulates lipoprotein synthesis to compensate for the oncotic deficit — it's trying to increase plasma proteins but makes lipoproteins instead. Classic.

One more: this child's biopsy shows normal light microscopy. What does electron microscopy show, and what does that tell you about the diagnosis?`,
          score: score + 5,
          scoreMsg: "correct" as AnswerScore,
        },
        {
          content: `Foot process effacement on electron microscopy — hallmark of **Minimal Change Disease**. The podocytes lose their filtration barrier integrity due to T-cell mediated cytokine damage.

Good session. Let me give you your summary.`,
          score: score + 10,
          scoreMsg: "correct" as AnswerScore,
        },
      ];

      const responseIndex = Math.min(questionCount - 1, responses.length - 1);
      const response = responses[responseIndex];

      setScore(Math.min(100, response.score));
      setQuestionCount((q) => q + 1);

      const aiMsg: PimpChatMessage = {
        id: crypto.randomUUID(),
        role: "attending",
        content: response.content,
        score: response.scoreMsg,
        timestamp: new Date(),
      };
      addMessage(aiMsg);

      if (questionCount >= 3) {
        setTimeout(() => setSessionDone(true), 1500);
      }
    }, 1800);
  };

  // Level selector (pre-start screen)
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center gap-8">
        {/* Attending avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600
                          flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(244,63,94,0.3)]">
            👨‍⚕️
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full
                          bg-[#4ade80] flex items-center justify-center
                          border-2 border-[#060810]">
            <div className="w-2 h-2 rounded-full bg-[#06080f]" />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-white mb-2">AI Doctor — Pimp Mode</h2>
          <p className="text-white/50 max-w-sm">
            I&apos;ll question you on <strong className="text-white">{topic}</strong> the way an attending would on rounds.
            One question at a time. No hints. Just your clinical reasoning.
          </p>
        </div>

        {/* Level selector */}
        <div className="w-full max-w-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">
            Select your level
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(PIMP_LEVEL_LABELS) as [PimpLevel, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setLevel(key)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-semibold border transition-all duration-150",
                  level === key
                    ? levelColors[key]
                    : "border-white/[0.07] bg-white/[0.03] text-white/40 hover:text-white/60"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startSession}
          className="flex items-center gap-2 px-10 py-4 rounded-2xl
                     bg-rose-500 hover:bg-rose-400 text-white
                     text-base font-bold transition-all duration-200
                     shadow-[0_0_30px_rgba(244,63,94,0.3)]
                     hover:shadow-[0_0_50px_rgba(244,63,94,0.4)]
                     active:scale-95"
        >
          <Stethoscope className="w-5 h-5" />
          Begin Pimping Session
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-white/20">
          Typically 5–8 questions · 10–15 minutes · Fully AI-generated from your content
        </p>
      </div>
    );
  }

  // Session complete screen
  if (sessionDone) {
    const weaknesses = ["Nephrotic vs. Nephritic distinction", "Mechanism of edema in nephrotic syndrome"];
    return (
      <div className="flex flex-col items-center text-center gap-8 py-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4ade80] to-[#2dd4bf]
                        flex items-center justify-center text-3xl
                        shadow-[0_0_40px_rgba(74,222,128,0.3)]">
          <Trophy className="w-10 h-10 text-[#06080f]" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-white mb-2">Session Complete</h2>
          <p className="text-white/50">Here&apos;s how you performed on <strong className="text-white">{topic}</strong></p>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-10">
          {[
            { label: "Score", value: `${score}`, color: score >= 80 ? "#4ade80" : "#fbbf24" },
            { label: "Questions", value: `${questionCount - 1}`, color: "#60a5fa" },
            { label: "Correct", value: "2", color: "#4ade80" },
            { label: "Missed", value: "1", color: "#f87171" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black" style={{ color }}>{value}</div>
              <div className="text-xs text-white/30 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Weaknesses */}
        <div className="w-full max-w-md bg-[#0d1117] rounded-2xl border border-white/[0.07] p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
            Areas to review
          </p>
          {weaknesses.map((w) => (
            <div key={w} className="flex items-start gap-3 mb-3">
              <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-white/70">{w}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-white/[0.06] mt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Recommended next steps</p>
            {[
              "Review 3 Anki cards on nephrotic vs. nephritic",
              "Re-read edema mechanism section in your study guide",
              "Repeat pimp session in 48 hours",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 mb-2">
                <span className="text-xs text-[#4ade80] font-bold mt-0.5">{i + 1}.</span>
                <span className="text-sm text-white/60">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onComplete(score, weaknesses)}
            className="px-6 py-3 rounded-xl bg-[#22c55e] hover:bg-[#4ade80]
                       text-[#06080f] font-bold text-sm transition-all active:scale-95"
          >
            Save & Continue
          </button>
          <button
            onClick={onExit}
            className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                       text-white/60 font-semibold text-sm hover:text-white
                       transition-colors"
          >
            Return to Cards
          </button>
        </div>
      </div>
    );
  }

  // Active chat session
  return (
    <div className="flex flex-col h-[680px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3
                      border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600
                          flex items-center justify-center text-lg">
            👨‍⚕️
          </div>
          <div>
            <div className="text-sm font-bold text-white">Dr. AI — Attending</div>
            <div className="flex items-center gap-2 text-xs text-white/35">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              Pimping · {topic}
            </div>
          </div>
          <span className={cn("ml-2 px-2.5 py-1 rounded-lg text-xs font-bold border", levelColors[level])}>
            {PIMP_LEVEL_LABELS[level]}
          </span>
        </div>

        {/* Live score */}
        <div className="flex items-center gap-4">
          <RealTimeScore score={score} />
          <button
            onClick={onExit}
            className="text-xs text-white/25 hover:text-white/60 transition-colors"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "student" && "flex-row-reverse"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold",
              msg.role === "attending"
                ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white text-base"
                : "bg-[#60a5fa]/20 border border-[#60a5fa]/30 text-[#60a5fa] text-xs"
            )}>
              {msg.role === "attending" ? "👨‍⚕️" : "A"}
            </div>

            <div className={cn(
              "flex flex-col gap-1 max-w-[80%]",
              msg.role === "student" && "items-end"
            )}>
              {msg.score && msg.role === "attending" && (
                <ScoreBadge score={msg.score} />
              )}
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === "attending"
                  ? "bg-[#111827] text-white/80 rounded-tl-sm"
                  : "bg-[#60a5fa]/10 border border-[#60a5fa]/20 text-white/70 rounded-tr-sm"
              )}>
                {/* Render bold text */}
                {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={i} className="text-white font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
              <span className="text-[10px] text-white/20">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600
                            flex items-center justify-center text-base flex-shrink-0">
              👨‍⚕️
            </div>
            <div className="bg-[#111827] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 150, 300].map((d) => (
                  <div key={d} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                    style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMicActive(!micActive)}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
              micActive
                ? "bg-rose-500/20 border border-rose-500/40 text-rose-400"
                : "bg-white/[0.04] border border-white/[0.07] text-white/35 hover:text-white/60"
            )}
          >
            {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <div className="flex-1 flex items-center bg-[#0d1117] border border-white/[0.08]
                          rounded-xl px-4 focus-within:border-[#4ade80]/40 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAnswer()}
              placeholder="Type your answer..."
              className="flex-1 bg-transparent py-2.5 text-sm text-white/80 outline-none
                         placeholder:text-white/20"
            />
          </div>

          <button
            onClick={sendAnswer}
            disabled={!input.trim() || isThinking}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
              input.trim() && !isThinking
                ? "bg-rose-500 hover:bg-rose-400 text-white active:scale-95"
                : "bg-white/[0.04] text-white/20 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-white/20 mt-2">
          Press Enter to answer · Question {questionCount} of ~6
        </p>
      </div>
    </div>
  );
}
