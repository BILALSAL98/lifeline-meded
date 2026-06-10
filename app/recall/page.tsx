"use client";

import { useState, useCallback } from "react";
import {
  Brain,
  BookOpen,
  Stethoscope,
  Download,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import CaptureInput from "@/components/recall/CaptureInput";
import GeneratedCards from "@/components/recall/GeneratedCards";
import CardEditor from "@/components/recall/CardEditor";
import StudyGuidePanel from "@/components/recall/StudyGuidePanel";
import PimpingMode from "@/components/recall/PimpingMode";
import {
  type FlashCard,
  type StudyGuide,
  type RecallStep,
  type SourceType,
  type WeaknessReason,
} from "@/lib/recall-types";
import { cn } from "@/lib/utils";

// ─── Demo data factory ────────────────────────────────────────────────────────

function makeDemoCards(topic: string, system: string): FlashCard[] {
  const now = new Date();
  return [
    {
      id: "c1",
      type: "basic",
      front: `What is the classic tetrad of ${topic}?`,
      back: `Massive proteinuria (>3.5 g/day), hypoalbuminemia, pitting edema, hyperlipidemia + lipiduria`,
      clozeText: undefined,
      explanation: "Memorize as P-HEL: Proteinuria, Hypoalbuminemia, Edema, Lipid abnormalities. The word 'massive' distinguishes nephrotic from nephritic.",
      tags: ["nephrology", "boards", "step1"],
      deck: `Step 1::${system}::${topic}`,
      topic,
      system,
      difficulty: 3,
      boardRelevance: "step1",
      sourceType: "qbank",
      sourceText: "",
      weaknessReason: undefined,
      weaknessCategory: undefined,
      exportedToAnki: false,
      createdAt: now,
    },
    {
      id: "c2",
      type: "cloze",
      front: `Nephrotic syndrome causes edema via {{c1::hypoalbuminemia}} which decreases {{c2::plasma oncotic pressure}}, leading to fluid shift into the {{c3::interstitium}}.`,
      back: "",
      clozeText: `Nephrotic syndrome causes edema via {{c1::hypoalbuminemia}} which decreases {{c2::plasma oncotic pressure}}, leading to fluid shift into the {{c3::interstitium}}.`,
      explanation: "Classic mechanism question. Know all three steps: protein loss → low albumin → low oncotic pressure → edema.",
      tags: ["mechanism", "nephrology"],
      deck: `Step 1::${system}::${topic}`,
      topic,
      system,
      difficulty: 2,
      boardRelevance: "both",
      sourceType: "qbank",
      sourceText: "",
      weaknessReason: "mechanism-unclear",
      weaknessCategory: "mechanism",
      exportedToAnki: false,
      createdAt: now,
    },
    {
      id: "c3",
      type: "vignette",
      front: `A 5-year-old boy develops periorbital edema and frothy urine 10 days after a URI. Urinalysis shows 4+ protein. Biopsy: normal LM, effaced foot processes on EM. Diagnosis?`,
      back: `Minimal Change Disease — most common nephrotic syndrome in children. Responds to steroids. Podocyte foot process effacement on EM is pathognomonic.`,
      clozeText: undefined,
      explanation: "Peds + post-URI + massive proteinuria + normal LM = Minimal Change Disease every time. The EM finding is the high-yield detail.",
      tags: ["pediatrics", "nephrotic", "step1", "high-yield"],
      deck: `Step 1::${system}::${topic}`,
      topic,
      system,
      difficulty: 3,
      boardRelevance: "step1",
      sourceType: "qbank",
      sourceText: "",
      weaknessReason: undefined,
      weaknessCategory: undefined,
      exportedToAnki: false,
      createdAt: now,
    },
    {
      id: "c4",
      type: "comparison",
      front: `Nephrotic vs. Nephritic Syndrome — key differences?`,
      back: `NEPHROTIC: Massive proteinuria, hypoalbuminemia, edema, hyperlipidemia, lipiduria. Normal BP.\n\nNEPHRITIC: Hematuria, RBC casts, hypertension, oliguria, mild proteinuria, ↓GFR.`,
      clozeText: undefined,
      explanation: "The most commonly confused pair. Nephrotic = protein lost. Nephritic = blood in urine + inflammation. On boards, 'frothy urine' = nephrotic; 'cola-colored urine' = nephritic.",
      tags: ["comparison", "nephrology", "boards"],
      deck: `Step 1::${system}::${topic}`,
      topic,
      system,
      difficulty: 4,
      boardRelevance: "both",
      sourceType: "qbank",
      sourceText: "",
      weaknessReason: "confused-diseases",
      weaknessCategory: "diagnostic",
      exportedToAnki: false,
      createdAt: now,
    },
    {
      id: "c5",
      type: "basic",
      front: `Why does nephrotic syndrome cause hyperlipidemia?`,
      back: `The liver upregulates lipoprotein synthesis (especially VLDL) to compensate for the oncotic deficit from albumin loss. Simultaneously, LPL activity is reduced → decreased lipoprotein clearance.`,
      clozeText: undefined,
      explanation: "Two-hit mechanism: ↑ hepatic lipoprotein synthesis + ↓ LPL activity = hyperlipidemia. High yield for Step 1 mechanism questions.",
      tags: ["mechanism", "hyperlipidemia", "step1"],
      deck: `Step 1::${system}::${topic}`,
      topic,
      system,
      difficulty: 4,
      boardRelevance: "step1",
      sourceType: "qbank",
      sourceText: "",
      weaknessReason: undefined,
      weaknessCategory: undefined,
      exportedToAnki: false,
      createdAt: now,
    },
  ];
}

function makeDemoGuide(topic: string, system: string): StudyGuide {
  return {
    id: "g1",
    topic,
    system,
    generatedAt: new Date(),
    relatedCardIds: ["c1", "c2", "c3", "c4", "c5"],
    sections: [
      {
        id: "s1",
        type: "concept",
        heading: "Core Concept",
        content: [
          `${topic} is defined by massive proteinuria (>3.5 g/day in adults) causing hypoalbuminemia and its downstream consequences.`,
          "Loss of oncotic pressure drives fluid from the vascular space into the interstitium, causing pitting edema.",
          "Hepatic compensation leads to hyperlipidemia and lipiduria — completing the classic tetrad.",
        ],
      },
      {
        id: "s2",
        type: "pathophysiology",
        heading: "Pathophysiology",
        content: [
          "Glomerular injury → loss of negative charge barrier or structural integrity → protein leaks through.",
          "Hypoalbuminemia → ↓ plasma oncotic pressure → Starling forces favor fluid extravasation.",
          "Liver compensates by ↑ VLDL synthesis + LPL is inhibited → hyperlipidemia.",
          "Loss of antithrombin III, protein C, and protein S → hypercoagulable state.",
        ],
      },
      {
        id: "s3",
        type: "presentation",
        heading: "Clinical Presentation",
        content: [
          "Periorbital edema (classic — especially in children, worse in the morning)",
          "Frothy/foamy urine (proteinuria)",
          "Dependent/pitting edema and ascites in severe cases",
          "Hyperlipidemia may cause xanthomas",
          "Hypercoagulability — DVT, renal vein thrombosis (especially membranous nephropathy)",
        ],
      },
      {
        id: "s4",
        type: "diagnostics",
        heading: "Diagnostics",
        content: [
          "Urinalysis: 3–4+ protein, lipiduria, oval fat bodies (Maltese cross appearance under polarized light)",
          "24-hour urine protein > 3.5 g/day (or spot urine protein:creatinine > 3.5)",
          "Serum albumin < 3.5 g/dL (often < 2.5 in severe cases)",
          "Lipid panel: elevated total cholesterol, LDL, VLDL",
          "Renal biopsy: needed to determine underlying cause and guide treatment",
        ],
      },
      {
        id: "s5",
        type: "management",
        heading: "Management",
        content: [
          "Treat the underlying cause first",
          "Minimal Change Disease: steroids (prednisone) — 80–90% respond",
          "ACE inhibitors/ARBs: reduce proteinuria regardless of cause",
          "Diuretics: for symptomatic edema management",
          "Statins: for hyperlipidemia",
          "Anticoagulation: if hypercoagulability complications occur",
        ],
      },
      {
        id: "s6",
        type: "traps",
        heading: "Board Traps",
        content: [
          "Nephrotic vs. Nephritic: 'frothy urine + edema' = nephrotic; 'cola urine + HTN + RBC casts' = nephritic",
          "Renal vein thrombosis is most associated with membranous nephropathy, not Minimal Change Disease",
          "Minimal Change Disease has NORMAL light microscopy — foot process effacement is EM only",
          "Children: assume Minimal Change until proven otherwise. Adults: membranous is most common primary cause.",
          "HIV-associated nephropathy causes collapsing FSGS, not Minimal Change",
        ],
      },
    ],
  };
}

// ─── Workflow steps UI ────────────────────────────────────────────────────────

const STEPS: { id: RecallStep; label: string; shortLabel: string }[] = [
  { id: "capture", label: "Capture", shortLabel: "1" },
  { id: "review", label: "Review Cards", shortLabel: "2" },
  { id: "choose-path", label: "Study", shortLabel: "3" },
];

function WorkflowProgress({
  current,
}: {
  current: RecallStep;
}) {
  const stepIndex = (s: RecallStep) => {
    const idx = STEPS.findIndex((x) => x.id === s);
    return idx === -1 ? 2 : idx;
  };
  const currentIndex = stepIndex(current);

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
              active
                ? "bg-[#4ade80]/15 border border-[#4ade80]/30 text-[#4ade80]"
                : done
                ? "text-white/40"
                : "text-white/20"
            )}>
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                active
                  ? "bg-[#4ade80] text-[#06080f]"
                  : done
                  ? "bg-[#4ade80]/30 text-[#4ade80]"
                  : "bg-white/[0.07] text-white/30"
              )}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.shortLabel}
              </div>
              <span className="text-sm font-medium hidden sm:block">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "w-8 h-px mx-1 transition-colors duration-300",
                i < currentIndex ? "bg-[#4ade80]/30" : "bg-white/[0.08]"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Path chooser ─────────────────────────────────────────────────────────────

function ChoosePath({
  cardCount,
  topic,
  onChoose,
}: {
  cardCount: number;
  topic: string;
  onChoose: (path: "anki" | "guide" | "pimp") => void;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-10 py-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#4ade80] mb-3">
          Session ready
        </p>
        <h2 className="text-3xl font-black text-white mb-2">
          {cardCount} cards generated · How do you want to study?
        </h2>
        <p className="text-white/40">
          Choose one pathway now — you can access the others any time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
        {/* Anki Review */}
        <button
          onClick={() => onChoose("anki")}
          className="group flex flex-col items-center gap-4 p-7 rounded-3xl
                     border border-[#60a5fa]/20 bg-[#60a5fa]/[0.04]
                     hover:bg-[#60a5fa]/[0.09] hover:border-[#60a5fa]/40
                     transition-all duration-300 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#60a5fa]/15 border border-[#60a5fa]/25
                          flex items-center justify-center
                          group-hover:scale-110 transition-transform duration-300">
            <Layers className="w-7 h-7 text-[#60a5fa]" />
          </div>
          <div>
            <div className="text-lg font-black text-white mb-1">Anki Review</div>
            <div className="text-sm text-white/45 leading-relaxed">
              Flash through your {cardCount} generated cards, export to Anki, or start spaced repetition now.
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#60a5fa]/50 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Study Guide */}
        <button
          onClick={() => onChoose("guide")}
          className="group flex flex-col items-center gap-4 p-7 rounded-3xl
                     border border-[#4ade80]/20 bg-[#4ade80]/[0.04]
                     hover:bg-[#4ade80]/[0.09] hover:border-[#4ade80]/40
                     transition-all duration-300 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#4ade80]/15 border border-[#4ade80]/25
                          flex items-center justify-center
                          group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="w-7 h-7 text-[#4ade80]" />
          </div>
          <div>
            <div className="text-lg font-black text-white mb-1">Study Guide</div>
            <div className="text-sm text-white/45 leading-relaxed">
              Read your AI-generated structured study guide on {topic}, organized by concept, presentation, and board traps.
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#4ade80]/50 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Pimp Mode */}
        <button
          onClick={() => onChoose("pimp")}
          className="group flex flex-col items-center gap-4 p-7 rounded-3xl
                     border border-rose-400/20 bg-rose-400/[0.04]
                     hover:bg-rose-400/[0.09] hover:border-rose-400/40
                     transition-all duration-300 text-center relative overflow-hidden"
        >
          <div className="absolute top-3 right-3">
            <span className="text-[9px] font-black uppercase tracking-widest
                             text-rose-400 bg-rose-400/10 border border-rose-400/20
                             px-2 py-0.5 rounded-full">
              ✦ Flagship
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-rose-400/15 border border-rose-400/25
                          flex items-center justify-center
                          group-hover:scale-110 transition-transform duration-300">
            <Stethoscope className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <div className="text-lg font-black text-white mb-1">AI Pimp Mode</div>
            <div className="text-sm text-white/45 leading-relaxed">
              Get questioned by an AI attending on {topic}. Rounds-style oral questioning with real-time scoring.
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-rose-400/50 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// ─── Export panel ─────────────────────────────────────────────────────────────

function ExportPanel({
  cards,
  onBack,
}: {
  cards: FlashCard[];
  onBack: () => void;
}) {
  const options = [
    {
      label: "Sync to Anki",
      description: "Push cards directly to your local Anki via AnkiConnect",
      icon: "🎴",
      color: "text-blue-400",
      border: "border-blue-400/25",
      bg: "bg-blue-400/[0.05]",
      action: "AnkiConnect required · Install the AnkiConnect add-on first",
    },
    {
      label: "Export .apkg",
      description: "Download an Anki deck file — import into Anki manually",
      icon: "📦",
      color: "text-amber-400",
      border: "border-amber-400/25",
      bg: "bg-amber-400/[0.05]",
      action: "Download .apkg",
    },
    {
      label: "Export CSV",
      description: "Spreadsheet format compatible with Anki, Quizlet, and Brainscape",
      icon: "📊",
      color: "text-green-400",
      border: "border-green-400/25",
      bg: "bg-green-400/[0.05]",
      action: "Download CSV",
    },
    {
      label: "Export PDF",
      description: "Printable study guide + flashcard reference sheet",
      icon: "📄",
      color: "text-rose-400",
      border: "border-rose-400/25",
      bg: "bg-rose-400/[0.05]",
      action: "Download PDF",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-white mb-1">Export {cards.length} Cards</h3>
        <p className="text-sm text-white/40">
          Choose your format. Cards include all content, tags, decks, and explanations.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => (
          <button
            key={opt.label}
            className={cn(
              "flex flex-col items-start gap-3 p-5 rounded-2xl border text-left",
              "hover:scale-[1.02] active:scale-[0.99] transition-all duration-200",
              opt.bg, opt.border
            )}
          >
            <div className="text-2xl">{opt.icon}</div>
            <div>
              <div className={cn("font-bold text-white mb-1", opt.color)}>{opt.label}</div>
              <p className="text-sm text-white/50 leading-relaxed">{opt.description}</p>
              <p className="text-xs text-white/25 mt-1">{opt.action}</p>
            </div>
          </button>
        ))}
      </div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to cards
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecallPage() {
  const [step, setStep] = useState<RecallStep>("capture");
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detectedTopic, setDetectedTopic] = useState("Nephrotic Syndrome");
  const [detectedSystem, setDetectedSystem] = useState("Renal");

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(
    async (text: string, sourceType: SourceType, weaknessReason?: WeaknessReason) => {
      setStep("generating");
      // Simulate AI generation delay
      await new Promise((r) => setTimeout(r, 2200));
      const newCards = makeDemoCards(detectedTopic, detectedSystem);
      const newGuide = makeDemoGuide(detectedTopic, detectedSystem);
      setCards(newCards);
      setGuide(newGuide);
      setSelectedIds(new Set(newCards.map((c) => c.id)));
      setStep("review");
    },
    [detectedTopic, detectedSystem]
  );

  const handleSaveCard = (updated: FlashCard) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditingCard(null);
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleDuplicateCard = (card: FlashCard) => {
    const copy: FlashCard = { ...card, id: crypto.randomUUID(), createdAt: new Date() };
    setCards((prev) => [...prev, copy]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handlePathChoice = (path: "anki" | "guide" | "pimp") => {
    if (path === "guide") setStep("study-guide");
    else if (path === "pimp") setStep("pimp-mode");
    else setStep("export");
  };

  const handlePimpComplete = (score: number, weaknesses: string[]) => {
    setStep("summary");
  };

  const handleReset = () => {
    setStep("capture");
    setCards([]);
    setGuide(null);
    setSelectedIds(new Set());
    setEditingCard(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#060810]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back + title */}
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:block">Dashboard</span>
              </a>
              <div className="w-px h-5 bg-white/[0.08]" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#4ade80] to-[#2dd4bf]
                                flex items-center justify-center">
                  <Brain className="w-4 h-4 text-[#06080f]" />
                </div>
                <span className="font-black text-white">Lifeline Recall</span>
              </div>
            </div>

            {/* Center: workflow steps */}
            {(step === "review" || step === "capture" || step === "choose-path") && (
              <WorkflowProgress current={step} />
            )}

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              {step !== "capture" && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl
                             text-sm text-white/40 hover:text-white/70
                             hover:bg-white/[0.05] transition-all duration-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">New session</span>
                </button>
              )}
              {step === "review" && cards.length > 0 && (
                <button
                  onClick={() => setStep("choose-path")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                             bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f]
                             text-sm font-bold transition-all duration-200 active:scale-95"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === "review" && (
                <button
                  onClick={() => setStep("export")}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl
                             bg-white/[0.04] border border-white/[0.07]
                             text-sm text-white/50 hover:text-white hover:bg-white/[0.08]
                             transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:block">Export</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Capture step ── */}
        {step === "capture" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                              bg-[#4ade80]/10 border border-[#4ade80]/20
                              text-xs font-bold text-[#4ade80] mb-4">
                <Sparkles className="w-3 h-3" />
                Learn → Capture → Retain
              </div>
              <h1 className="text-4xl font-black text-white mb-3">
                What are you studying today?
              </h1>
              <p className="text-white/50">
                Paste any medical content — question bank explanations, video transcripts,
                lecture notes, or textbook passages. AI generates flashcards and a
                personalized study guide instantly.
              </p>
            </div>
            <CaptureInput
              onGenerate={handleGenerate}
              isGenerating={false}
            />
          </div>
        )}

        {/* ── Generating step ── */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 text-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#4ade80] to-[#2dd4bf]
                              animate-pulse opacity-20 blur-xl" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#4ade80]/20 to-[#2dd4bf]/20
                              border border-[#4ade80]/30 flex items-center justify-center">
                <Brain className="w-10 h-10 text-[#4ade80]" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Generating your cards...</h2>
              <p className="text-white/40 max-w-sm">
                AI is analyzing your content, extracting high-yield concepts, and building your study guide.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {[
                { label: "Identifying key concepts", done: true },
                { label: "Generating flashcards", done: true },
                { label: "Building study guide", done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    done ? "bg-[#4ade80]/20" : "bg-white/[0.05]"
                  )}>
                    {done
                      ? <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
                      : <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                    }
                  </div>
                  <span className={cn("text-sm", done ? "text-white/60" : "text-white/30")}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Review step ── */}
        {step === "review" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cards (left + center) */}
            <div className="lg:col-span-2">
              <GeneratedCards
                cards={cards}
                onEdit={setEditingCard}
                onDelete={handleDeleteCard}
                onDuplicate={handleDuplicateCard}
                onToggleSelect={handleToggleSelect}
                selectedIds={selectedIds}
              />
            </div>

            {/* Study guide sidebar */}
            {guide && (
              <div className="lg:col-span-1">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
                  Generated Study Guide
                </p>
                <div className="bg-[#0d1117] rounded-2xl border border-white/[0.07] p-5 max-h-[600px] overflow-y-auto">
                  <h3 className="font-black text-white text-lg mb-1">{guide.topic}</h3>
                  <p className="text-xs text-[#4ade80] font-bold uppercase tracking-wider mb-4">{guide.system}</p>
                  {guide.sections.slice(0, 3).map((section) => (
                    <div key={section.id} className="mb-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                        {section.heading}
                      </p>
                      <ul className="space-y-1.5">
                        {section.content.slice(0, 3).map((item, i) => (
                          <li key={i} className="text-xs text-white/55 flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#4ade80]/50 mt-1.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <button
                    onClick={() => setStep("study-guide")}
                    className="text-xs text-[#4ade80] hover:text-white transition-colors font-medium"
                  >
                    View full study guide →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Choose path ── */}
        {step === "choose-path" && (
          <ChoosePath
            cardCount={cards.length}
            topic={detectedTopic}
            onChoose={handlePathChoice}
          />
        )}

        {/* ── Study guide ── */}
        {step === "study-guide" && guide && (
          <div>
            <button
              onClick={() => setStep("choose-path")}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <StudyGuidePanel guide={guide} cardCount={cards.length} />
          </div>
        )}

        {/* ── Pimp mode ── */}
        {step === "pimp-mode" && (
          <div>
            <div className="bg-[#0d1117] rounded-3xl border border-white/[0.07] overflow-hidden">
              <PimpingMode
                topic={detectedTopic}
                system={detectedSystem}
                onComplete={handlePimpComplete}
                onExit={() => setStep("choose-path")}
              />
            </div>
          </div>
        )}

        {/* ── Export ── */}
        {step === "export" && (
          <div className="max-w-2xl mx-auto">
            <ExportPanel cards={cards} onBack={() => setStep("review")} />
          </div>
        )}

        {/* ── Summary ── */}
        {step === "summary" && (
          <div className="flex flex-col items-center text-center gap-8 py-12">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#4ade80] to-[#2dd4bf]
                            flex items-center justify-center text-2xl
                            shadow-[0_0_40px_rgba(74,222,128,0.3)]">
              ✅
            </div>
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Study session complete</h2>
              <p className="text-white/50">
                {cards.length} cards saved · Study guide generated · AI pimping session done
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl
                           bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f]
                           font-bold text-sm transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                New Session
              </button>
              <button
                onClick={() => setStep("export")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl
                           bg-white/[0.04] border border-white/[0.07]
                           text-white/60 font-semibold text-sm
                           hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Cards
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Card editor modal */}
      {editingCard && (
        <CardEditor
          card={editingCard}
          onSave={handleSaveCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
