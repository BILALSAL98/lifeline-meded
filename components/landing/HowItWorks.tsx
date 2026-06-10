const steps = [
  {
    number: "01",
    title: "Learn the concept",
    description:
      "Start in the Learn ecosystem. Read the pathophysiology. Study the mechanism. Understand the why — not just the what. AI annotations and 3D models bring the content to life.",
    icon: "📚",
    color: "from-emerald-400 to-teal-500",
  },
  {
    number: "02",
    title: "Practice until it clicks",
    description:
      "Hit the question bank. When you get something wrong, the AI Tutor doesn't just show you the answer — it walks you through the reasoning, Socratically, until you own it.",
    icon: "❓",
    color: "from-blue-400 to-indigo-500",
  },
  {
    number: "03",
    title: "Apply it clinically",
    description:
      "Enter Lifeline Rounds™. Present the patient with chest pain. Your AI attending pushes back on your differential. Real clinical pressure — zero real-world consequences.",
    icon: "🏥",
    color: "from-rose-400 to-pink-500",
  },
  {
    number: "04",
    title: "Never forget it",
    description:
      "The Retention Engine watches. Four days before you're predicted to forget, flashcards appear in your Daily Drill. Spaced repetition, automated — zero manual card-making.",
    icon: "🧠",
    color: "from-violet-400 to-purple-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-28 bg-navy overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="glow-orb absolute bottom-0 right-0 w-[600px] h-[400px] opacity-10"
          style={{ background: "radial-gradient(ellipse, #8B5CF6, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="badge-pill inline-flex mb-6">How It Works</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
            From first glance to{" "}
            <span className="gradient-text">board mastery.</span>
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/50">
            Every session follows the evidence-based learn → practice → apply → retain loop.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-14 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,200,150,0.3) 20%, rgba(0,200,150,0.3) 80%, transparent)" }} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col items-center text-center group">
                {/* Icon circle */}
                <div className="relative mb-8">
                  <div
                    className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-4xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-navy border-2 border-white/10 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white/50">{i + 1}</span>
                  </div>
                  {/* Glow on hover */}
                  <div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                  />
                </div>

                <div className="text-xs font-bold uppercase tracking-widest text-white/20 mb-3">
                  Step {step.number}
                </div>
                <h3 className="text-xl font-black text-white mb-3 leading-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA after steps */}
        <div className="text-center mt-20">
          <p className="text-white/40 text-sm mb-6">
            Designed around how the brain actually learns. Not how textbooks are organized.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold bg-accent-green hover:bg-accent-green-light text-navy transition-all duration-200 shadow-glow hover:shadow-glow-lg"
          >
            Start learning for free
          </a>
        </div>
      </div>
    </section>
  );
}
