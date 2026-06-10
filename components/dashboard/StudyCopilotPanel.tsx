import Link from "next/link";
import { AlertTriangle, Clock, TrendingDown, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const alerts = [
  {
    type: "danger",
    icon: Clock,
    title: "Forget alert",
    message: "Renal physiology — predicted forgetting in 2 days.",
    action: "Review now",
    href: "/dashboard/retention",
    color: "text-rose-400",
    bg: "bg-rose-400/8",
    border: "border-rose-400/20",
    iconBg: "bg-rose-400/15",
  },
  {
    type: "warning",
    icon: TrendingDown,
    title: "Weakness pattern",
    message: "You miss acid-base compensation questions consistently (last 3 sessions).",
    action: "See cards",
    href: "/recall",
    color: "text-amber-400",
    bg: "bg-amber-400/8",
    border: "border-amber-400/20",
    iconBg: "bg-amber-400/15",
  },
  {
    type: "tip",
    icon: AlertTriangle,
    title: "Board tip",
    message: "Step 1 prep: You've covered 4/12 systems. Focus on Neurology next.",
    action: "Start Neurology",
    href: "/dashboard/learn",
    color: "text-[#60a5fa]",
    bg: "bg-[#60a5fa]/8",
    border: "border-[#60a5fa]/20",
    iconBg: "bg-[#60a5fa]/15",
  },
];

const weekActivity = [65, 82, 45, 90, 78, 91, 60];
const days = ["M", "T", "W", "T", "F", "S", "S"];

export default function StudyCopilotPanel() {
  const maxVal = Math.max(...weekActivity);

  return (
    <div className="bg-[#0d1117] rounded-2xl border border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20
                            flex items-center justify-center text-lg">
              🧭
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400
                            border-2 border-[#0d1117] animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Study Copilot</div>
            <div className="text-xs text-white/30">3 alerts · personalized to you</div>
          </div>
        </div>
        <Link href="/dashboard/copilot" className="text-xs text-[#4ade80] hover:text-white transition-colors font-medium">
          Full analysis →
        </Link>
      </div>

      {/* Alerts */}
      <div className="p-4 space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.title}
              className={cn("flex items-start gap-3 p-3.5 rounded-xl border", alert.bg, alert.border)}
            >
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", alert.iconBg)}>
                <Icon className={cn("w-3.5 h-3.5", alert.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-xs font-bold mb-0.5", alert.color)}>{alert.title}</div>
                <p className="text-xs text-white/60 leading-relaxed">{alert.message}</p>
              </div>
              <Link
                href={alert.href}
                className={cn("text-xs font-semibold whitespace-nowrap flex-shrink-0 mt-0.5 hover:opacity-80 transition-opacity", alert.color)}
              >
                {alert.action} →
              </Link>
            </div>
          );
        })}
      </div>

      {/* Weekly activity chart */}
      <div className="px-5 pb-5 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-3">
          This week
        </p>
        <div className="flex items-end gap-1.5 h-16">
          {weekActivity.map((val, i) => {
            const isToday = i === 6;
            const height = `${(val / maxVal) * 100}%`;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all duration-500",
                    isToday ? "bg-[#4ade80]" : "bg-white/[0.08]"
                  )}
                  style={{ height }}
                />
                <span className={cn("text-[9px] font-medium", isToday ? "text-[#4ade80]" : "text-white/20")}>
                  {days[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
