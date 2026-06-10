"use client";

import { useEffect, useState } from "react";
import { Flame, Star, Brain, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { readStore, getDueCards } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Stat {
  label: string; value: string; sub: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
  trend: "up" | "down" | "flat"; trendValue: string;
}

const TrendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus };
const trendColor = { up: "text-[#4ade80]", down: "text-rose-400", flat: "text-white/30" };

export default function StatCards() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "Study Streak", value: "0", sub: "days", icon: Flame, iconBg: "bg-orange-500/15", iconColor: "text-orange-400", trend: "flat", trendValue: "Keep going!" },
    { label: "Total XP",     value: "0",  sub: "points", icon: Star, iconBg: "bg-[#4ade80]/15", iconColor: "text-[#4ade80]", trend: "flat", trendValue: "+0 today" },
    { label: "Cards Due",    value: "0",  sub: "for review", icon: Brain, iconBg: "bg-[#60a5fa]/15", iconColor: "text-[#60a5fa]", trend: "flat", trendValue: "Check retention" },
    { label: "Questions",    value: "0",  sub: "answered", icon: Clock, iconBg: "bg-violet-400/15", iconColor: "text-violet-400", trend: "flat", trendValue: "Keep practicing" },
  ]);

  useEffect(() => {
    const store = readStore();
    const s = store.stats;
    const dueCount = getDueCards(99).length;

    setStats([
      {
        label: "Study Streak", value: String(s.streakDays || 0), sub: "days",
        icon: Flame, iconBg: "bg-orange-500/15", iconColor: "text-orange-400",
        trend: s.streakDays > 0 ? "up" : "flat",
        trendValue: s.streakDays > 0 ? `${s.streakDays} day streak!` : "Start today",
      },
      {
        label: "Total XP", value: s.xp.toLocaleString(), sub: "points",
        icon: Star, iconBg: "bg-[#4ade80]/15", iconColor: "text-[#4ade80]",
        trend: "up", trendValue: `Level ${s.level}`,
      },
      {
        label: "Cards Due", value: String(dueCount), sub: "for review",
        icon: Brain, iconBg: "bg-[#60a5fa]/15", iconColor: "text-[#60a5fa]",
        trend: dueCount > 0 ? "flat" : "up",
        trendValue: dueCount > 0 ? "Review now" : "All caught up!",
      },
      {
        label: "Questions", value: String(s.totalQuestionsAnswered), sub: "answered",
        icon: Clock, iconBg: "bg-violet-400/15", iconColor: "text-violet-400",
        trend: "up",
        trendValue: s.totalQuestionsAnswered > 0
          ? `${Math.round((s.totalCorrect / s.totalQuestionsAnswered) * 100)}% accuracy`
          : "Start practicing",
      },
    ]);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon      = stat.icon;
        const TIcon     = TrendIcon[stat.trend];
        return (
          <div key={stat.label}
            className="relative text-center p-6 rounded-2xl bg-[#0d1117] border border-white/[0.06]
                       hover:border-white/[0.12] transition-colors duration-200 group">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.04), transparent 70%)" }} />
            <div className="relative z-10">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4", stat.iconBg)}>
                <Icon className={cn("w-5 h-5", stat.iconColor)} fill={stat.label === "Study Streak" || stat.label === "Total XP" ? "currentColor" : "none"} />
              </div>
              <div className="flex items-baseline justify-center gap-1.5 mb-1">
                <span className="text-2xl font-black text-white">{stat.value}</span>
                <span className="text-sm text-white/30">{stat.sub}</span>
              </div>
              <p className="text-xs text-white/40 mb-2">{stat.label}</p>
              <div className={cn("flex items-center justify-center gap-1 text-xs font-medium", trendColor[stat.trend])}>
                <TIcon className="w-3 h-3" />
                {stat.trendValue}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
