"use client";

import { Download, BookOpen, AlertTriangle, FlaskConical, Stethoscope, Pill, Lightbulb, Activity } from "lucide-react";
import { type StudyGuide, type StudyGuideSectionType } from "@/lib/recall-types";
import { cn } from "@/lib/utils";

interface StudyGuidePanelProps {
  guide: StudyGuide;
  cardCount: number;
  onExportPDF?: () => void;
}

const sectionConfig: Record<StudyGuideSectionType, { icon: React.ElementType; color: string; bg: string }> = {
  concept:        { icon: Lightbulb,    color: "text-amber-400",  bg: "bg-amber-400/10" },
  pathophysiology:{ icon: Activity,     color: "text-rose-400",   bg: "bg-rose-400/10" },
  presentation:   { icon: Stethoscope,  color: "text-blue-400",   bg: "bg-blue-400/10" },
  diagnostics:    { icon: FlaskConical, color: "text-cyan-400",   bg: "bg-cyan-400/10" },
  management:     { icon: BookOpen,     color: "text-green-400",  bg: "bg-green-400/10" },
  pharmacology:   { icon: Pill,         color: "text-violet-400", bg: "bg-violet-400/10" },
  pearls:         { icon: Lightbulb,    color: "text-[#4ade80]",  bg: "bg-[#4ade80]/10" },
  traps:          { icon: AlertTriangle,color: "text-red-400",    bg: "bg-red-400/10" },
};

export default function StudyGuidePanel({ guide, cardCount, onExportPDF }: StudyGuidePanelProps) {
  return (
    <div className="bg-[#0d1117] rounded-3xl border border-white/[0.07] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4ade80]">
              {guide.system}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/30">{cardCount} cards</span>
          </div>
          <h2 className="text-2xl font-black text-white">{guide.topic}</h2>
          <p className="text-sm text-white/40 mt-1">AI-generated study guide from your captured content</p>
        </div>
        {onExportPDF && (
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04]
                       border border-white/[0.07] text-sm text-white/50
                       hover:text-white hover:bg-white/[0.08] transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        )}
      </div>

      {/* Sections */}
      <div className="divide-y divide-white/[0.05]">
        {guide.sections.map((section) => {
          const { icon: Icon, color, bg } = sectionConfig[section.type] ?? sectionConfig.concept;
          return (
            <div key={section.id} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                  <Icon className={cn("w-4 h-4", color)} />
                </div>
                <h3 className={cn("text-sm font-bold uppercase tracking-widest", color)}>
                  {section.heading}
                </h3>
              </div>
              <ul className="space-y-2 ml-11">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/65 leading-relaxed">
                    <span className={cn("mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0", color.replace("text-", "bg-"))} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-6 pt-4 border-t border-white/[0.06] bg-white/[0.015]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30">
            Generated from your study session · {new Date().toLocaleDateString()}
          </p>
          <div className="flex gap-2">
            {["#4ade80", "#60a5fa", "#a78bfa", "#f87171"].map((c, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
