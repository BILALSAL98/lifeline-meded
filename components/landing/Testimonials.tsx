const testimonials = [
  {
    quote:
      "I went from consistently scoring in the 220s to cracking 260 on Step 1. The AI Tutor doesn't just tell you what's right — it makes you think through why you were wrong. That's the difference.",
    name: "Marcus T.",
    role: "MS3 · University of Michigan",
    score: "Step 1: 261",
    avatar: "MT",
    avatarColor: "from-blue-500 to-indigo-600",
  },
  {
    quote:
      "I tried UWorld, Anki, and Boards & Beyond all at once and my brain felt like mush. Lifeline brought everything into one place. The Knowledge Graph alone changed how I study — I actually see how everything connects now.",
    name: "Priya K.",
    role: "MS2 · Johns Hopkins",
    score: "Top 10% cohort",
    avatar: "PK",
    avatarColor: "from-emerald-500 to-teal-600",
  },
  {
    quote:
      "Lifeline Rounds™ was unlike anything I'd experienced. I walked into my internal medicine shelf feeling like I'd actually done rounds before — because I had. Just with AI instead of a real attending.",
    name: "James O.",
    role: "MS4 · Emory School of Medicine",
    score: "IM Shelf: 90th percentile",
    avatar: "JO",
    avatarColor: "from-rose-500 to-pink-600",
  },
  {
    quote:
      "As a DO student, I always felt underserved by existing platforms. Lifeline actually has a proper COMLEX section. The OMM content is high-yield and the Socratic AI doesn't treat osteopathic principles like an afterthought.",
    name: "Danielle R.",
    role: "OMS2 · PCOM",
    score: "COMLEX Level 1 prep",
    avatar: "DR",
    avatarColor: "from-violet-500 to-purple-600",
  },
  {
    quote:
      "The Study Copilot sent me an alert that I was about to forget my acid-base content. Four days later, it came up on a practice shelf. That prediction saved me points I didn't know I was about to lose.",
    name: "Sofia L.",
    role: "MS3 · Stanford Medicine",
    score: "Step 2 CK: 272",
    avatar: "SL",
    avatarColor: "from-amber-500 to-orange-600",
  },
  {
    quote:
      "I'm an IMG trying to match into a US program. Lifeline gave me the structure I needed for Step 1 and Step 2 prep without feeling like I was building my curriculum from scratch. Game changer.",
    name: "Ahmed F.",
    role: "IMG · Egypt · US Match Prep",
    score: "Step 1: 248",
    avatar: "AF",
    avatarColor: "from-cyan-500 to-blue-600",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-28 bg-surface-subtle overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div
          className="glow-orb absolute top-1/3 left-0 w-[500px] h-[500px] opacity-[0.06]"
          style={{ background: "radial-gradient(ellipse, #00C896, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="badge-pill inline-flex mb-6">Student Results</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
            The proof is in the{" "}
            <span className="gradient-text">scores.</span>
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/50">
            From preclinical foundations to board exams, students who learn with Lifeline perform at a different level.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="break-inside-avoid glass-card glass-card-hover rounded-3xl p-7 border border-white/[0.06] flex flex-col gap-5"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-accent-green text-sm">★</span>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-white/70 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{t.name}</div>
                  <div className="text-xs text-white/40 truncate">{t.role}</div>
                </div>
                <div className="flex-shrink-0 text-xs font-semibold text-accent-green bg-accent-green/10 border border-accent-green/20 px-2 py-1 rounded-lg whitespace-nowrap">
                  {t.score}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
