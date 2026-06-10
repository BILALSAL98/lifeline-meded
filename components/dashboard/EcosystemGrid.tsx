import Link from "next/link";
import { BookOpen, Brain, HelpCircle, RefreshCw, Stethoscope, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ecosystems = [
  {
    href: "/dashboard/learn",
    icon: BookOpen,
    label: "Learn",
    sub: "System-based content",
    progress: 34,
    stat: "4 / 12 systems",
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconGradient: "from-emerald-400 to-teal-500",
    accent: "text-emerald-400",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.1)]",
  },
  {
    href: "/dashboard/tutor",
    icon: Brain,
    label: "AI Tutor",
    sub: "Socratic teaching AI",
    progress: 0,
    stat: "Start a session",
    gradient: "from-cyan-500/20 to-blue-500/10",
    iconGradient: "from-cyan-400 to-blue-500",
    accent: "text-cyan-400",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.1)]",
    featured: true,
  },
  {
    href: "/dashboard/practice",
    icon: HelpCircle,
    label: "Practice",
    sub: "Question bank",
    progress: 18,
    stat: "920 / 5,000 done",
    gradient: "from-blue-500/20 to-indigo-500/10",
    iconGradient: "from-blue-400 to-indigo-500",
    accent: "text-blue-400",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.1)]",
  },
  {
    href: "/dashboard/retention",
    icon: RefreshCw,
    label: "Retention",
    sub: "12 cards due now",
    progress: 72,
    stat: "344 cards total",
    gradient: "from-violet-500/20 to-purple-500/10",
    iconGradient: "from-violet-400 to-purple-500",
    accent: "text-violet-400",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.1)]",
    badge: "12 due",
  },
  {
    href: "/dashboard/clinical",
    icon: Stethoscope,
    label: "Clinical",
    sub: "Clerkship tools",
    progress: 0,
    stat: "MS3 · Start rotations",
    gradient: "from-rose-500/20 to-pink-500/10",
    iconGradient: "from-rose-400 to-pink-500",
    accent: "text-rose-400",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.1)]",
  },
  {
    href: "/dashboard/nexus",
    icon: Users,
    label: "Lifeline Nexus",
    sub: "Med student network",
    progress: 0,
    stat: "3 new connections",
    gradient: "from-orange-500/20 to-amber-500/10",
    iconGradient: "from-orange-400 to-amber-500",
    accent: "text-orange-400",
    glow: "shadow-[0_0_30px_rgba(251,146,60,0.1)]",
  },
];

export default function EcosystemGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-black text-white">Your Ecosystems</h2>
        <Link href="/dashboard/learn" className="text-sm text-white/35 hover:text-white/70 transition-colors">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {ecosystems.map((eco) => {
          const Icon = eco.icon;
          return (
            <Link
              key={eco.href}
              href={eco.href}
              className={cn(
                "group relative flex flex-col p-5 rounded-2xl border transition-all duration-300",
                "bg-[#0d1117] border-white/[0.06]",
                "hover:border-white/[0.14] hover:scale-[1.02] hover:-translate-y-0.5",
                eco.featured && "ring-1 ring-cyan-500/20"
              )}
            >
              {/* Hover glow */}
              <div className={cn(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                eco.glow
              )} />

              {/* Background gradient */}
              <div className={cn(
                "absolute inset-0 rounded-2xl opacity-40 pointer-events-none",
                `bg-gradient-to-br ${eco.gradient}`
              )} />

              {/* Badge */}
              {eco.badge && (
                <div className="absolute top-4 right-4">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                    eco.accent,
                    "bg-current/10 border border-current/25"
                  )}
                  style={{ backgroundColor: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.25)" }}>
                    {eco.badge}
                  </span>
                </div>
              )}
              {eco.featured && !eco.badge && (
                <div className="absolute top-4 right-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400
                                   bg-cyan-400/10 border border-cyan-400/25 px-2 py-0.5 rounded-full">
                    ✦ AI
                  </span>
                </div>
              )}

              <div className="relative">
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                  eco.iconGradient
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Text */}
                <div className="mb-4">
                  <div className="text-base font-black text-white mb-0.5">{eco.label}</div>
                  <div className="text-xs text-white/40">{eco.sub}</div>
                </div>

                {/* Progress bar */}
                {eco.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-white/25">Progress</span>
                      <span className={cn("text-[10px] font-bold", eco.accent)}>{eco.progress}%</span>
                    </div>
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r", eco.iconGradient)}
                        style={{ width: `${eco.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stat + Arrow */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/35">{eco.stat}</span>
                  <ArrowRight className={cn(
                    "w-4 h-4 transition-all duration-200",
                    eco.accent,
                    "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                  )} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
