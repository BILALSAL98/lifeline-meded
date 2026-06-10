"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, XCircle, Layers, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const drillItems = [
  {
    type: "question",
    text: "A patient with heart failure is started on spironolactone. What is the primary mechanism of action?",
    options: [
      "Blocks aldosterone receptors in the collecting duct",
      "Inhibits Na/K/2Cl cotransporter in the loop of Henle",
      "Blocks sodium channels in the distal tubule",
      "Inhibits carbonic anhydrase",
    ],
    correct: 0,
    explanation: "Spironolactone is a potassium-sparing diuretic that competitively antagonizes aldosterone receptors in the collecting duct, reducing Na⁺ reabsorption and K⁺ secretion.",
  },
  {
    type: "flashcard",
    front: "What is the Frank-Starling law?",
    back: "The heart increases stroke volume in response to increased ventricular filling (preload). Greater stretch → greater contraction force — up to a point.",
  },
  {
    type: "question",
    text: "Which of the following is the most common cause of nephrotic syndrome in adults?",
    options: [
      "Minimal Change Disease",
      "Focal Segmental Glomerulosclerosis",
      "Membranous Nephropathy",
      "IgA Nephropathy",
    ],
    correct: 2,
    explanation: "Membranous nephropathy is the most common primary cause of nephrotic syndrome in adults. It is associated with anti-PLA2R antibodies and presents with sub-epithelial deposits ('spike and dome').",
  },
];

export default function DailyDrill() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [done, setDone] = useState(false);

  const item = drillItems[currentIndex];
  const isQuestion = item?.type === "question";
  const total = drillItems.length;
  const progress = ((currentIndex) / total) * 100;

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === (item as typeof drillItems[0]).correct) setCorrect((c) => c + 1);
    setAnswered((a) => a + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setRevealed(false);
    if (currentIndex + 1 >= total) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (done) {
    const pct = Math.round((correct / total) * 100);
    const color = pct >= 80 ? "#4ade80" : pct >= 60 ? "#fbbf24" : "#f87171";
    return (
      <div className="bg-[#0d1117] rounded-2xl border border-white/[0.06] p-6 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#4ade80]/10 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-[#4ade80]" />
        </div>
        <div>
          <div className="text-2xl font-black" style={{ color }}>{pct}%</div>
          <div className="text-sm text-white/50 mt-1">{correct}/{total} correct today</div>
        </div>
        <p className="text-xs text-white/35">Daily drill complete! Cards added to your spaced repetition queue.</p>
        <Link
          href="/recall"
          className="flex items-center gap-2 text-sm text-[#4ade80] hover:text-white transition-colors font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Create more cards →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1117] rounded-2xl border border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20
                          flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#4ade80]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Daily Lifeline Drill</div>
            <div className="text-xs text-white/30">{currentIndex + 1} of {total} · {correct} correct</div>
          </div>
        </div>
        <div className="text-xs text-white/25 bg-white/[0.04] px-2 py-1 rounded-lg border border-white/[0.06]">
          {isQuestion ? "MCQ" : "Flashcard"}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/[0.05]">
        <div
          className="h-full bg-gradient-to-r from-[#4ade80] to-[#2dd4bf] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {isQuestion ? (
          <>
            <p className="text-sm text-white/80 leading-relaxed mb-5">{item.text}</p>
            <div className="space-y-2.5">
              {(item as typeof drillItems[0]).options.map((opt, i) => {
                const isCorrect = i === (item as typeof drillItems[0]).correct;
                const isSelected = selected === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200",
                      selected === null
                        ? "border-white/[0.07] bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                        : isSelected && isCorrect
                        ? "border-[#4ade80]/50 bg-[#4ade80]/10 text-[#4ade80]"
                        : isSelected && !isCorrect
                        ? "border-rose-400/50 bg-rose-400/10 text-rose-400"
                        : isCorrect
                        ? "border-[#4ade80]/30 bg-[#4ade80]/5 text-[#4ade80]/60"
                        : "border-white/[0.04] bg-white/[0.01] text-white/25"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5",
                        selected === null
                          ? "border-white/20 text-white/30"
                          : isCorrect
                          ? "border-[#4ade80]/50 text-[#4ade80]"
                          : isSelected
                          ? "border-rose-400/50 text-rose-400"
                          : "border-white/10 text-white/20"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </div>
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className={cn(
                "mt-4 p-4 rounded-xl border text-sm leading-relaxed",
                selected === (item as typeof drillItems[0]).correct
                  ? "bg-[#4ade80]/8 border-[#4ade80]/20 text-white/70"
                  : "bg-rose-400/8 border-rose-400/20 text-white/70"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {selected === (item as typeof drillItems[0]).correct
                    ? <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                    : <XCircle className="w-4 h-4 text-rose-400" />}
                  <span className="font-semibold text-white">
                    {selected === (item as typeof drillItems[0]).correct ? "Correct!" : "Not quite."}
                  </span>
                </div>
                {(item as typeof drillItems[0]).explanation}
              </div>
            )}
          </>
        ) : (
          /* Flashcard */
          <div>
            <div
              className={cn(
                "min-h-[120px] flex flex-col items-center justify-center text-center p-6 rounded-xl border cursor-pointer transition-all duration-300",
                revealed
                  ? "bg-[#4ade80]/8 border-[#4ade80]/20"
                  : "bg-white/[0.03] border-white/[0.07] hover:border-white/15"
              )}
              onClick={() => setRevealed(true)}
            >
              {!revealed ? (
                <>
                  <p className="text-sm text-white/80 mb-3">{item.front}</p>
                  <p className="text-xs text-white/30">Click to reveal answer</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-[#4ade80] font-bold uppercase tracking-widest mb-2">Answer</p>
                  <p className="text-sm text-white/80">{item.back}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {(selected !== null || (item.type === "flashcard" && revealed)) && (
        <div className="px-5 pb-5">
          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                       bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] font-bold text-sm
                       transition-all duration-200 active:scale-[0.98]"
          >
            {currentIndex + 1 >= total ? "Complete Drill" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}
