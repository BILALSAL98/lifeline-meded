"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  HelpCircle,
  RefreshCw,
  Stethoscope,
  Users,
  Network,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart2,
  X,
  Activity,
  FlaskConical,
  CreditCard,
} from "lucide-react";
import { LifelineLogo } from "@/components/ui/LifelineLogo";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navSections = [
  {
    label: "Ecosystems",
    items: [
      { href: "/dashboard", icon: BarChart2, label: "Dashboard", exact: true },
      { href: "/dashboard/learn", icon: BookOpen, label: "Learn", badge: null },
      { href: "/dashboard/tutor", icon: Brain, label: "AI Tutor", badge: "AI" },
      { href: "/dashboard/practice", icon: HelpCircle, label: "Practice", badge: null },
      { href: "/dashboard/retention", icon: RefreshCw, label: "Retention", badge: "12" },
      { href: "/dashboard/clinical", icon: Stethoscope, label: "Clinical", badge: null },
      { href: "/dashboard/copilot", icon: Brain, label: "Study Copilot", badge: "AI" },
      { href: "/dashboard/nexus", icon: Users, label: "Lifeline Nexus", badge: null },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/dashboard/rounds", icon: Activity, label: "Lifeline Rounds™", badge: "🏥" },
      { href: "/dashboard/roundroom", icon: FlaskConical, label: "Round Room", badge: "New" },
      { href: "/dashboard/anki", icon: CreditCard, label: "Anki Creator", badge: "New" },
      { href: "/recall", icon: Layers, label: "Lifeline Recall", badge: null },
      { href: "/dashboard/graph", icon: Network, label: "Knowledge Graph", badge: null },
    ],
  },
];

const badgeColors: Record<string, string> = {
  AI: "bg-[#60a5fa]/15 text-[#60a5fa] border-[#60a5fa]/25",
  New: "bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/25",
};

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== "/dashboard";
  };

  const SidebarContent = () => (
    <div className={cn(
      "flex flex-col h-full bg-[#090c13] border-r border-white/[0.06] transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-white/[0.06] flex-shrink-0",
        collapsed ? "justify-center px-3 py-4" : "px-5 py-4"
      )}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4ade80] to-[#2dd4bf]
                          flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#06080f]" fill="currentColor" />
          </div>
        ) : (
          <LifelineLogo width={140} height={45} />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-3 mb-2">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group",
                        "relative overflow-hidden",
                        active
                          ? "bg-[#4ade80]/10 text-[#4ade80]"
                          : "text-white/45 hover:text-white hover:bg-white/[0.05]"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#4ade80] rounded-r-full" />
                      )}
                      <Icon className={cn(
                        "w-4 h-4 flex-shrink-0 transition-colors",
                        active ? "text-[#4ade80]" : "text-white/30 group-hover:text-white/60"
                      )} />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium flex-1">{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-md border",
                              badgeColors[item.badge] ?? "bg-white/10 text-white/40 border-white/15"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="flex-shrink-0 border-t border-white/[0.06] p-3 space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
            "text-white/35 hover:text-white hover:bg-white/[0.05]"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Link>

        {/* User chip */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] cursor-pointer hover:bg-white/[0.06] transition-colors",
          collapsed && "justify-center"
        )}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4ade80] to-[#2dd4bf]
                          flex items-center justify-center text-[#06080f] text-xs font-black flex-shrink-0">
            B
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">Bilal S.</div>
              <div className="text-[10px] text-white/30 truncate">MS2 · Step 1 Prep</div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full
                   bg-[#111827] border border-white/[0.1]
                   flex items-center justify-center
                   text-white/40 hover:text-white transition-colors
                   hidden lg:flex shadow-md"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex relative flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative h-full">
            <div className="flex flex-col h-full w-60">
              <SidebarContent />
            </div>
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
