"use client";

import Link from "next/link";
import { ArrowRight, Brain, CheckCircle2, Play, Sparkles } from "lucide-react";
import { LifelineLogo } from "@/components/ui/LifelineLogo";

const highlights = [
  "AI Tutor that teaches, not tells",
  "Built for USMLE Step 1 & 2",
  "No credit card required",
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#060810]">

      {/* ── Aurora background ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none">

        {/* Base dark radial vignette */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 120% 80% at 50% 60%, #0a0f1e 0%, #060810 70%)" }} />

        {/* Aurora SVG streak */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            {/* Full rainbow gradient matching logo strand colors */}
            <linearGradient id="aurora-rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="transparent" />
              <stop offset="6%"   stopColor="#38bdf8" stopOpacity="0.0" />
              <stop offset="12%"  stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="22%"  stopColor="#a78bfa" stopOpacity="0.95" />
              <stop offset="32%"  stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="42%"  stopColor="#2dd4bf" stopOpacity="0.95" />
              <stop offset="50%"  stopColor="#4ade80" stopOpacity="1" />
              <stop offset="58%"  stopColor="#a3e635" stopOpacity="0.95" />
              <stop offset="67%"  stopColor="#fb923c" stopOpacity="0.9" />
              <stop offset="76%"  stopColor="#f87171" stopOpacity="0.95" />
              <stop offset="85%"  stopColor="#f472b6" stopOpacity="0.85" />
              <stop offset="93%"  stopColor="#c084fc" stopOpacity="0.0" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Bright core — slightly offset colors */}
            <linearGradient id="aurora-core" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="transparent" />
              <stop offset="10%"  stopColor="#bfdbfe" />
              <stop offset="22%"  stopColor="#ddd6fe" />
              <stop offset="34%"  stopColor="#a5f3fc" />
              <stop offset="46%"  stopColor="#bbf7d0" />
              <stop offset="55%"  stopColor="#d9f99d" />
              <stop offset="65%"  stopColor="#fed7aa" />
              <stop offset="76%"  stopColor="#fecaca" />
              <stop offset="86%"  stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Heavy outer glow */}
            <filter id="aurora-glow-heavy" x="-5%" y="-600%" width="110%" height="1300%">
              <feGaussianBlur stdDeviation="28" result="b1" />
              <feGaussianBlur stdDeviation="14" result="b2" in="SourceGraphic" />
              <feMerge>
                <feMergeNode in="b1" />
                <feMergeNode in="b1" />
                <feMergeNode in="b2" />
              </feMerge>
            </filter>

            {/* Soft mid glow */}
            <filter id="aurora-glow-soft" x="-5%" y="-400%" width="110%" height="900%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          {/*
            Three-layer streak: outer diffuse glow → mid halo → sharp core
            Path curves gently from lower-left to upper-right — same S-curve
            feel as the logo strands.
          */}

          {/* Layer 1 — thick diffuse rainbow glow */}
          <path
            d="M -80 680 C 260 580, 580 400, 900 430 S 1240 480, 1520 360"
            stroke="url(#aurora-rainbow)"
            strokeWidth="110"
            fill="none"
            filter="url(#aurora-glow-heavy)"
            opacity="0.38"
          />

          {/* Layer 2 — medium halo */}
          <path
            d="M -80 680 C 260 580, 580 400, 900 430 S 1240 480, 1520 360"
            stroke="url(#aurora-rainbow)"
            strokeWidth="18"
            fill="none"
            filter="url(#aurora-glow-soft)"
            opacity="0.65"
          />

          {/* Layer 3 — bright core line */}
          <path
            d="M -80 680 C 260 580, 580 400, 900 430 S 1240 480, 1520 360"
            stroke="url(#aurora-core)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.9"
          />

          {/* Subtle second streak — runs above the first, fainter */}
          <path
            d="M -60 500 C 300 420, 620 300, 920 330 S 1260 370, 1540 260"
            stroke="url(#aurora-rainbow)"
            strokeWidth="50"
            fill="none"
            filter="url(#aurora-glow-heavy)"
            opacity="0.12"
          />
        </svg>

        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* ── Hero content ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center
                      px-4 sm:px-6 lg:px-8 pt-28 pb-20 text-center">

        {/* Logo mark — large, centered above headline */}
        <div className="mb-10 animate-fade-in-up flex flex-col items-center gap-6">
          <LifelineLogo width={260} height={84} />
        </div>

        {/* Eyebrow badge */}
        <div className="badge-pill mb-8 animate-fade-in-up animate-delay-100">
          <Sparkles className="w-3 h-3" />
          Lifeline Rounds™ — Now in Beta
          <ArrowRight className="w-3 h-3" />
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl mx-auto text-5xl sm:text-6xl lg:text-[5.5rem]
                        font-black leading-[1.02] tracking-tight
                        animate-fade-in-up animate-delay-100">
          <span className="text-white">Your </span>
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #4ade80, #2dd4bf, #60a5fa, #a78bfa)",
              backgroundSize: "200% 100%",
            }}
          >
            Lifeline
          </span>
          <br />
          <span className="text-white">Through Medical School</span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-8 max-w-xl text-lg sm:text-xl text-white/55 leading-relaxed
                       font-light animate-fade-in-up animate-delay-200">
          The AI-powered operating system for medical education. Learn deeper,
          retain longer, reason better — from preclinical through boards and beyond.
        </p>

        {/* Highlights row */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8
                         animate-fade-in-up animate-delay-300">
          {highlights.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-white/45">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80] flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10
                         animate-fade-in-up animate-delay-400">
          <Link
            href="/signup"
            className="group flex items-center justify-center gap-2 px-8 py-4
                       rounded-2xl text-base font-semibold bg-[#22c55e]
                       hover:bg-[#4ade80] text-[#06080f] transition-all duration-300
                       shadow-[0_0_30px_rgba(34,197,94,0.35)]
                       hover:shadow-[0_0_50px_rgba(34,197,94,0.5)]
                       active:scale-95"
          >
            Get Early Access — Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            className="group flex items-center justify-center gap-3 px-8 py-4
                       rounded-2xl text-base font-semibold text-white
                       bg-white/[0.05] border border-white/10
                       hover:bg-white/[0.09] hover:border-white/20
                       transition-all duration-300 active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center
                            justify-center group-hover:bg-white/20 transition-colors">
              <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
            </div>
            Watch Demo
          </button>
        </div>

        <p className="mt-5 text-xs text-white/25 animate-fade-in-up animate-delay-500">
          No credit card required · Cancel anytime
        </p>

        {/* ── Dashboard preview ────────────────────────────────────────── */}
        <div className="relative mt-20 w-full max-w-5xl mx-auto animate-fade-in-up animate-delay-500">

          {/* Floating pills */}
          <div className="hidden lg:block absolute -left-8 top-10 z-20">
            <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl p-4
                            shadow-2xl flex items-center gap-3 animate-float-slow">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ade80] to-[#2dd4bf]
                              flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-[#06080f]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">AI Tutor Active</div>
                <div className="text-xs text-white/40">Socratic mode on</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block absolute -right-6 top-20 z-20">
            <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl p-4
                            shadow-2xl animate-float-medium">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                <span className="text-xs text-white/55">Study Copilot</span>
              </div>
              <p className="text-xs text-white font-medium max-w-[165px]">
                &ldquo;Review renal physiology — 4 days until predicted forgetting&rdquo;
              </p>
            </div>
          </div>

          <div className="hidden lg:block absolute -right-4 bottom-14 z-20">
            <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl px-4 py-3
                            shadow-2xl flex items-center gap-2 animate-float-fast">
              <span className="text-base">🔥</span>
              <div>
                <div className="text-xs font-bold text-white">42-day streak</div>
                <div className="text-xs text-white/40">+240 XP today</div>
              </div>
            </div>
          </div>

          {/* Window frame */}
          <div className="relative rounded-3xl overflow-hidden
                          border border-white/[0.07]
                          shadow-[0_40px_120px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)]">

            {/* Gradient border glow matching aurora colors */}
            <div className="absolute -inset-[1px] rounded-3xl pointer-events-none z-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(96,165,250,0.25), rgba(74,222,128,0.25), rgba(167,139,250,0.15))",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                padding: "1px",
              }}
            />

            <div className="relative z-10 bg-[#0d1117] rounded-3xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3 bg-[#090c13]
                              border-b border-white/[0.05]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#f87171]/60" />
                  <div className="w-3 h-3 rounded-full bg-[#fb923c]/60" />
                  <div className="w-3 h-3 rounded-full bg-[#4ade80]/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-5 rounded-md bg-white/[0.04] max-w-xs mx-auto
                                  flex items-center justify-center">
                    <span className="text-[10px] text-white/25">
                      app.lifeline-meded.com/tutor
                    </span>
                  </div>
                </div>
              </div>

              {/* App content */}
              <div className="flex h-[420px] sm:h-[500px]">

                {/* Sidebar */}
                <div className="hidden sm:flex flex-col w-56 bg-[#090c13]
                                border-r border-white/[0.05] p-4 gap-1">
                  {[
                    { icon: "📚", label: "Learn", active: false },
                    { icon: "🤖", label: "AI Tutor", active: true },
                    { icon: "❓", label: "Practice", active: false },
                    { icon: "🧠", label: "Retention", active: false },
                    { icon: "🏥", label: "Clinical", active: false },
                    { icon: "🌐", label: "Nexus", active: false },
                  ].map(({ icon, label, active }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                                  text-sm cursor-pointer transition-colors ${
                        active
                          ? "bg-[#4ade80]/10 text-[#4ade80] font-semibold"
                          : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="text-base">{icon}</span>
                      {label}
                    </div>
                  ))}

                  {/* User chip */}
                  <div className="mt-auto pt-4 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2.5 px-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br
                                      from-[#4ade80] to-[#2dd4bf]
                                      flex items-center justify-center
                                      text-[#06080f] text-xs font-bold">
                        A
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Alex M.</div>
                        <div className="text-[10px] text-white/30">MS2 · Step 1 Prep</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/[0.05]">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br
                                    from-[#4ade80] to-[#2dd4bf]
                                    flex items-center justify-center">
                      <Brain className="w-4 h-4 text-[#06080f]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">AI Tutor</div>
                      <div className="flex items-center gap-1.5 text-xs text-white/35">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                        Socratic Mode
                      </div>
                    </div>
                    <div className="ml-auto text-xs text-white/30 bg-white/[0.04]
                                    px-2 py-1 rounded-lg border border-white/[0.06]">
                      Step 1
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                    {/* AI message */}
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br
                                      from-[#4ade80] to-[#2dd4bf] flex-shrink-0
                                      flex items-center justify-center
                                      text-[#06080f] text-[10px] font-bold">
                        L
                      </div>
                      <div className="bg-[#111827] rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                        <p className="text-sm text-white/75 leading-relaxed">
                          A 58-year-old man presents with worsening dyspnea and
                          bilateral leg edema. What&apos;s your first step in
                          thinking through this?
                        </p>
                      </div>
                    </div>

                    {/* Student message */}
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="w-7 h-7 rounded-full bg-[#60a5fa]/20
                                      border border-[#60a5fa]/30 flex-shrink-0
                                      flex items-center justify-center
                                      text-[#60a5fa] text-[10px] font-bold">
                        A
                      </div>
                      <div className="bg-[#60a5fa]/10 border border-[#60a5fa]/20
                                      rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                        <p className="text-sm text-white/65 leading-relaxed">
                          I&apos;d consider heart failure given the dyspnea and
                          edema. Need to assess for JVD and listen for S3...
                        </p>
                      </div>
                    </div>

                    {/* AI follow-up */}
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br
                                      from-[#4ade80] to-[#2dd4bf] flex-shrink-0
                                      flex items-center justify-center
                                      text-[#06080f] text-[10px] font-bold">
                        L
                      </div>
                      <div className="bg-[#111827] rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                        <p className="text-sm text-[#4ade80] font-medium mb-1">
                          Excellent clinical thinking.
                        </p>
                        <p className="text-sm text-white/65 leading-relaxed">
                          Now — why does heart failure cause bilateral leg edema?
                          Walk me through the Frank-Starling mechanism first.
                        </p>
                      </div>
                    </div>

                    {/* Typing indicator */}
                    <div className="flex gap-3 flex-row-reverse items-end">
                      <div className="w-7 h-7 rounded-full bg-[#60a5fa]/20
                                      border border-[#60a5fa]/30 flex-shrink-0
                                      flex items-center justify-center
                                      text-[#60a5fa] text-[10px] font-bold">
                        A
                      </div>
                      <div className="bg-white/[0.04] border border-white/[0.07]
                                      rounded-2xl rounded-tr-sm px-4 py-3">
                        <div className="flex gap-1.5 items-center h-4">
                          {[0, 150, 300].map((d) => (
                            <div
                              key={d}
                              className="w-1.5 h-1.5 rounded-full bg-white/35
                                         animate-bounce"
                              style={{ animationDelay: `${d}ms` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="flex items-center gap-3 bg-white/[0.04]
                                  border border-white/[0.07] rounded-xl px-4 py-2.5">
                    <span className="flex-1 text-sm text-white/25">
                      Type your answer or ask a question...
                    </span>
                    <button className="w-7 h-7 rounded-lg bg-[#22c55e]
                                       flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-[#06080f]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Under-preview aurora reflection */}
          <div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-3/4 h-16
                        blur-2xl opacity-30 rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, #38bdf8, #a78bfa, #4ade80, #fb923c)",
            }}
          />
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{ background: "linear-gradient(to top, #060810, transparent)" }} />
    </section>
  );
}
