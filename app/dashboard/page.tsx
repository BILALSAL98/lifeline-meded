import Link from "next/link";
import { ArrowRight, Flame, Target, Stethoscope, Sparkles } from "lucide-react";
import StatCards from "@/components/dashboard/StatCards";
import DailyDrill from "@/components/dashboard/DailyDrill";
import StudyCopilotPanel from "@/components/dashboard/StudyCopilotPanel";
import EcosystemGrid from "@/components/dashboard/EcosystemGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DashboardInit from "@/components/dashboard/DashboardInit";

function BoardCountdown() {
  const daysLeft = 187;
  const totalDays = 365;
  const progress = Math.round(((totalDays - daysLeft) / totalDays) * 100);

  return (
    <div className="bg-gradient-to-br from-[#0d1117] to-[#111827] rounded-2xl
                    border border-white/[0.06] p-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl rounded-full
                      bg-gradient-to-br from-[#4ade80] to-[#2dd4bf] pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-[#4ade80]" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/40">
            Board Exam Countdown
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-black text-white">{daysLeft}</span>
          <span className="text-white/40 text-sm">days to Step 1</span>
        </div>
        <p className="text-xs text-white/30 mb-4">Target: June 15, 2025</p>
        <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-[#4ade80] to-[#2dd4bf] rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-white/25">
          <span>Start</span>
          <span className="text-[#4ade80] font-semibold">{progress}% through prep</span>
          <span>Exam</span>
        </div>
      </div>
    </div>
  );
}

function LifelineRoundsBanner() {
  return (
    <div className="relative rounded-2xl border border-rose-400/20 bg-gradient-to-r
                    from-rose-500/10 via-rose-400/5 to-transparent overflow-hidden p-5">
      <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10 pointer-events-none
                      bg-gradient-to-l from-rose-400 to-transparent" />
      <div className="relative flex items-center gap-4">
        <div className="text-3xl flex-shrink-0">👨‍⚕️</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-rose-400">
              Lifeline Rounds™
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-rose-400
                             bg-rose-400/10 border border-rose-400/25 px-1.5 py-0.5 rounded-full">
              New
            </span>
          </div>
          <p className="text-sm text-white/70 leading-snug">
            Start virtual rounds. Your AI attending is ready to pimp you on today&apos;s topic.
          </p>
        </div>
        <Link
          href="/dashboard/rounds"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-shrink-0
                     bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm
                     transition-all duration-200 active:scale-95"
        >
          Begin
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function KnowledgeGraphMini() {
  // Simplified SVG knowledge graph preview
  const nodes = [
    { x: 50, y: 50, r: 8, label: "Heart Failure", mastered: true, color: "#4ade80" },
    { x: 20, y: 25, r: 5, label: "RAAS", mastered: true, color: "#2dd4bf" },
    { x: 80, y: 20, r: 4, label: "BNP", mastered: false, color: "#475569" },
    { x: 75, y: 75, r: 6, label: "Diuretics", mastered: true, color: "#60a5fa" },
    { x: 20, y: 75, r: 5, label: "Edema", mastered: false, color: "#475569" },
    { x: 88, y: 50, r: 4, label: "Echo", mastered: true, color: "#a78bfa" },
  ];
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[1,2]];

  return (
    <div className="bg-[#0d1117] rounded-2xl border border-white/[0.06] p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-bold text-white">Knowledge Graph</div>
          <div className="text-xs text-white/30">Cardiology · 4 of 6 mastered</div>
        </div>
        <Link href="/dashboard/graph" className="text-xs text-[#4ade80] hover:text-white transition-colors font-medium">
          Explore →
        </Link>
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-40">
        {edges.map(([a, b], i) => (
          <line key={i}
            x1={nodes[a].x} y1={nodes[a].y}
            x2={nodes[b].x} y2={nodes[b].y}
            stroke={nodes[a].mastered && nodes[b].mastered ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.05)"}
            strokeWidth="0.6"
          />
        ))}
        {nodes.map((node, i) => (
          <g key={i}>
            {node.mastered && (
              <circle cx={node.x} cy={node.y} r={node.r + 3}
                fill="none" stroke={node.color} strokeWidth="0.4" opacity="0.3" />
            )}
            <circle cx={node.x} cy={node.y} r={node.r}
              fill={node.mastered ? node.color : "#1e293b"}
              stroke={node.mastered ? node.color : "#334155"}
              strokeWidth="0.5"
              opacity={node.mastered ? 0.9 : 0.6}
            />
            <text x={node.x} y={node.y + node.r + 4.5}
              textAnchor="middle" fill="white" fontSize="4" opacity="0.5"
              fontFamily="Inter, sans-serif">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl mx-auto">

      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-orange-400" fill="currentColor" />
            <span className="text-sm font-bold text-orange-400">42-day streak</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {greeting}, Bilal 👋
          </h1>
          <p className="text-white/45 mt-1 text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} ·
            You have 12 cards due and 3 Copilot alerts.
          </p>
        </div>

        {/* Quick action */}
        <Link
          href="/recall"
          className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-2xl flex-shrink-0
                     bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] font-bold text-sm
                     transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.25)]
                     hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          Lifeline Recall
        </Link>
      </div>

      {/* Stat cards */}
      <StatCards />

      {/* Lifeline Rounds banner */}
      <LifelineRoundsBanner />

      {/* Two-column: Daily Drill + Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyDrill />
        <StudyCopilotPanel />
      </div>

      {/* Ecosystem grid */}
      <EcosystemGrid />

      {/* Bottom row: Activity + Graph + Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-4">
          <KnowledgeGraphMini />
          <BoardCountdown />
        </div>
      </div>

    </div>
  );
}
