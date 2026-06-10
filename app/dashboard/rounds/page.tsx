"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Stethoscope, Send, ChevronRight, Trophy,
  FlaskConical, Scan, ClipboardList, ArrowLeft,
  CheckCircle2, XCircle, AlertCircle, RotateCcw,
  Heart, Brain, Activity,
} from "lucide-react";
import { ROUNDS_CASES, type ClinicalCase, type RoundsLevel, type RoundsMode } from "@/lib/rounds-cases";
import { logSession, awardXP, checkAndUpdateStreak } from "@/lib/store";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type RoundsPhase =
  | "select"          // Choose case + level
  | "briefing"        // Attending introduces the case
  | "active"          // Main rounds conversation
  | "labs"            // Student reviews labs (gated reveal)
  | "imaging"         // Student reviews imaging
  | "management"      // Student presents management plan
  | "debrief";        // Scoring and feedback

interface ChatMessage {
  id:        string;
  role:      "attending" | "student" | "system" | "patient" | "nurse";
  content:   string;
  phase?:    string;
  timestamp: Date;
}

interface ScoreCard {
  clinicalReasoning: number;
  efficiency:        number;
  communication:     number;
  medicalKnowledge:  number;
  total:             number;
  strengths:         string[];
  improvements:      string[];
  missedItems:       string[];
}

const LEVEL_COLORS: Record<RoundsLevel, string> = {
  MS1:      "text-green-400 bg-green-400/10 border-green-400/25",
  MS2:      "text-teal-400 bg-teal-400/10 border-teal-400/25",
  MS3:      "text-blue-400 bg-blue-400/10 border-blue-400/25",
  MS4:      "text-indigo-400 bg-indigo-400/10 border-indigo-400/25",
  Intern:   "text-amber-400 bg-amber-400/10 border-amber-400/25",
  Resident: "text-rose-400 bg-rose-400/10 border-rose-400/25",
};

const DIFFICULTY_LABEL = ["", "Beginner", "Easy", "Intermediate", "Advanced", "Expert"];
const DIFFICULTY_COLOR = ["", "text-[#4ade80]", "text-teal-400", "text-amber-400", "text-orange-400", "text-rose-400"];

// ─── Scoring helpers ────────────────────────────────────────────────────────

function scoreConversation(messages: ChatMessage[], cas: ClinicalCase): ScoreCard {
  const studentText = messages
    .filter((m) => m.role === "student")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  // Clinical reasoning: did they mention the right differentials?
  const ddxHits = cas.scoringCriteria.mustMention.filter((d) =>
    studentText.includes(d.toLowerCase())
  ).length;
  const clinicalReasoning = Math.min(100, 40 + ddxHits * 15);

  // Medical knowledge: did they mention teaching points?
  const tpHits = cas.teachingPoints.filter((tp) =>
    studentText.includes(tp.split(" ")[0].toLowerCase()) ||
    studentText.includes(tp.split(" ")[1]?.toLowerCase() || "")
  ).length;
  const medicalKnowledge = Math.min(100, 30 + tpHits * 12);

  // Efficiency: number of relevant questions asked vs. total messages
  const studentMsgs = messages.filter((m) => m.role === "student").length;
  const efficiency = studentMsgs > 0 ? Math.min(100, 60 + Math.max(0, 8 - studentMsgs) * 5) : 50;

  // Communication: did they use structured presentation?
  const hasStructure = studentText.includes("presents") || studentText.includes("history") || studentText.includes("exam");
  const communication = hasStructure ? Math.min(100, 70 + Math.floor(Math.random() * 20)) : 55;

  const total = Math.round((clinicalReasoning + efficiency + communication + medicalKnowledge) / 4);

  const missedDDx = cas.scoringCriteria.mustMention.filter((d) =>
    !studentText.includes(d.toLowerCase())
  );

  return {
    clinicalReasoning,
    efficiency,
    communication,
    medicalKnowledge,
    total,
    strengths: [
      ddxHits >= 2 ? "Strong differential diagnosis generation" : null,
      medicalKnowledge >= 60 ? "Good application of medical knowledge" : null,
      hasStructure ? "Organized clinical presentation" : null,
    ].filter(Boolean) as string[],
    improvements: [
      ddxHits < 2 ? "Broaden your differential — consider less obvious diagnoses" : null,
      medicalKnowledge < 60 ? "Review the underlying mechanisms for this condition" : null,
      !hasStructure ? "Practice structured patient presentation (CC, HPI, Exam, Assessment)" : null,
    ].filter(Boolean) as string[],
    missedItems: missedDDx,
  };
}

// ─── Case Selector ──────────────────────────────────────────────────────────

function CaseSelector({
  onStart,
}: {
  onStart: (cas: ClinicalCase, level: RoundsLevel, mode: RoundsMode) => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState<RoundsLevel>("MS3");
  const [selectedMode, setSelectedMode]   = useState<RoundsMode>("attending");

  const levels: RoundsLevel[] = ["MS1", "MS2", "MS3", "MS4", "Intern", "Resident"];
  const modes: { id: RoundsMode; label: string; desc: string; icon: string }[] = [
    { id: "attending", label: "Attending Mode", desc: "Full presentation. AI acts as attending. Expect to be pushed.", icon: "👨‍⚕️" },
    { id: "resident",  label: "Resident Mode",  desc: "Collaborative. More guidance. Still challenging.",               icon: "👩‍⚕️" },
    { id: "consult",   label: "Consult Mode",   desc: "Present a focused consult. AI acts as the specialist.",           icon: "📋" },
    { id: "emergency", label: "Emergency Mode", desc: "Rapid decisions under time pressure. High stakes.",               icon: "🚨" },
  ];

  const systemIcons: Record<string, string> = {
    Cardiology: "❤️", Renal: "🫘", Pulmonology: "🫁",
    "Infectious Disease": "🦠", Neurology: "🧠",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-400/10 border border-rose-400/20 text-rose-400 text-xs font-bold mb-5">
          <Stethoscope className="w-3.5 h-3.5" />
          Lifeline Rounds™
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
          Virtual Clinical Rounds
        </h1>
        <p className="text-white/50 max-w-xl mx-auto">
          Enter a live simulated clinical environment. The AI acts as your attending,
          your senior resident, and your patient — simultaneously.
        </p>
      </div>

      {/* Level + Mode selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* Level */}
        <div>
          <h3 className="text-sm font-bold text-white mb-4">Your Level</h3>
          <div className="grid grid-cols-3 gap-2">
            {levels.map((l) => (
              <button key={l} onClick={() => setSelectedLevel(l)}
                className={cn(
                  "py-3 rounded-xl border text-sm font-semibold transition-all",
                  selectedLevel === l ? LEVEL_COLORS[l] : "border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white hover:border-white/15"
                )}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div>
          <h3 className="text-sm font-bold text-white mb-4">Session Mode</h3>
          <div className="space-y-2">
            {modes.map(({ id, label, desc, icon }) => (
              <button key={id} onClick={() => setSelectedMode(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                  selectedMode === id
                    ? "border-rose-400/30 bg-rose-400/8 text-white"
                    : "border-white/[0.07] bg-white/[0.03] text-white/50 hover:text-white hover:border-white/15"
                )}>
                <span className="text-xl">{icon}</span>
                <div>
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-xs text-white/35">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Case cards */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4">
          Choose a Case
          <span className="text-white/30 font-normal ml-2">({ROUNDS_CASES.length} available)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROUNDS_CASES.map((cas) => {
            const isLevelOk = cas.levels.includes(selectedLevel);
            return (
              <div key={cas.id}
                className={cn(
                  "relative rounded-2xl border p-5 transition-all",
                  isLevelOk
                    ? "border-white/[0.08] bg-[#0d1117] hover:border-white/[0.18] hover:scale-[1.01] cursor-pointer"
                    : "border-white/[0.04] bg-white/[0.01] opacity-50 cursor-not-allowed"
                )}
                onClick={() => isLevelOk && onStart(cas, selectedLevel, selectedMode)}>

                {/* Difficulty badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{systemIcons[cas.system] || "🏥"}</span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-white/30">{cas.system}</div>
                      <div className="text-base font-black text-white leading-tight">{cas.title}</div>
                    </div>
                  </div>
                  <div className={cn("text-xs font-bold px-2 py-1 rounded-lg", DIFFICULTY_COLOR[cas.difficulty])}>
                    {DIFFICULTY_LABEL[cas.difficulty]}
                  </div>
                </div>

                {/* Chief complaint */}
                <div className="text-sm text-white/55 mb-4">
                  <span className="text-white/30 font-medium">CC:</span> {cas.chiefComplaint}
                </div>

                {/* Level badges */}
                <div className="flex flex-wrap gap-1.5">
                  {cas.levels.map((l) => (
                    <span key={l} className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", LEVEL_COLORS[l])}>
                      {l}
                    </span>
                  ))}
                </div>

                {isLevelOk && (
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Score bar ──────────────────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="text-white/50">{label}</span>
        <span className={cn("font-black", color)}>{value}</span>
      </div>
      <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: value >= 75 ? "#4ade80" : value >= 55 ? "#fbbf24" : "#f87171" }} />
      </div>
    </div>
  );
}

// ─── Main Rounds Interface ───────────────────────────────────────────────────

export default function RoundsPage() {
  const [phase, setPhase]       = useState<RoundsPhase>("select");
  const [activeCase, setActiveCase] = useState<ClinicalCase | null>(null);
  const [level, setLevel]       = useState<RoundsLevel>("MS3");
  const [mode, setMode]         = useState<RoundsMode>("attending");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [revealedLabs, setRevealedLabs]     = useState(false);
  const [revealedImaging, setRevealedImaging] = useState(false);
  const [scoreCard, setScoreCard] = useState<ScoreCard | null>(null);
  const [sessionStart] = useState(Date.now());

  const chatRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Start a case
  const startCase = useCallback((cas: ClinicalCase, l: RoundsLevel, m: RoundsMode) => {
    checkAndUpdateStreak();
    setActiveCase(cas);
    setLevel(l);
    setMode(m);
    setMessages([]);
    setRevealedLabs(false);
    setRevealedImaging(false);
    setScoreCard(null);
    setPhase("briefing");

    // Opening attending message
    setTimeout(() => {
      addMsg("attending", cas.attendingScript.opening);
      setPhase("active");
    }, 600);
  }, []);

  function addMsg(role: ChatMessage["role"], content: string) {
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
    }]);
  }

  async function sendMessage() {
    if (!input.trim() || loading || !activeCase) return;
    const text = input.trim();
    addMsg("student", text);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "student", content: text },
          ].map((m) => ({
            role: m.role === "attending" ? "assistant" : "user",
            content: m.content,
          })),
          level,
          mode: "case",
          topic: activeCase.title,
          systemPrompt: `You are Dr. Chen, a demanding but fair ${mode === "attending" ? "attending physician" : "senior resident"} conducting rounds on ${activeCase.title}.
The patient: ${activeCase.patient.age}yo ${activeCase.patient.sex}, CC: ${activeCase.chiefComplaint}.
Key facts available to you (but only reveal when asked or when clinically teaching): vitals, exam, labs, imaging.
Current phase: ${phase}.
Teaching focus: ${activeCase.teachingPoints[0]}.
Scoring criteria - must mention: ${activeCase.scoringCriteria.mustMention.join(", ")}.
Never give the full answer. Use Socratic questioning. Push deeper. Be brief (2-4 sentences max). Stay in character.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addMsg("attending", data.content);
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fallback: scripted attending responses
      const msgCount = messages.filter((m) => m.role === "student").length;
      const scripts = [
        activeCase.attendingScript.afterHPI,
        activeCase.attendingScript.afterExam,
        activeCase.attendingScript.afterLabs,
        activeCase.attendingScript.finalPimp,
        "Good. Let's wrap up — I want you to present your full assessment and plan in 60 seconds. Go.",
      ];
      addMsg("attending", scripts[Math.min(msgCount, scripts.length - 1)]);
    } finally {
      setLoading(false);
      awardXP(10);
      inputRef.current?.focus();
    }
  }

  function endRounds() {
    if (!activeCase) return;
    const score = scoreConversation(messages, activeCase);
    setScoreCard(score);
    const mins = Math.round((Date.now() - sessionStart) / 60000);
    logSession({ type: "tutor", topic: activeCase.title, durationMinutes: mins, score: score.total });
    awardXP(score.total);
    setPhase("debrief");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  // ── Case selector ──────────────────────────────────────────────────────────
  if (phase === "select") {
    return <CaseSelector onStart={startCase} />;
  }

  // ── Debrief / Score ────────────────────────────────────────────────────────
  if (phase === "debrief" && scoreCard && activeCase) {
    const totalColor = scoreCard.total >= 80 ? "#4ade80" : scoreCard.total >= 60 ? "#fbbf24" : "#f87171";
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">
            {scoreCard.total >= 80 ? "🏆" : scoreCard.total >= 60 ? "📋" : "📖"}
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Rounds Complete</h2>
          <p className="text-white/45">{activeCase.title} · {level}</p>
        </div>

        {/* Overall score */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 mb-6 text-center">
          <div className="text-6xl font-black mb-1" style={{ color: totalColor }}>{scoreCard.total}</div>
          <div className="text-white/40 text-sm">Overall Score</div>
          <div className="flex justify-center gap-2 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{
                backgroundColor: i < Math.round(scoreCard.total / 20) ? totalColor : "rgba(255,255,255,0.1)"
              }} />
            ))}
          </div>
        </div>

        {/* Score breakdown */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-5">Score Breakdown</h3>
          <ScoreBar label="Clinical Reasoning"  value={scoreCard.clinicalReasoning}  color={scoreCard.clinicalReasoning  >= 75 ? "text-[#4ade80]" : "text-amber-400"} />
          <ScoreBar label="Medical Knowledge"   value={scoreCard.medicalKnowledge}   color={scoreCard.medicalKnowledge   >= 75 ? "text-[#4ade80]" : "text-amber-400"} />
          <ScoreBar label="Communication"       value={scoreCard.communication}       color={scoreCard.communication       >= 75 ? "text-[#4ade80]" : "text-amber-400"} />
          <ScoreBar label="Efficiency"          value={scoreCard.efficiency}          color={scoreCard.efficiency          >= 75 ? "text-[#4ade80]" : "text-amber-400"} />
        </div>

        {/* Strengths + improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {scoreCard.strengths.length > 0 && (
            <div className="bg-[#4ade80]/5 border border-[#4ade80]/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3 text-[#4ade80] font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Strengths
              </div>
              {scoreCard.strengths.map((s) => (
                <p key={s} className="text-xs text-white/65 mb-2 leading-relaxed">• {s}</p>
              ))}
            </div>
          )}
          {scoreCard.improvements.length > 0 && (
            <div className="bg-amber-400/5 border border-amber-400/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold text-sm">
                <AlertCircle className="w-4 h-4" /> To Improve
              </div>
              {scoreCard.improvements.map((s) => (
                <p key={s} className="text-xs text-white/65 mb-2 leading-relaxed">• {s}</p>
              ))}
            </div>
          )}
        </div>

        {/* Teaching points */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-bold text-white mb-4">Key Teaching Points</h3>
          <div className="space-y-3">
            {activeCase.teachingPoints.map((tp, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center text-[10px] font-black text-[#4ade80] flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{tp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setPhase("select"); setMessages([]); }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all active:scale-95">
            <RotateCcw className="w-4 h-4" /> New Case
          </button>
          <button onClick={() => startCase(activeCase, level, mode)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 font-semibold text-sm hover:text-white transition-colors">
            Retry This Case
          </button>
        </div>
      </div>
    );
  }

  if (!activeCase) return null;

  // ── Active rounds ──────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-57px)]">

      {/* Left panel — case info */}
      <div className="hidden xl:flex flex-col w-72 bg-[#090c13] border-r border-white/[0.05] flex-shrink-0 overflow-y-auto">

        <div className="p-4 border-b border-white/[0.05]">
          <button onClick={() => setPhase("select")}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Exit Rounds
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-1">Patient</div>
          <div className="text-sm font-black text-white">{activeCase.patient.age}yo {activeCase.patient.sex}</div>
          <div className="text-xs text-white/45 mt-0.5">CC: {activeCase.chiefComplaint}</div>
          <div className="flex items-center gap-2 mt-3">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", LEVEL_COLORS[level])}>
              {level}
            </span>
            <span className={cn("text-[10px] font-bold", DIFFICULTY_COLOR[activeCase.difficulty])}>
              {DIFFICULTY_LABEL[activeCase.difficulty]}
            </span>
          </div>
        </div>

        {/* Gated labs */}
        <div className="p-4 border-b border-white/[0.05]">
          <button
            onClick={() => { setRevealedLabs(true); addMsg("nurse", "Labs resulted. I'll pull them up on the computer for you."); }}
            disabled={revealedLabs}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              revealedLabs
                ? "text-[#4ade80] bg-[#4ade80]/8 border border-[#4ade80]/20"
                : "text-white/55 bg-white/[0.04] border border-white/[0.07] hover:text-white hover:bg-white/[0.08]"
            )}>
            <FlaskConical className="w-4 h-4" />
            {revealedLabs ? "Labs Available ✓" : "Order Labs"}
          </button>
          {revealedLabs && (
            <div className="mt-3 space-y-1.5">
              {activeCase.labs.map((lab) => (
                <div key={lab.name} className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-xs text-white/55">{lab.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-bold",
                      lab.flag === "CR" ? "text-rose-400" :
                      lab.flag === "H"  ? "text-amber-400" :
                      lab.flag === "L"  ? "text-blue-400" : "text-white/60"
                    )}>
                      {lab.value} {lab.unit}
                    </span>
                    {lab.flag !== "N" && (
                      <span className={cn("text-[9px] font-black px-1 rounded",
                        lab.flag === "CR" ? "text-rose-400 bg-rose-400/10" :
                        lab.flag === "H"  ? "text-amber-400 bg-amber-400/10" : "text-blue-400 bg-blue-400/10"
                      )}>
                        {lab.flag}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gated imaging */}
        {activeCase.imaging.length > 0 && (
          <div className="p-4 border-b border-white/[0.05]">
            <button
              onClick={() => { setRevealedImaging(true); addMsg("nurse", "Radiology has the images ready. I'm pulling up the CXR now."); }}
              disabled={revealedImaging}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                revealedImaging
                  ? "text-violet-400 bg-violet-400/8 border border-violet-400/20"
                  : "text-white/55 bg-white/[0.04] border border-white/[0.07] hover:text-white hover:bg-white/[0.08]"
              )}>
              <Scan className="w-4 h-4" />
              {revealedImaging ? "Imaging Available ✓" : "Order Imaging"}
            </button>
            {revealedImaging && (
              <div className="mt-3 space-y-3">
                {activeCase.imaging.map((img) => (
                  <div key={img.modality} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1">{img.modality}</div>
                    <p className="text-[11px] text-white/55 leading-relaxed">{img.impression}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* End rounds */}
        <div className="p-4 mt-auto">
          <button onClick={endRounds}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                       bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all active:scale-95">
            <ClipboardList className="w-4 h-4" />
            End Rounds + Score
          </button>
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.05] bg-[#060810] flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-xl">
            👨‍⚕️
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">Dr. Chen — {mode === "attending" ? "Attending" : "Senior Resident"}</div>
            <div className="flex items-center gap-2 text-xs text-white/35">
              <div className={cn("w-1.5 h-1.5 rounded-full", loading ? "bg-amber-400 animate-pulse" : "bg-[#4ade80]")} />
              {loading ? "Thinking..." : `Lifeline Rounds™ · ${activeCase.system}`}
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => { setRevealedLabs(true); if (!revealedLabs) addMsg("nurse", "Labs resulted. I'll pull them up on the computer for you."); }}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                revealedLabs ? "text-[#4ade80] border-[#4ade80]/25 bg-[#4ade80]/8" : "text-white/40 border-white/[0.08] hover:text-white"
              )}>
              <FlaskConical className="w-3 h-3" /> Labs
            </button>
            {activeCase.imaging.length > 0 && (
              <button
                onClick={() => { setRevealedImaging(true); if (!revealedImaging) addMsg("nurse", "Radiology has the images ready."); }}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                  revealedImaging ? "text-violet-400 border-violet-400/25 bg-violet-400/8" : "text-white/40 border-white/[0.08] hover:text-white"
                )}>
                <Scan className="w-3 h-3" /> Imaging
              </button>
            )}
            <button onClick={endRounds}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-400/25 bg-rose-400/8 text-rose-400 hover:bg-rose-400/15 transition-all">
              <Trophy className="w-3 h-3" /> End & Score
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}
              className={cn("flex gap-3", msg.role === "student" && "flex-row-reverse")}>

              {/* Avatar */}
              <div className={cn("w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold",
                msg.role === "attending" ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white text-lg"
                : msg.role === "nurse"   ? "bg-teal-500/20 border border-teal-500/30 text-teal-400 text-base"
                : msg.role === "system"  ? "bg-white/[0.06] text-white/40 text-xs"
                : "bg-[#60a5fa]/20 border border-[#60a5fa]/30 text-[#60a5fa]"
              )}>
                {msg.role === "attending" ? "👨‍⚕️"
                : msg.role === "nurse"    ? "👩‍⚕️"
                : msg.role === "system"   ? "🏥"
                : level[0]}
              </div>

              <div className={cn("flex flex-col gap-1 max-w-[80%]", msg.role === "student" && "items-end")}>
                {msg.role !== "student" && (
                  <span className="text-[10px] text-white/25 ml-1 capitalize">
                    {msg.role === "attending" ? `Dr. Chen (${mode === "attending" ? "Attending" : "Senior Resident"})` : msg.role}
                  </span>
                )}
                <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "attending" ? "bg-[#1a0910] border border-rose-500/15 text-white/85 rounded-tl-sm"
                  : msg.role === "nurse"   ? "bg-teal-500/8 border border-teal-500/15 text-white/70 rounded-tl-sm italic"
                  : msg.role === "system"  ? "bg-white/[0.04] border border-white/[0.06] text-white/50 text-xs rounded-xl"
                  : "bg-[#60a5fa]/12 border border-[#60a5fa]/20 text-white/80 rounded-tr-sm"
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-white/20">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex-shrink-0 flex items-center justify-center text-lg">
                👨‍⚕️
              </div>
              <div className="bg-[#1a0910] border border-rose-500/15 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-4">
                  {[0,150,300].map((d) => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-white/[0.05] p-4 bg-[#060810]">
          <div className="flex items-end gap-3 bg-[#0d1117] border border-rose-500/20 rounded-2xl px-4 py-3 focus-within:border-rose-500/40 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Present your findings, answer the question, or request information..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-white/80 outline-none resize-none placeholder:text-white/20 leading-relaxed max-h-32"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                input.trim() && !loading
                  ? "bg-rose-500 hover:bg-rose-400 text-white active:scale-95"
                  : "bg-white/[0.04] text-white/20 cursor-not-allowed"
              )}>
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-white/15 mt-2">
            Enter to respond · Use clinical language · Order labs/imaging from the sidebar
          </p>
        </div>
      </div>
    </div>
  );
}
