import Link from "next/link";
import { Layers, Brain, HelpCircle, RefreshCw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    icon: HelpCircle,
    iconBg: "bg-blue-400/10",
    iconColor: "text-blue-400",
    label: "Practice session",
    sub: "Cardiology · 24 questions · 88% accuracy",
    time: "2h ago",
    score: { value: 88, color: "#4ade80" },
  },
  {
    icon: Layers,
    iconBg: "bg-[#4ade80]/10",
    iconColor: "text-[#4ade80]",
    label: "Lifeline Recall",
    sub: "Generated 5 cards · Nephrotic Syndrome",
    time: "3h ago",
    score: null,
  },
  {
    icon: Brain,
    iconBg: "bg-cyan-400/10",
    iconColor: "text-cyan-400",
    label: "AI Tutor session",
    sub: "Heart Failure · Pimp mode · Score: 74",
    time: "Yesterday",
    score: { value: 74, color: "#fbbf24" },
  },
  {
    icon: RefreshCw,
    iconBg: "bg-violet-400/10",
    iconColor: "text-violet-400",
    label: "Retention review",
    sub: "18 cards reviewed · 94% retention rate",
    time: "Yesterday",
    score: { value: 94, color: "#4ade80" },
  },
  {
    icon: HelpCircle,
    iconBg: "bg-blue-400/10",
    iconColor: "text-blue-400",
    label: "Practice session",
    sub: "Renal · 15 questions · 67% accuracy",
    time: "2 days ago",
    score: { value: 67, color: "#f87171" },
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-[#0d1117] rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <h3 className="text-sm font-bold text-white">Recent Activity</h3>
        <Link href="/dashboard/history" className="text-xs text-white/30 hover:text-white/60 transition-colors">
          View all →
        </Link>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", activity.iconBg)}>
                <Icon className={cn("w-4 h-4", activity.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white/80">{activity.label}</div>
                <div className="text-xs text-white/35 truncate">{activity.sub}</div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {activity.score && (
                  <div className="text-xs font-black" style={{ color: activity.score.color }}>
                    {activity.score.value}%
                  </div>
                )}
                <span className="text-xs text-white/20">{activity.time}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white/15 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
