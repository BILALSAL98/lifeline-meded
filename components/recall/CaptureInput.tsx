"use client";

import { useState } from "react";
import {
  ClipboardPaste,
  Video,
  HelpCircle,
  BookOpen,
  FileText,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { type SourceType, type WeaknessReason, WEAKNESS_REASON_LABELS } from "@/lib/recall-types";
import { cn } from "@/lib/utils";

interface CaptureInputProps {
  onGenerate: (text: string, sourceType: SourceType, weaknessReason?: WeaknessReason) => void;
  isGenerating: boolean;
}

const sourceTypes: { id: SourceType; label: string; icon: React.ElementType; hint: string }[] = [
  { id: "qbank", label: "Question Bank", icon: HelpCircle, hint: "Paste a question stem + explanation" },
  { id: "video", label: "Video / Lecture", icon: Video, hint: "Paste a transcript or subtitle text" },
  { id: "textbook", label: "Textbook", icon: BookOpen, hint: "Paste a passage or chapter section" },
  { id: "notes", label: "My Notes", icon: FileText, hint: "Paste your own study notes" },
  { id: "other", label: "Other", icon: ClipboardPaste, hint: "Paste any medical text" },
];

const exampleText = `A 12-year-old boy presents with periorbital edema and frothy urine 10 days after an upper respiratory infection. Urinalysis shows 4+ protein, no red blood cells. Serum albumin is 1.8 g/dL. Lipid panel shows total cholesterol of 320 mg/dL.

What is the most likely diagnosis?
→ Minimal Change Disease (most common cause of nephrotic syndrome in children)

Key Teaching Points:
• Nephrotic syndrome = massive proteinuria (>3.5 g/day), hypoalbuminemia, edema, hyperlipidemia
• Minimal Change Disease responds well to steroids
• Edema mechanism: loss of albumin → ↓ oncotic pressure → fluid shifts to interstitium
• Distinguish from nephritic syndrome: hematuria, RBC casts, HTN, ↓ GFR`;

export default function CaptureInput({ onGenerate, isGenerating }: CaptureInputProps) {
  const [text, setText] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("qbank");
  const [weaknessReason, setWeaknessReason] = useState<WeaknessReason | undefined>();
  const [showWeaknessPanel, setShowWeaknessPanel] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const isReady = wordCount >= 10;

  return (
    <div className="flex flex-col gap-8">
      {/* Source type selector */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
          What are you capturing?
        </p>
        <div className="flex flex-wrap gap-2">
          {sourceTypes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSourceType(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                sourceType === id
                  ? "bg-[#4ade80]/15 border border-[#4ade80]/40 text-[#4ade80]"
                  : "bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.07]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/30 mt-2.5 ml-1">
          {sourceTypes.find((s) => s.id === sourceType)?.hint}
        </p>
      </div>

      {/* Text input */}
      <div className="relative">
        <div className="absolute top-4 left-4 text-white/15 pointer-events-none text-sm leading-relaxed">
          {text.length === 0 && (
            <span>Paste or type your content here…</span>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder=""
          className="w-full bg-[#0d1117] border border-white/[0.08] rounded-2xl px-5 py-4
                     text-sm text-white/80 leading-relaxed resize-none
                     focus:outline-none focus:border-[#4ade80]/40 focus:ring-1
                     focus:ring-[#4ade80]/20 transition-all duration-200
                     placeholder:text-white/20 font-mono"
          spellCheck={false}
        />

        {/* Word count + quick-fill */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          {text.length === 0 && (
            <button
              onClick={() => setText(exampleText)}
              className="text-xs text-white/25 hover:text-[#4ade80] transition-colors"
            >
              Load example →
            </button>
          )}
          <span className={cn(
            "text-xs font-mono",
            wordCount === 0 ? "text-white/20" : isReady ? "text-[#4ade80]/70" : "text-amber-400/70"
          )}>
            {wordCount} words
          </span>
        </div>
      </div>

      {/* Weakness reason (optional) */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <button
          onClick={() => setShowWeaknessPanel(!showWeaknessPanel)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400/70" />
            <span className="text-sm font-medium text-white/60">
              Why are you making these cards?{" "}
              <span className="text-white/30 font-normal">(optional, improves tracking)</span>
            </span>
          </div>
          <ArrowRight
            className={cn(
              "w-4 h-4 text-white/25 transition-transform duration-200",
              showWeaknessPanel && "rotate-90"
            )}
          />
        </button>

        {showWeaknessPanel && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.entries(WEAKNESS_REASON_LABELS) as [WeaknessReason, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setWeaknessReason(weaknessReason === key ? undefined : key)}
                className={cn(
                  "text-left text-sm px-4 py-2.5 rounded-xl border transition-all duration-150",
                  weaknessReason === key
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                    : "border-white/[0.06] text-white/45 hover:text-white/70 hover:border-white/15"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Validate warning */}
      {text.length > 0 && !isReady && (
        <p className="text-xs text-amber-400/70 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          Add a bit more text for better card generation (at least 10 words)
        </p>
      )}

      {/* Generate button */}
      <button
        onClick={() => onGenerate(text, sourceType, weaknessReason)}
        disabled={!isReady || isGenerating}
        className={cn(
          "flex items-center justify-center gap-3 w-full py-4 rounded-2xl",
          "text-base font-bold transition-all duration-300",
          isReady && !isGenerating
            ? "bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.45)] active:scale-[0.98]"
            : "bg-white/[0.05] text-white/25 cursor-not-allowed border border-white/[0.06]"
        )}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-[#4ade80]/30 border-t-[#4ade80] rounded-full animate-spin" />
            Generating cards with AI...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Flashcards + Study Guide
          </>
        )}
      </button>

      {isReady && !isGenerating && (
        <p className="text-center text-xs text-white/25 -mt-4">
          AI will generate 3–8 cards + a structured study guide from your content
        </p>
      )}
    </div>
  );
}
