"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Sparkles, BookOpen, Star, AlertTriangle, ArrowRight, Search } from "lucide-react";
import { MEDICAL_CONTENT, type MedicalSystem, type MedicalTopic, type ContentSection } from "@/lib/medical-content";
import { cn } from "@/lib/utils";
import Link from "next/link";

const SECTION_ICONS: Record<string, string> = {
  concept: "📋", pathophysiology: "🔬", presentation: "🩺",
  diagnostics: "🧪", management: "💊", pharmacology: "💉",
  pearls: "💡", traps: "⚠️", comparison: "↔",
};

const SECTION_COLORS: Record<string, string> = {
  concept: "text-blue-400 bg-blue-400/10",
  pathophysiology: "text-rose-400 bg-rose-400/10",
  presentation: "text-cyan-400 bg-cyan-400/10",
  diagnostics: "text-violet-400 bg-violet-400/10",
  management: "text-[#4ade80] bg-[#4ade80]/10",
  pharmacology: "text-purple-400 bg-purple-400/10",
  pearls: "text-amber-400 bg-amber-400/10",
  traps: "text-red-400 bg-red-400/10",
  comparison: "text-indigo-400 bg-indigo-400/10",
};

export default function LearnPage() {
  const [selectedSystem, setSelectedSystem] = useState<MedicalSystem>(MEDICAL_CONTENT[0]);
  const [selectedTopic, setSelectedTopic]   = useState<MedicalTopic>(MEDICAL_CONTENT[0].topics[0]);
  const [openSections, setOpenSections]     = useState<Set<string>>(new Set(["hf_patho", "neph_causes", "aki_class"]));
  const [search, setSearch]                 = useState("");

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function pickTopic(system: MedicalSystem, topic: MedicalTopic) {
    setSelectedSystem(system);
    setSelectedTopic(topic);
    setOpenSections(new Set([topic.sections[0]?.id]));
  }

  const diff = ["", "Beginner", "Intermediate", "Advanced"];
  const diffColor = ["", "text-[#4ade80]", "text-amber-400", "text-rose-400"];

  return (
    <div className="flex h-[calc(100vh-57px)]">

      {/* ── System sidebar ── */}
      <div className="w-52 flex-shrink-0 bg-[#090c13] border-r border-white/[0.05] overflow-y-auto">
        <div className="p-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 mb-3">
            <Search className="w-3 h-3 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search topics..." className="bg-transparent text-xs text-white/70 outline-none flex-1 placeholder:text-white/25" />
          </div>

          {MEDICAL_CONTENT.map(system => (
            <div key={system.id} className="mb-2">
              <button
                onClick={() => { setSelectedSystem(system); if (system.topics[0]) pickTopic(system, system.topics[0]); }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all mb-1",
                  selectedSystem.id === system.id
                    ? "text-white bg-white/[0.07]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                )}>
                <span className="text-base">{system.icon}</span>
                <span>{system.name}</span>
              </button>

              {selectedSystem.id === system.id && system.topics
                .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()))
                .map(topic => (
                  <button key={topic.id}
                    onClick={() => pickTopic(system, topic)}
                    className={cn(
                      "w-full text-left pl-8 pr-3 py-2 rounded-lg text-xs transition-all mb-0.5",
                      selectedTopic.id === topic.id
                        ? "text-[#4ade80] bg-[#4ade80]/10 font-semibold"
                        : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                    )}>
                    {topic.name}
                  </button>
                ))
              }
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/30 mb-5">
            <span>{selectedSystem.name}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#4ade80]">{selectedTopic.name}</span>
          </div>

          {/* Topic header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl font-black text-white leading-tight">{selectedTopic.name}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cn("text-xs font-bold", diffColor[selectedTopic.difficulty])}>
                  {diff[selectedTopic.difficulty]}
                </span>
                <span className={cn(
                  "text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest",
                  selectedTopic.board_relevance === "step1" ? "text-blue-400 border-blue-400/25 bg-blue-400/8" :
                  selectedTopic.board_relevance === "step2" ? "text-indigo-400 border-indigo-400/25 bg-indigo-400/8" :
                  "text-[#4ade80] border-[#4ade80]/25 bg-[#4ade80]/8"
                )}>
                  {selectedTopic.board_relevance === "both" ? "Step 1 + 2" : selectedTopic.board_relevance.replace("step", "Step ")}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {selectedTopic.tags.map(tag => (
                <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-white/40">
                  {tag}
                </span>
              ))}
            </div>

            {/* Lifeline Summary */}
            <div className="rounded-2xl border border-[#4ade80]/20 bg-[#4ade80]/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-[#4ade80]" fill="currentColor" />
                <span className="text-xs font-black uppercase tracking-widest text-[#4ade80]">Lifeline Summary™</span>
                <span className="ml-auto text-[9px] text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">High-yield one-liner</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{selectedTopic.lifeline_summary}</p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {selectedTopic.sections.map(section => {
              const isOpen = openSections.has(section.id);
              const colorClass = SECTION_COLORS[section.type] || "text-white/60 bg-white/[0.06]";
              const highYieldCount = section.bullets.filter(b => b.highYield).length;

              return (
                <div key={section.id} className="rounded-2xl border border-white/[0.07] bg-[#0d1117] overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0", colorClass.split(" ")[1])}>
                        {SECTION_ICONS[section.type] || "📋"}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-white">{section.heading}</div>
                        {highYieldCount > 0 && (
                          <div className="text-[10px] text-amber-400/70">{highYieldCount} high-yield point{highYieldCount > 1 ? "s" : ""}</div>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-white/25 transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-white/[0.05]">
                      <ul className="mt-4 space-y-3">
                        {section.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="flex items-center gap-1.5 flex-shrink-0 mt-1.5">
                              {bullet.highYield && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="High-yield" />
                              )}
                              {!bullet.highYield && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0" />
                              )}
                            </div>
                            <div>
                              <span className={cn(
                                "text-sm leading-relaxed",
                                bullet.highYield ? "text-white/90 font-medium" : "text-white/65"
                              )}>
                                {bullet.text}
                              </span>
                              {bullet.step && (
                                <span className={cn(
                                  "ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                                  bullet.step === "step1" ? "text-blue-400 bg-blue-400/10" :
                                  bullet.step === "step2" ? "text-indigo-400 bg-indigo-400/10" :
                                  "text-[#4ade80] bg-[#4ade80]/10"
                                )}>
                                  {bullet.step === "both" ? "Step 1+2" : bullet.step.replace("step", "Step ")}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/recall"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/25 text-[#4ade80] text-sm font-semibold hover:bg-[#4ade80]/15 transition-colors">
              <Sparkles className="w-4 h-4" />
              Generate Flashcards from This Topic
            </Link>
            <Link href="/dashboard/practice"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/55 text-sm font-semibold hover:text-white hover:bg-white/[0.08] transition-colors">
              Practice Questions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Navigation to next topic */}
          {(() => {
            const topicIdx = selectedSystem.topics.findIndex(t => t.id === selectedTopic.id);
            const nextTopic = selectedSystem.topics[topicIdx + 1];
            if (!nextTopic) return null;
            return (
              <div className="mt-4">
                <button onClick={() => pickTopic(selectedSystem, nextTopic)}
                  className="flex items-center gap-3 w-full p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left group">
                  <div className="flex-1">
                    <div className="text-xs text-white/30 mb-0.5">Next topic</div>
                    <div className="text-sm font-bold text-white">{nextTopic.name}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
