import { Network, Video, Compass, ArrowRight, Zap } from "lucide-react";

const features = [
  {
    id: "rounds",
    label: "Lifeline Rounds™",
    icon: "🏥",
    tagline: "Virtual Clinical Rounds — Powered by AI",
    description:
      "Enter a live simulated clinical environment. The AI acts as your attending, your senior resident, and your patient — simultaneously. Present patients, generate differentials, interpret labs, read imaging, and formulate treatment plans under real pressure.",
    details: [
      { label: "Role", value: "Attending • Senior Resident • Consultant • Patient" },
      { label: "Difficulty", value: "MS1 through Intern" },
      { label: "Scoring", value: "Clinical reasoning, efficiency, medical knowledge" },
    ],
    preview: {
      type: "rounds",
      title: "Morning Rounds — 7:32 AM",
      scenario:
        "Your attending turns to you: \"Tell me about the patient in Room 4.\"",
      action: "Present your patient",
    },
    gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    accentColor: "text-rose-400",
    badgeColor: "bg-rose-400/10 border-rose-400/20 text-rose-400",
    iconBg: "from-rose-500 to-pink-600",
  },
  {
    id: "knowledge-graph",
    label: "Knowledge Graph",
    icon: "🧠",
    tagline: "See How Medicine Connects",
    description:
      "A dynamic visual map showing how every concept in medicine relates. When you master a concept, its node lights up. Weak areas stay visible. Your Knowledge Graph becomes a living, personalized atlas of what you know.",
    details: [
      { label: "Nodes", value: "10,000+ medical concepts mapped" },
      { label: "Relations", value: "Disease ↔ Mechanism ↔ Treatment ↔ Drugs" },
      { label: "Insight", value: "Visual mastery tracking in real time" },
    ],
    preview: {
      type: "graph",
    },
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    accentColor: "text-cyan-400",
    badgeColor: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400",
    iconBg: "from-cyan-500 to-blue-600",
  },
  {
    id: "ai-video",
    label: "AI Video Generation",
    icon: "🎬",
    tagline: "Boards & Beyond — On Demand",
    description:
      "Type any medical topic. Get a full educational video with narration, animations, diagrams, and a summary slide — generated in minutes. Choose between a 2-minute rapid review, a full 10-minute lecture, or a deep-dive masterclass.",
    details: [
      { label: "Input", value: "Any topic, lecture PDF, or uploaded notes" },
      { label: "Output", value: "Script + voice + animation + summary slide" },
      { label: "Lengths", value: "2 min • 10 min • Deep Dive" },
    ],
    preview: {
      type: "video",
      topic: "Nephrotic Syndrome",
    },
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    accentColor: "text-violet-400",
    badgeColor: "bg-violet-400/10 border-violet-400/20 text-violet-400",
    iconBg: "from-violet-500 to-purple-600",
  },
  {
    id: "study-copilot",
    label: "Study Copilot",
    icon: "🧭",
    tagline: "Your AI Study Advisor",
    description:
      "A proactive AI advisor that monitors your entire performance profile — not just what you got wrong, but when you're likely to forget it. It surfaces the right review at the right time, so you're always a step ahead.",
    details: [
      { label: "Monitoring", value: "Performance, retention, weakness patterns" },
      { label: "Proactive", value: "Alerts before predicted forgetting occurs" },
      { label: "Guidance", value: "Daily personalized study plans" },
    ],
    preview: {
      type: "copilot",
      alerts: [
        { type: "warning", message: "Renal physiology: predicted forgetting in 4 days" },
        { type: "insight", message: "You consistently miss acid-base compensation questions" },
        { type: "plan", message: "Today: 20 min renal review → 10 flashcards → 3 questions" },
      ],
    },
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    accentColor: "text-amber-400",
    badgeColor: "bg-amber-400/10 border-amber-400/20 text-amber-400",
    iconBg: "from-amber-500 to-orange-600",
  },
];

function RoundsPreview() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-surface">
      <div className="bg-surface-subtle border-b border-white/[0.06] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs text-white/60 font-medium">Lifeline Rounds™ — Internal Medicine</span>
        </div>
        <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">MS3 Mode</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-sm flex-shrink-0">👨‍⚕️</div>
          <div className="bg-surface-elevated rounded-2xl rounded-tl-sm p-3 flex-1">
            <p className="text-xs text-rose-300 font-semibold mb-1">Dr. Patel — Attending</p>
            <p className="text-sm text-white/80">{"Room 4 is yours. 67F, admitted overnight. Walk me through your assessment."}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm flex-shrink-0">👤</div>
          <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-2xl rounded-tr-sm p-3 flex-1">
            <p className="text-xs text-accent-blue font-semibold mb-1">You — MS3</p>
            <p className="text-sm text-white/70">Patient is a 67-year-old female with a 2-day history of worsening dyspnea, orthopnea, and bilateral lower extremity edema...</p>
          </div>
        </div>
        <div className="bg-surface-elevated rounded-xl p-3 border border-white/[0.04]">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">AI Scoring — Real Time</p>
          <div className="flex gap-4">
            {[["Presentation", 88], ["Differentials", 72], ["Reasoning", 91]].map(([label, score]) => (
              <div key={label as string} className="flex-1">
                <div className="text-[10px] text-white/40 mb-1">{label}</div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-green to-accent-cyan rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="text-xs text-accent-green font-bold mt-1">{score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphPreview() {
  const nodes = [
    { id: "hf", label: "Heart Failure", x: 50, y: 50, size: 18, mastered: true, color: "#00C896" },
    { id: "raas", label: "RAAS", x: 20, y: 25, size: 12, mastered: true, color: "#06B6D4" },
    { id: "bnp", label: "BNP", x: 80, y: 20, size: 10, mastered: false, color: "#94A3B8" },
    { id: "diuretics", label: "Loop Diuretics", x: 75, y: 75, size: 12, mastered: true, color: "#00C896" },
    { id: "edema", label: "Pulm. Edema", x: 20, y: 78, size: 11, mastered: false, color: "#94A3B8" },
    { id: "echo", label: "Echo", x: 90, y: 50, size: 9, mastered: true, color: "#3B82F6" },
  ];
  const edges = [["hf","raas"],["hf","bnp"],["hf","diuretics"],["hf","edema"],["hf","echo"]];

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-surface">
      <div className="bg-surface-subtle border-b border-white/[0.06] px-5 py-3 flex items-center justify-between">
        <span className="text-xs text-white/60 font-medium">Knowledge Graph — Cardiology</span>
        <div className="flex items-center gap-3 text-[10px] text-white/30">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-green inline-block" /> Mastered</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/20 inline-block" /> Weak</span>
        </div>
      </div>
      <div className="p-4">
        <svg viewBox="0 0 100 100" className="w-full h-48">
          {edges.map(([a, b]) => {
            const na = nodes.find(n => n.id === a)!;
            const nb = nodes.find(n => n.id === b)!;
            return (
              <line key={`${a}-${b}`}
                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={na.mastered && nb.mastered ? "rgba(0,200,150,0.3)" : "rgba(255,255,255,0.08)"}
                strokeWidth="0.5"
              />
            );
          })}
          {nodes.map(node => (
            <g key={node.id} className="cursor-pointer">
              <circle cx={node.x} cy={node.y} r={node.size / 2}
                fill={node.mastered ? node.color : "rgba(255,255,255,0.1)"}
                stroke={node.mastered ? node.color : "rgba(255,255,255,0.2)"}
                strokeWidth="0.5"
                opacity={node.mastered ? 0.9 : 0.5}
              />
              {node.mastered && (
                <circle cx={node.x} cy={node.y} r={node.size / 2 + 3}
                  fill="none" stroke={node.color} strokeWidth="0.3" opacity="0.3" />
              )}
              <text x={node.x} y={node.y + node.size / 2 + 4}
                textAnchor="middle" fill="white" fontSize="3.5" opacity="0.6"
                fontFamily="Inter, sans-serif">
                {node.label}
              </text>
            </g>
          ))}
        </svg>
        <div className="mt-2 text-center text-xs text-white/30">
          4 of 6 concepts mastered in this cluster
        </div>
      </div>
    </div>
  );
}

function VideoPreview({ topic }: { topic: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-surface">
      <div className="bg-surface-subtle border-b border-white/[0.06] px-5 py-3">
        <span className="text-xs text-white/60 font-medium">AI Video Generator</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]">
          <span className="text-sm text-white/80 flex-1 font-medium">{topic}</span>
          <button className="text-xs text-violet-400 font-semibold">Generate →</button>
        </div>
        <div className="space-y-2">
          {[
            { label: "Script", status: "done", color: "bg-accent-green" },
            { label: "Voice Narration", status: "done", color: "bg-accent-green" },
            { label: "Animations", status: "generating", color: "bg-violet-400" },
            { label: "Summary Slide", status: "pending", color: "bg-white/20" },
          ].map(({ label, status, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${color} ${status === "generating" ? "animate-pulse" : ""}`} />
              <span className="text-sm text-white/60 flex-1">{label}</span>
              <span className={`text-xs ${status === "done" ? "text-accent-green" : status === "generating" ? "text-violet-400" : "text-white/20"}`}>
                {status === "done" ? "✓" : status === "generating" ? "..." : "—"}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          {["2 min", "10 min", "Deep Dive"].map((len) => (
            <button key={len}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${len === "10 min" ? "bg-violet-500/20 border border-violet-500/30 text-violet-400" : "bg-white/5 border border-white/10 text-white/40"}`}>
              {len}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CopilotPreview({ alerts }: { alerts: { type: string; message: string }[] }) {
  const icons: Record<string, string> = { warning: "⚠️", insight: "💡", plan: "📋" };
  const colors: Record<string, string> = {
    warning: "border-amber-500/20 bg-amber-500/5",
    insight: "border-blue-500/20 bg-blue-500/5",
    plan: "border-accent-green/20 bg-accent-green/5",
  };
  const textColors: Record<string, string> = {
    warning: "text-amber-400",
    insight: "text-blue-400",
    plan: "text-accent-green",
  };
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-surface">
      <div className="bg-surface-subtle border-b border-white/[0.06] px-5 py-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs text-white/60 font-medium">Study Copilot — Active</span>
      </div>
      <div className="p-4 space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${colors[alert.type]}`}>
            <span className="text-base flex-shrink-0">{icons[alert.type]}</span>
            <p className={`text-sm leading-relaxed ${textColors[alert.type]}`}>{alert.message}</p>
          </div>
        ))}
        <div className="pt-2 text-center">
          <button className="text-xs text-white/30 hover:text-white/60 transition-colors">
            View full study plan →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignatureFeatures() {
  return (
    <section id="features" className="relative py-28 bg-surface-subtle overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="section-divider absolute bottom-0 left-0 right-0" />
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-30"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,200,150,0.4), transparent)" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="badge-pill inline-flex mb-6">
            <Zap className="w-3 h-3" />
            Signature Features
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
            Features no one{" "}
            <span className="gradient-text">else has built.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white/50">
            These aren&apos;t incremental improvements. They&apos;re category-defining capabilities
            that didn&apos;t exist in medical education before Lifeline.
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={feature.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  !isEven ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* Content */}
                <div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-6 ${feature.badgeColor}`}>
                    <span>{feature.icon}</span>
                    {feature.label}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                    {feature.tagline}
                  </h3>
                  <p className="text-base text-white/55 leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  <div className="space-y-4 mb-8">
                    {feature.details.map(({ label, value }) => (
                      <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/30 sm:w-28 flex-shrink-0">
                          {label}
                        </span>
                        <span className="text-sm text-white/70">{value}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`group flex items-center gap-2 text-sm font-semibold ${feature.accentColor} hover:gap-3 transition-all duration-200`}>
                    Learn more about {feature.label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Preview */}
                <div>
                  {feature.id === "rounds" && <RoundsPreview />}
                  {feature.id === "knowledge-graph" && <GraphPreview />}
                  {feature.id === "ai-video" && <VideoPreview topic={feature.preview.topic || ""} />}
                  {feature.id === "study-copilot" && (
                    <CopilotPreview alerts={feature.preview.alerts || []} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
