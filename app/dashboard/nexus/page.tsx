"use client";

import { useState } from "react";
import { Search, Users, BookOpen, Star, MessageCircle, Heart, Share2, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FEED = [
  {
    id: "p1", author: "Sarah K.", role: "MS3 · Johns Hopkins", avatar: "SK", avatarColor: "from-blue-500 to-indigo-600",
    time: "2h ago",
    content: "Just finished my cardiology shelf with a 90th percentile score after using Lifeline Rounds for 2 weeks straight. The AI attending literally asked me the same questions as the real attending. 🔥",
    likes: 47, comments: 12, tag: "Win",
    tagColor: "text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/20",
  },
  {
    id: "p2", author: "Dr. Martinez", role: "Attending · UCSF · Cardiology", avatar: "DM", avatarColor: "from-rose-500 to-pink-600",
    time: "5h ago",
    content: "Reminder: heart failure management is all about knowing WHY you're doing each intervention. ACEi reduces afterload + prevents remodeling. Diuretics relieve congestion. β-blockers reduce mortality despite being negative inotropes. Know the mechanisms cold.",
    likes: 134, comments: 28, tag: "Teaching",
    tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  {
    id: "p3", author: "Priya N.", role: "MS2 · Yale", avatar: "PN", avatarColor: "from-emerald-500 to-teal-600",
    time: "1d ago",
    content: "Anyone else using the Knowledge Graph feature to connect their weak areas? It genuinely changed how I think about renal physiology. Seeing how nephrotic syndrome connects to RAAS to ACEi was a lightbulb moment.",
    likes: 89, comments: 34, tag: "Study Tip",
    tagColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  },
];

const MENTORS = [
  { name: "Dr. James Chen", role: "Cardiologist · Mayo Clinic", specialty: "Cardiology", available: true, avatar: "JC", color: "from-rose-500 to-pink-600" },
  { name: "Dr. Amara Patel", role: "Nephrologist · MGH", specialty: "Renal", available: true, avatar: "AP", color: "from-blue-500 to-indigo-600" },
  { name: "Dr. Lisa Wong", role: "Program Director · Penn", specialty: "Internal Medicine", available: false, avatar: "LW", color: "from-violet-500 to-purple-600" },
  { name: "Dr. Kevin Brooks", role: "Neurologist · Johns Hopkins", specialty: "Neurology", available: true, avatar: "KB", color: "from-amber-500 to-orange-600" },
];

const GROUPS = [
  { name: "Step 1 Study Group", members: 234, active: "12 active now", icon: "📚" },
  { name: "IMG Match 2026", members: 891, active: "34 active now", icon: "🌍" },
  { name: "Cardiology Interest", members: 456, active: "8 active now", icon: "❤️" },
  { name: "DO Students Network", members: 312, active: "5 active now", icon: "🩺" },
];

export default function NexusPage() {
  const [tab, setTab] = useState<"feed" | "mentors" | "groups" | "research">("feed");
  const [liked, setLiked] = useState<Set<string>>(new Set());

  return (
    <div className="flex h-[calc(100vh-57px)]">

      {/* Left sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-[#090c13] border-r border-white/[0.05] flex-shrink-0 p-4">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4ade80] to-[#2dd4bf] flex items-center justify-center text-[#06080f] text-xl font-black mx-auto mb-3">B</div>
          <div className="text-center">
            <div className="font-bold text-white">Bilal S.</div>
            <div className="text-xs text-white/40">MS2 · Step 1 Prep</div>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/30">
              <span><strong className="text-white">34</strong> connections</span>
              <span><strong className="text-white">3</strong> groups</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Suggested Connections</p>
          {["Alex M. · MS2 · UMich", "Danielle R. · MS3 · PCOM", "James O. · MS4 · Emory"].map((c) => (
            <div key={c} className="flex items-center gap-2.5 py-2 px-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {c[0]}
              </div>
              <span className="text-xs text-white/55 truncate">{c}</span>
              <Plus className="w-3 h-3 text-white/25 flex-shrink-0 ml-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-white/[0.05] bg-[#060810] flex-shrink-0">
          {(["feed", "mentors", "groups", "research"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                tab === t ? "bg-white/[0.08] text-white border border-white/[0.1]" : "text-white/40 hover:text-white/70"
              )}>
              {t}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-white/30" />
              <input placeholder="Search Nexus..." className="bg-transparent text-xs text-white/70 outline-none w-32 placeholder:text-white/25" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="max-w-2xl mx-auto">

            {/* Feed */}
            {tab === "feed" && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3 cursor-pointer hover:border-white/[0.14] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4ade80] to-[#2dd4bf] flex items-center justify-center text-[#06080f] text-xs font-black flex-shrink-0">B</div>
                  <span className="text-sm text-white/30 flex-1">Share a study tip, question, or win...</span>
                  <button className="px-3 py-1.5 rounded-lg bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] text-xs font-bold transition-colors">Post</button>
                </div>

                {FEED.map((post) => (
                  <div key={post.id} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={cn("w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold flex-shrink-0", post.avatarColor)}>
                        {post.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{post.author}</span>
                          <span className="text-xs text-white/30">{post.role}</span>
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border ml-auto", post.tagColor)}>{post.tag}</span>
                        </div>
                        <span className="text-xs text-white/25">{post.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed mb-4">{post.content}</p>
                    <div className="flex items-center gap-4 pt-3 border-t border-white/[0.05]">
                      <button onClick={() => setLiked((s) => { const n = new Set(s); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })}
                        className={cn("flex items-center gap-1.5 text-xs font-medium transition-colors",
                          liked.has(post.id) ? "text-rose-400" : "text-white/35 hover:text-rose-400")}>
                        <Heart className={cn("w-3.5 h-3.5", liked.has(post.id) && "fill-current")} />
                        {post.likes + (liked.has(post.id) ? 1 : 0)}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 font-medium transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 font-medium transition-colors ml-auto">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mentors */}
            {tab === "mentors" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-white mb-6">Find a Mentor</h2>
                {MENTORS.map((m) => (
                  <div key={m.name} className="flex items-center gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.14] transition-colors">
                    <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold flex-shrink-0", m.color)}>
                      {m.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white">{m.name}</div>
                      <div className="text-sm text-white/45">{m.role}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 rounded-md">{m.specialty}</span>
                        <div className={cn("w-1.5 h-1.5 rounded-full", m.available ? "bg-[#4ade80]" : "bg-white/20")} />
                        <span className="text-xs text-white/25">{m.available ? "Available" : "Busy"}</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 hover:text-white hover:bg-white/[0.09] transition-colors font-medium">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Groups */}
            {tab === "groups" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-white mb-6">Study Groups</h2>
                {GROUPS.map((g) => (
                  <div key={g.name} className="flex items-center gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.14] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-2xl flex-shrink-0">
                      {g.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{g.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-white/35">
                          <Users className="w-3 h-3" /> {g.members.toLocaleString()} members
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                        <span className="text-xs text-white/35">{g.active}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}

            {/* Research */}
            {tab === "research" && (
              <div>
                <h2 className="text-2xl font-black text-white mb-6">Research Opportunities</h2>
                {[
                  { title: "Clinical Research Coordinator", org: "Massachusetts General Hospital", field: "Cardiology", deadline: "Rolling", paid: true },
                  { title: "Basic Science Lab Assistant", org: "Stanford Medicine", field: "Oncology", deadline: "Jan 15, 2025", paid: false },
                  { title: "Quality Improvement Project", org: "Johns Hopkins", field: "Hospitalist Medicine", deadline: "Dec 30, 2024", paid: false },
                ].map((r) => (
                  <div key={r.title} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 mb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-white mb-1">{r.title}</div>
                        <div className="text-sm text-white/45">{r.org}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[#60a5fa] bg-[#60a5fa]/10 border border-[#60a5fa]/20 px-2 py-0.5 rounded-md">{r.field}</span>
                          {r.paid && <span className="text-xs text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 rounded-md">Paid</span>}
                          <span className="text-xs text-white/25">Deadline: {r.deadline}</span>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 hover:text-white hover:bg-white/[0.09] transition-colors font-medium whitespace-nowrap flex-shrink-0">
                        Apply →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
