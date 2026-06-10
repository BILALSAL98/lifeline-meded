"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { LifelineLogo } from "@/components/ui/LifelineLogo";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "welcome",
    title: "Welcome to Lifeline.",
    sub: "You're about to study medicine in a completely different way.",
    content: null,
  },
  {
    id: "ecosystem",
    title: "Six ecosystems. One platform.",
    sub: "Every tool you need — built to work together.",
    content: [
      { icon: "📚", label: "Learn", desc: "System-based medical content" },
      { icon: "🤖", label: "AI Tutor", desc: "Socratic teaching AI" },
      { icon: "❓", label: "Practice", desc: "50,000+ question bank" },
      { icon: "🧠", label: "Retention", desc: "Spaced repetition engine" },
      { icon: "🏥", label: "Clinical", desc: "Clerkship & rounds tools" },
      { icon: "🌐", label: "Nexus", desc: "Med student community" },
    ],
  },
  {
    id: "recall",
    title: "Meet Lifeline Recall.",
    sub: "Paste any content. Get flashcards, a study guide, and AI pimping — instantly.",
    content: null,
  },
  {
    id: "ready",
    title: "You're ready.",
    sub: "Your 42-day streak starts today.",
    content: null,
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-[#060810] flex flex-col items-center justify-center px-4 py-12">
      {/* Fixed background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10 blur-3xl rounded-full"
          style={{ background: "radial-gradient(ellipse, #00C896, transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <LifelineLogo width={160} height={52} />
        </div>

        {/* Step indicator dots */}
        <div className="flex justify-center gap-2 mb-10">
          {steps.map((_, i) => (
            <div key={i} className={cn(
              "rounded-full transition-all duration-300",
              i === step ? "w-6 h-2 bg-[#4ade80]" :
              i < step ? "w-2 h-2 bg-[#4ade80]/50" : "w-2 h-2 bg-white/[0.12]"
            )} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-3xl p-8 text-center">
          {/* Icon for each step */}
          <div className="flex justify-center mb-6">
            {step === 0 && <LifelineLogo markOnly width={60} height={74} />}
            {step === 1 && <div className="text-5xl">🎯</div>}
            {step === 2 && <div className="w-16 h-16 rounded-2xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center text-3xl">🧠</div>}
            {step === 3 && <div className="w-16 h-16 rounded-2xl bg-[#4ade80]/15 flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-[#4ade80]" /></div>}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">{current.title}</h2>
          <p className="text-white/50 leading-relaxed mb-8">{current.sub}</p>

          {/* Ecosystem grid */}
          {current.content && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {(current.content as { icon: string; label: string; desc: string }[]).map(({ icon, label, desc }) => (
                <div key={label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-left">
                  <div className="text-xl mb-1.5">{icon}</div>
                  <div className="text-xs font-bold text-white">{label}</div>
                  <div className="text-[10px] text-white/35 mt-0.5 leading-snug">{desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          {isLast ? (
            <Link href="/dashboard"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl
                         bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] font-bold text-base
                         transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.25)]
                         hover:shadow-[0_0_35px_rgba(34,197,94,0.4)] active:scale-[0.98]">
              <Sparkles className="w-5 h-5" />
              Enter Lifeline →
            </Link>
          ) : (
            <button onClick={() => setStep((s) => s + 1)}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl
                         bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] font-bold text-base
                         transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.2)]
                         hover:shadow-[0_0_30px_rgba(34,197,94,0.35)] active:scale-[0.98]">
              {step === 0 ? "Let's go" : "Next"}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)}
              className="mt-4 text-sm text-white/25 hover:text-white/50 transition-colors">
              ← Back
            </button>
          )}
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          {step + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
