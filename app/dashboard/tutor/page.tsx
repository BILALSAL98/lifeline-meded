"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Brain, Send, Mic, MicOff, Plus, Sparkles, RotateCcw, Settings2 } from "lucide-react";
import { logSession, awardXP, checkAndUpdateStreak } from "@/lib/store";
import { cn } from "@/lib/utils";

type TutorMode = "socratic" | "case" | "pimp" | "explain";
type Level = "MS1" | "MS2" | "Step 1" | "Step 2" | "Clinical" | "Resident";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  score?: "correct" | "partial" | "incorrect";
  timestamp: Date;
}

const MODES: { id: TutorMode; label: string; emoji: string; desc: string; color: string }[] = [
  { id: "socratic", label: "Socratic",      emoji: "🧠", desc: "Guided discovery",     color: "text-cyan-400" },
  { id: "case",     label: "Clinical Case", emoji: "🩺", desc: "Work through a case",  color: "text-rose-400" },
  { id: "pimp",     label: "Pimp Mode",     emoji: "⚡", desc: "Oral board style",     color: "text-amber-400" },
  { id: "explain",  label: "Explain",       emoji: "📖", desc: "Deep explanations",    color: "text-violet-400" },
];

const LEVELS: Level[] = ["MS1", "MS2", "Step 1", "Step 2", "Clinical", "Resident"];

const SUGGESTED = [
  "Heart Failure mechanisms",
  "Nephrotic vs Nephritic",
  "Acid-base disorders",
  "Aortic Dissection workup",
  "Pneumonia management",
  "Stroke syndromes",
  "DKA pathophysiology",
  "Sepsis criteria",
];

const OPENING_MESSAGES: Record<TutorMode, string> = {
  socratic: "Welcome. I'm your AI tutor — I teach through questions, not lectures. What are you studying today? Name a topic and I'll put you to work.",
  case:     "You're on rounds with me today. Tell me what system or disease you want to work up, and I'll give you a patient.",
  pimp:     "You're in the hot seat. Tell me your topic and level — I'll start pimping immediately. No warm-up.",
  explain:  "Tell me what you want explained. I'll break it down — mechanism first, then clinical application, then the board-relevant pearls.",
};

const modeStyles: Record<TutorMode, { border: string; glow: string; aiMsgBg: string; sendBg: string }> = {
  socratic: { border: "border-cyan-500/30",   glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",   aiMsgBg: "bg-[#0c1f2e]",   sendBg: "bg-cyan-500 hover:bg-cyan-400"   },
  case:     { border: "border-rose-500/30",   glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",   aiMsgBg: "bg-[#2d0f10]",   sendBg: "bg-rose-500 hover:bg-rose-400"   },
  pimp:     { border: "border-amber-500/30",  glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",  aiMsgBg: "bg-[#2a1a05]",   sendBg: "bg-amber-500 hover:bg-amber-400"  },
  explain:  { border: "border-violet-500/30", glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]",  aiMsgBg: "bg-[#1a0d2e]",   sendBg: "bg-violet-500 hover:bg-violet-400" },
};

export default function TutorPage() {
  const [mode, setMode]     = useState<TutorMode>("socratic");
  const [level, setLevel]   = useState<Level>("Step 1");
  const [topic, setTopic]   = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [micOn, setMicOn]   = useState(false);
  const [sessionStart]      = useState(Date.now());

  const chatRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Start session with opening message
  const startSession = useCallback((newMode?: TutorMode, newTopic?: string) => {
    const m = newMode || mode;
    const t = newTopic || topic;
    checkAndUpdateStreak();

    const opening: Message = {
      id: crypto.randomUUID(),
      role: "ai",
      content: OPENING_MESSAGES[m] + (t ? `\n\nLet's focus on: ${t}.` : ""),
      timestamp: new Date(),
    };
    setMessages([opening]);
  }, [mode, topic]);

  // Start automatically on mount
  useEffect(() => { startSession(); }, []); // eslint-disable-line

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          level,
          mode,
          topic,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      awardXP(8);
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "ai",
        content: "Connection issue. Make sure the app is running and your API key is configured in .env.local. In the meantime — what is the mechanism behind what you're studying? Try explaining it to me.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const resetSession = () => {
    const mins = Math.round((Date.now() - sessionStart) / 60000);
    if (messages.length > 2) {
      logSession({ type: "tutor", topic: topic || "General", durationMinutes: mins });
    }
    setMessages([]);
    setTimeout(() => startSession(), 100);
  };

  const s = modeStyles[mode];

  return (
    <div className="flex h-[calc(100vh-57px)] bg-[#060810]">

      {/* Sidebar */}
      <div className="hidden xl:flex flex-col w-64 bg-[#090c13] border-r border-white/[0.05] flex-shrink-0">
        <div className="p-4 border-b border-white/[0.05]">
          <button
            onClick={resetSession}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl
                       bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80]
                       text-sm font-semibold hover:bg-[#4ade80]/15 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
        </div>

        {/* Mode selector */}
        <div className="p-4 border-b border-white/[0.05]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Mode</p>
          <div className="space-y-1">
            {MODES.map(({ id, label, emoji, desc, color }) => (
              <button key={id}
                onClick={() => { setMode(id); startSession(id); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  mode === id
                    ? "bg-white/[0.07] text-white font-semibold"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                )}>
                <span>{emoji}</span>
                <div className="text-left">
                  <div className={cn("font-semibold text-xs", mode === id ? color : "")}>{label}</div>
                  <div className="text-[10px] text-white/25">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Suggested topics */}
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Quick Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.map((t) => (
              <button key={t}
                onClick={() => { setTopic(t); startSession(undefined, t); }}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]
                           text-[10px] text-white/45 hover:text-white hover:border-white/15
                           hover:bg-white/[0.08] transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className={cn("flex items-center gap-3 px-5 py-3 border-b border-white/[0.05] flex-shrink-0 bg-[#060810]", loading && s.glow)}>
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", s.border,
            "bg-gradient-to-br", mode === "socratic" ? "from-cyan-500/20" : mode === "case" ? "from-rose-500/20" : mode === "pimp" ? "from-amber-500/20" : "from-violet-500/20"
          )}>
            <Brain className={cn("w-4 h-4", MODES.find(m => m.id === mode)?.color)} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">
              AI Tutor — {MODES.find((m) => m.id === mode)?.label}
              {topic && <span className="text-white/40 font-normal ml-2">· {topic}</span>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/35">
              <div className={cn("w-1.5 h-1.5 rounded-full", loading ? "bg-amber-400 animate-pulse" : "bg-[#4ade80]")} />
              {loading ? "Thinking..." : "Ready"}
            </div>
          </div>

          {/* Level selector */}
          <div className="flex gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                  level === l ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                )}>
                {l}
              </button>
            ))}
          </div>

          <button onClick={resetSession}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07]
                       flex items-center justify-center text-white/35 hover:text-white transition-colors"
            title="New session">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center gap-1 px-5 py-2 border-b border-white/[0.04] bg-[#060810] overflow-x-auto flex-shrink-0">
          {MODES.map(({ id, label, emoji, color }) => (
            <button key={id} onClick={() => { setMode(id); startSession(id); }}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                mode === id
                  ? cn("bg-white/[0.08] border border-white/[0.1]", color)
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
              )}>
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="text-5xl">🧠</div>
            <div>
              <h3 className="text-xl font-black text-white mb-2">Choose a topic to begin</h3>
              <p className="text-white/40 text-sm">Select a topic from the sidebar or type below</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTED.map((t) => (
                <button key={t} onClick={() => { setTopic(t); startSession(undefined, t); }}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]
                             text-sm text-white/55 hover:text-white hover:border-white/20 transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
                <div className={cn("w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold",
                  msg.role === "ai"
                    ? "bg-gradient-to-br from-[#4ade80] to-[#2dd4bf] text-[#06080f]"
                    : "bg-[#60a5fa]/20 border border-[#60a5fa]/30 text-[#60a5fa]"
                )}>
                  {msg.role === "ai" ? <Brain className="w-4 h-4" /> : "B"}
                </div>
                <div className={cn("flex flex-col gap-1 max-w-[80%]", msg.role === "user" && "items-end")}>
                  <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "ai"
                      ? cn(s.aiMsgBg, "text-white/85 rounded-tl-sm border border-white/[0.06]")
                      : "bg-[#60a5fa]/12 border border-[#60a5fa]/20 text-white/75 rounded-tr-sm"
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4ade80] to-[#2dd4bf] flex-shrink-0 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-[#06080f]" />
                </div>
                <div className={cn("px-4 py-3 rounded-2xl rounded-tl-sm border border-white/[0.06]", s.aiMsgBg)}>
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 rounded-full bg-white/35 animate-bounce"
                        style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0 border-t border-white/[0.05] p-4 bg-[#060810]">
          <div className={cn("flex items-end gap-3 bg-[#0d1117] border rounded-2xl px-4 py-3 transition-all duration-200 focus-within:border-[#4ade80]/40", s.border)}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "pimp"    ? "Answer the question..." :
                mode === "case"    ? "Present your findings or ask about the patient..." :
                mode === "explain" ? "Ask me to explain anything..." :
                "Type your answer or ask a question..."
              }
              rows={1}
              className="flex-1 bg-transparent text-sm text-white/80 outline-none resize-none
                         placeholder:text-white/20 leading-relaxed max-h-32 min-h-[24px]"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <div className="flex items-center gap-2 pb-0.5 flex-shrink-0">
              <button onClick={() => setMicOn(!micOn)}
                className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                  micOn ? "bg-rose-500/20 border border-rose-500/30 text-rose-400" : "text-white/25 hover:text-white/60"
                )}>
                {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95",
                  input.trim() && !loading ? cn(s.sendBg, "text-white") : "bg-white/[0.04] text-white/20 cursor-not-allowed"
                )}>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-white/15 mt-2">
            Enter to send · Shift+Enter for new line ·{" "}
            {process.env.ANTHROPIC_API_KEY ? "Claude AI active" : "Add ANTHROPIC_API_KEY to .env.local for Claude"}
          </p>
        </div>
      </div>
    </div>
  );
}
