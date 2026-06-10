"use client";

import { useState } from "react";
import { Search, Bell, Menu, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onMobileMenuOpen: () => void;
}

const notifications = [
  { id: 1, icon: "🔥", message: "42-day streak! Keep it up.", time: "just now", unread: true },
  { id: 2, icon: "📉", message: "Study Copilot: Renal physiology review due in 2 days.", time: "1h ago", unread: true },
  { id: 3, icon: "✅", message: "You scored 91% on today's practice session.", time: "3h ago", unread: false },
];

export default function DashboardHeader({ onMobileMenuOpen }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="flex items-center gap-4 px-4 sm:px-6 py-3
                       border-b border-white/[0.05] bg-[#060810]/95 backdrop-blur-xl
                       sticky top-0 z-30">
      {/* Mobile menu */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center
                   text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className={cn(
        "flex-1 max-w-lg flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200",
        searchFocused
          ? "bg-[#0d1117] border border-[#4ade80]/30 ring-1 ring-[#4ade80]/10"
          : "bg-white/[0.04] border border-white/[0.06]"
      )}>
        <Search className={cn("w-4 h-4 flex-shrink-0 transition-colors", searchFocused ? "text-[#4ade80]" : "text-white/25")} />
        <input
          type="text"
          placeholder="Search topics, cards, questions..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="flex-1 bg-transparent text-sm text-white/80 outline-none placeholder:text-white/25"
        />
        <kbd className="hidden sm:block text-[10px] text-white/20 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
          ⌘K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Streak chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                        bg-orange-500/10 border border-orange-500/20">
          <Flame className="w-3.5 h-3.5 text-orange-400" fill="currentColor" />
          <span className="text-xs font-bold text-orange-400">42</span>
        </div>

        {/* XP chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                        bg-[#4ade80]/10 border border-[#4ade80]/20">
          <Star className="w-3.5 h-3.5 text-[#4ade80]" fill="currentColor" />
          <span className="text-xs font-bold text-[#4ade80]">4,820 XP</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
              showNotifications
                ? "bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80]"
                : "text-white/40 hover:text-white hover:bg-white/[0.06]"
            )}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full
                               bg-[#4ade80] text-[#06080f] text-[9px] font-black
                               flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d1117]
                            border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-sm font-bold text-white">Notifications</span>
                <button className="text-xs text-[#4ade80] hover:text-white transition-colors">
                  Mark all read
                </button>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer",
                    "border-b border-white/[0.04] last:border-0"
                  )}
                >
                  <span className="text-lg flex-shrink-0">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70 leading-snug">{n.message}</p>
                    <p className="text-xs text-white/25 mt-0.5">{n.time}</p>
                  </div>
                  {n.unread && (
                    <div className="w-2 h-2 rounded-full bg-[#4ade80] mt-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4ade80] to-[#2dd4bf]
                        flex items-center justify-center text-[#06080f] text-sm font-black
                        cursor-pointer hover:scale-105 transition-transform">
          B
        </div>
      </div>
    </header>
  );
}
