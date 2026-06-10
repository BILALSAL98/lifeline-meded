"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, XCircle, Minus, Plus, ArrowRight, Layers, Download } from "lucide-react";
import { getDueCards, rateCard, readStore, logSession, downloadCSV, type SavedCard } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ratingConfig = [
  { id: "again" as const, label: "Again",  sub: "<1 min",  icon: XCircle,      color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/25" },
  { id: "hard"  as const, label: "Hard",   sub: "6 min",   icon: Minus,        color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/25" },
  { id: "good"  as const, label: "Good",   sub: "1 day",   icon: CheckCircle2, color: "text-[#4ade80]",  bg: "bg-[#4ade80]/10",  border: "border-[#4ade80]/25" },
  { id: "easy"  as const, label: "Easy",   sub: "4 days",  icon: CheckCircle2, color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/25" },
];

// Demo cards shown when user has no saved cards yet
const DEMO_CARDS: SavedCard[] = [
  { id: "d1", type: "basic", front: "What is the mechanism of edema in nephrotic syndrome?", back: "Massive proteinuria → hypoalbuminemia → ↓ plasma oncotic pressure → fluid shifts to interstitium (Starling forces). Liver compensates with ↑ lipoprotein synthesis → hyperlipidemia.", explanation: "Know all three steps: protein loss → low albumin → low oncotic pressure → edema.", tags: ["nephrology", "step1"], deck: "Step 1::Renal::Nephrotic Syndrome", topic: "Nephrotic Syndrome", system: "Renal", difficulty: 3, easeFactor: 2.5, intervalDays: 1, repetitions: 0, dueDate: new Date().toISOString(), lastReviewed: null, createdAt: new Date().toISOString() },
  { id: "d2", type: "cloze", front: "Nephrotic syndrome causes edema due to {{c1::hypoalbuminemia}}, which decreases {{c2::plasma oncotic pressure}}.", back: "", clozeText: "Nephrotic syndrome causes edema due to {{c1::hypoalbuminemia}}, which decreases {{c2::plasma oncotic pressure}}.", explanation: "The two blanks to know — hypoalbuminemia is the proximate cause; oncotic pressure is the mechanism.", tags: ["cloze", "nephrology"], deck: "Step 1::Renal", topic: "Nephrotic Syndrome", system: "Renal", difficulty: 2, easeFactor: 2.5, intervalDays: 1, repetitions: 0, dueDate: new Date().toISOString(), lastReviewed: null, createdAt: new Date().toISOString() },
  { id: "d3", type: "basic", front: "Minimal Change Disease — what does light microscopy show vs. electron microscopy?", back: "Light microscopy: NORMAL (that's the point). Electron microscopy: podocyte foot process effacement (pathognomonic). T-cell-mediated cytokine injury to podocytes.", explanation: "The most-tested MCD fact: normal LM + foot process effacement on EM.", tags: ["nephrology", "histology"], deck: "Step 1::Renal::Nephrotic Syndrome", topic: "Minimal Change Disease", system: "Renal", difficulty: 3, easeFactor: 2.5, intervalDays: 1, repetitions: 0, dueDate: new Date().toISOString(), lastReviewed: null, createdAt: new Date().toISOString() },
  { id: "d4", type: "basic", front: "Why does nephrotic syndrome cause hypercoagulability?", back: "Loss of antithrombin III, Protein C, and Protein S in urine → pro-thrombotic state → DVT, renal vein thrombosis. Most strongly associated with membranous nephropathy.", explanation: "Hypercoagulability is a complication question on boards — know WHICH proteins are lost.", tags: ["nephrology", "coagulation"], deck: "Step 1::Renal", topic: "Nephrotic Syndrome", system: "Renal", difficulty: 4, easeFactor: 2.5, intervalDays: 1, repetitions: 0, dueDate: new Date().toISOString(), lastReviewed: null, createdAt: new Date().toISOString() },
  { id: "d5", type: "basic", front: "First-line treatment for Minimal Change Disease?", back: "Corticosteroids (prednisone) — 85–90% respond. For frequent relapsers: cyclophosphamide or cyclosporine. For steroid-resistant: FSGS must be excluded on biopsy.", explanation: "MCD = steroids first. If no response in 8 weeks, reconsider diagnosis.", tags: ["nephrology", "treatment"], deck: "Step 1::Renal", topic: "Minimal Change Disease", system: "Renal", difficulty: 2, easeFactor: 2.5, intervalDays: 1, repetitions: 0, dueDate: new Date().toISOString(), lastReviewed: null, createdAt: new Date().toISOString() },
];

export default function RetentionPage() {
  const [cards, setCards]         = useState<SavedCard[]>([]);
  const [index, setIndex]         = useState(0);
  const [flipped, setFlipped]     = useState(false);
  const [done, setDone]           = useState(false);
  const [ratings, setRatings]     = useState<Record<string, string>>({});
  const [totalCards, setTotalCards] = useState(0);
  const [usingDemo, setUsingDemo]   = useState(false);
  const [sessionStart] = useState(Date.now());

  useEffect(() => {
    const store = readStore();
    setTotalCards(store.cards.length);
    const due = getDueCards(20);
    if (due.length > 0) {
      setCards(due);
      setUsingDemo(false);
    } else {
      setCards(DEMO_CARDS);
      setUsingDemo(true);
    }
  }, []);

  const card = cards[index];
  const progress = cards.length > 0 ? (index / cards.length) * 100 : 100;

  function handleRating(rating: "again" | "hard" | "good" | "easy") {
    if (!card) return;
    if (!usingDemo) rateCard(card.id, rating);
    setRatings((r) => ({ ...r, [card.id]: rating }));
    setFlipped(false);
    if (index + 1 >= cards.length) {
      const mins = Math.round((Date.now() - sessionStart) / 60000);
      logSession({ type: "retention", topic: "Review Session", durationMinutes: mins, cardsCount: cards.length });
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  // Session complete
  if (done) {
    const again = Object.values(ratings).filter((r) => r === "again").length;
    const good  = Object.values(ratings).filter((r) => r === "good" || r === "easy").length;
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center gap-8 px-4">
        <div className="w-16 h-16 rounded-3xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#4ade80]" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white mb-2">Session Complete 🎉</h2>
          <p className="text-white/50">{cards.length} cards reviewed · {good} remembered · {again} to retry</p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={() => { setIndex(0); setFlipped(false); setDone(false); setRatings({}); }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] font-bold text-sm transition-all active:scale-95">
            <RefreshCw className="w-4 h-4" /> Review Again
          </button>
          <Link href="/recall"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/60 font-semibold text-sm hover:text-white transition-colors">
            <Plus className="w-4 h-4" /> Add More Cards
          </Link>
          <button onClick={() => downloadCSV()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/60 font-semibold text-sm hover:text-white transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-60 bg-[#090c13] border-r border-white/[0.05] flex-shrink-0 p-4">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Due Now</p>
          <div className="bg-[#0d1117] rounded-xl p-4 border border-white/[0.07] text-center">
            <div className="text-3xl font-black text-[#4ade80]">{cards.length}</div>
            <div className="text-xs text-white/40">cards due</div>
          </div>
        </div>

        {usingDemo && (
          <div className="mb-4 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 leading-relaxed">
            📚 Showing demo cards. Use <strong>Lifeline Recall</strong> to create and save your own cards.
          </div>
        )}

        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Your Library</p>
          <div className="space-y-2">
            {[
              { label: "Total cards",  value: totalCards,            color: "text-white" },
              { label: "Due today",    value: cards.length,          color: "text-[#4ade80]" },
              { label: "Reviewed",     value: index,                 color: "text-blue-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-white/40">{label}</span>
                <span className={cn("text-sm font-black", color)}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <button onClick={() => downloadCSV()}
            className="w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]
                       text-xs text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2">
            <Download className="w-3 h-3" /> Export Cards (CSV)
          </button>
          <Link href="/recall"
            className="block w-full py-2 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20
                       text-xs text-[#4ade80] hover:bg-[#4ade80]/15 transition-colors text-center">
            + Create More Cards
          </Link>
        </div>
      </div>

      {/* Main card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">

        {/* Progress */}
        <div className="w-full max-w-xl mb-6">
          <div className="flex items-center justify-between text-xs text-white/30 mb-2">
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              {card?.deck || ""}
            </span>
            <span>{index + 1} of {cards.length}</span>
          </div>
          <div className="h-1 bg-white/[0.07] rounded-full">
            <div className="h-full bg-gradient-to-r from-[#4ade80] to-[#2dd4bf] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        {card && (
          <div
            onClick={() => setFlipped(!flipped)}
            className={cn(
              "w-full max-w-xl min-h-[260px] rounded-3xl border cursor-pointer",
              "transition-all duration-300 flex flex-col select-none",
              flipped
                ? "bg-[#0d1117] border-[#4ade80]/25 shadow-[0_0_40px_rgba(74,222,128,0.08)]"
                : "bg-[#0d1117] border-white/[0.08] hover:border-white/[0.15]"
            )}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
              <span className="text-xs font-bold uppercase tracking-widest text-white/25">
                {flipped ? "Answer" : "Question — click to flip"}
              </span>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border",
                flipped
                  ? "text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/25"
                  : "text-white/25 bg-white/[0.04] border-white/[0.08]"
              )}>
                {card.type}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 text-center">
              {card.type === "cloze" && !flipped ? (
                <p className="text-base text-white/80 leading-relaxed font-mono">
                  {(card.clozeText || card.front).replace(/\{\{c\d+::(.*?)\}\}/g, (_, ans) =>
                    `[${ans.replace(/./g, "_")}]`
                  )}
                </p>
              ) : (
                <p className={cn("text-base leading-relaxed whitespace-pre-wrap",
                  flipped ? "text-white/85" : "text-white/80 font-medium"
                )}>
                  {flipped
                    ? (card.type === "cloze"
                      ? (card.clozeText || card.front).replace(/\{\{c\d+::(.*?)\}\}/g, (_, ans) =>
                          `【${ans}】`
                        )
                      : card.back)
                    : card.front}
                </p>
              )}
            </div>

            {flipped && card.explanation && (
              <div className="px-5 pb-4 border-t border-white/[0.05] pt-3">
                <p className="text-xs text-white/35 leading-relaxed">💡 {card.explanation}</p>
              </div>
            )}

            {!flipped && (
              <div className="px-5 pb-4 text-center">
                <p className="text-xs text-white/20">Click to reveal answer</p>
              </div>
            )}
          </div>
        )}

        {/* Rating buttons */}
        {flipped && card && (
          <div className="w-full max-w-xl mt-6">
            <p className="text-xs text-white/25 text-center mb-3">How well did you remember this?</p>
            <div className="grid grid-cols-4 gap-3">
              {ratingConfig.map(({ id, label, sub, icon: Icon, color, bg, border }) => (
                <button key={id} onClick={() => handleRating(id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all duration-200 active:scale-95 hover:scale-[1.03]",
                    bg, border
                  )}>
                  <Icon className={cn("w-5 h-5", color)} />
                  <span className={cn("text-sm font-bold", color)}>{label}</span>
                  <span className="text-[10px] text-white/25">{sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
