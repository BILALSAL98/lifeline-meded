import {
  BookOpen,
  Brain,
  HelpCircle,
  RefreshCw,
  Stethoscope,
  Users,
  ArrowRight,
} from "lucide-react";

const ecosystems = [
  {
    id: "learn",
    number: "01",
    icon: BookOpen,
    label: "Learn",
    tagline: "System-Based Mastery",
    description:
      "Deep-dive content organized by organ system. Pathophysiology, pharmacology, anatomy, histology — every topic built for board-level understanding, not surface memorization.",
    color: "from-emerald-400 to-teal-500",
    accentColor: "rgba(16,185,129,0.1)",
    borderColor: "rgba(16,185,129,0.2)",
    textColor: "text-emerald-400",
    bullets: ["12 organ systems", "3D anatomy models", "AI-annotated histology", "Lifeline Summaries™"],
    badge: "Content Library",
  },
  {
    id: "ai-tutor",
    number: "02",
    icon: Brain,
    label: "AI Tutor",
    tagline: "Your Personal Attending",
    description:
      "A conversational AI that teaches through the Socratic method. Not a chatbot — a mentor. It evaluates your reasoning, challenges your answers, and guides you to the right conclusion.",
    color: "from-cyan-400 to-blue-500",
    accentColor: "rgba(6,182,212,0.1)",
    borderColor: "rgba(6,182,212,0.2)",
    textColor: "text-cyan-400",
    bullets: ["Voice + text mode", "Clinical case walkthroughs", "Adaptive difficulty", "Weakness tracking"],
    badge: "Flagship Feature",
    featured: true,
  },
  {
    id: "practice",
    number: "03",
    icon: HelpCircle,
    label: "Practice",
    tagline: "UWorld-Grade Question Bank",
    description:
      "50,000+ rigorously curated questions with full explanations. AI-generated questions from your own notes. Deep analytics on accuracy, speed, and concept trends.",
    color: "from-blue-400 to-indigo-500",
    accentColor: "rgba(59,130,246,0.1)",
    borderColor: "rgba(59,130,246,0.2)",
    textColor: "text-blue-400",
    bullets: ["Multi-format questions", "Wrong answer analysis", "AI question generation", "Performance trends"],
    badge: "Question Bank",
  },
  {
    id: "retention",
    number: "04",
    icon: RefreshCw,
    label: "Retention Engine",
    tagline: "Forget About Forgetting",
    description:
      "Built-in spaced repetition. Auto-generated flashcards. A knowledge decay model that predicts when you're about to forget — and reviews before it happens.",
    color: "from-violet-400 to-purple-500",
    accentColor: "rgba(139,92,246,0.1)",
    borderColor: "rgba(139,92,246,0.2)",
    textColor: "text-violet-400",
    bullets: ["Spaced repetition scheduling", "Image occlusion cards", "Daily Lifeline Drill™", "Auto-generated flashcards"],
    badge: "Retention Science",
  },
  {
    id: "clinical",
    number: "05",
    icon: Stethoscope,
    label: "Clinical",
    tagline: "Clerkship Command Center",
    description:
      "From MS3 rotations through residency. Patient encounter logging, SOAP note training with AI grading, clinical pearls, and a virtual patient decision simulator.",
    color: "from-rose-400 to-pink-500",
    accentColor: "rgba(244,63,94,0.1)",
    borderColor: "rgba(244,63,94,0.2)",
    textColor: "text-rose-400",
    bullets: ["Lifeline Rounds™ simulator", "AI SOAP grading", "Encounter logging", "7 clerkship tracks"],
    badge: "Clinical Skills",
  },
  {
    id: "nexus",
    number: "06",
    icon: Users,
    label: "Lifeline Nexus",
    tagline: "LinkedIn for Medical Students",
    description:
      "A professional network built for your career stage. Research opportunities, mentorship matching, specialty groups, study teams, and residency guidance — all in one place.",
    color: "from-orange-400 to-amber-500",
    accentColor: "rgba(251,146,60,0.1)",
    borderColor: "rgba(251,146,60,0.2)",
    textColor: "text-orange-400",
    bullets: ["Mentor matching", "Study groups", "Research board", "Specialty communities"],
    badge: "Community",
  },
];

export default function Ecosystems() {
  return (
    <section id="platform" className="relative py-28 bg-navy">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-5 blur-3xl rounded-full"
          style={{ background: "radial-gradient(circle, #00C896, #3B82F6, transparent)" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="badge-pill inline-flex mb-6">
            <span>6 Integrated Ecosystems</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
            Everything you need.{" "}
            <span className="gradient-text">One platform.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white/50 leading-relaxed">
            Stop switching between Anki, UWorld, textbooks, and random YouTube videos.
            Lifeline is the complete operating system for medical education.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecosystems.map((eco) => {
            const Icon = eco.icon;
            return (
              <div
                key={eco.id}
                className={`relative group rounded-3xl p-8 transition-all duration-300 glass-card-hover glass-card cursor-pointer ${
                  eco.featured ? "md:col-span-2 lg:col-span-1 ring-1 ring-cyan-500/20" : ""
                }`}
                style={{
                  background: eco.featured
                    ? `linear-gradient(135deg, ${eco.accentColor}, rgba(255,255,255,0.02))`
                    : undefined,
                }}
              >
                {/* Featured badge */}
                {eco.featured && (
                  <div className="absolute top-6 right-6 text-xs font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full">
                    ✦ Flagship
                  </div>
                )}

                {/* Number + icon */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${eco.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-black text-white/[0.04] select-none">
                    {eco.number}
                  </span>
                </div>

                {/* Badge */}
                <div className="mb-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${eco.textColor}`}
                  >
                    {eco.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black text-white mb-1">{eco.label}</h3>
                <p className={`text-sm font-semibold mb-4 ${eco.textColor}`}>{eco.tagline}</p>

                {/* Description */}
                <p className="text-sm text-white/50 leading-relaxed mb-6">{eco.description}</p>

                {/* Bullets */}
                <ul className="space-y-2 mb-6">
                  {eco.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2 text-sm text-white/60">
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${eco.color} flex-shrink-0`}
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div
                  className={`flex items-center gap-2 text-sm font-semibold ${eco.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                >
                  Explore {eco.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
