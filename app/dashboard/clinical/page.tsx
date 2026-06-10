"use client";

import { useState } from "react";
import { Stethoscope, ClipboardList, Plus, CheckCircle2, Circle, ArrowRight, Brain, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ROTATIONS = [
  { id: "im", label: "Internal Medicine", icon: "🏥", status: "active", progress: 45, weeks: "8 weeks" },
  { id: "surg", label: "Surgery", icon: "🔪", status: "upcoming", progress: 0, weeks: "8 weeks" },
  { id: "peds", label: "Pediatrics", icon: "👶", status: "upcoming", progress: 0, weeks: "6 weeks" },
  { id: "obgyn", label: "OB/GYN", icon: "🌸", status: "upcoming", progress: 0, weeks: "6 weeks" },
  { id: "psych", label: "Psychiatry", icon: "🧩", status: "upcoming", progress: 0, weeks: "4 weeks" },
  { id: "fm", label: "Family Medicine", icon: "👨‍👩‍👧", status: "upcoming", progress: 0, weeks: "4 weeks" },
  { id: "neuro", label: "Neurology", icon: "🧠", status: "upcoming", progress: 0, weeks: "4 weeks" },
];

const ENCOUNTERS = [
  { id: "e1", chief: "Chest pain", diagnosis: "NSTEMI", date: "Today", status: "complete" },
  { id: "e2", chief: "Shortness of breath", diagnosis: "ADHF", date: "Yesterday", status: "complete" },
  { id: "e3", chief: "Altered mental status", diagnosis: "Pending", date: "Yesterday", status: "incomplete" },
  { id: "e4", chief: "Syncope", diagnosis: "Vasovagal", date: "2 days ago", status: "complete" },
];

const SOAP_SECTIONS = [
  { id: "s", label: "Subjective (HPI)", placeholder: "CC: Patient is a [age] [sex] with [relevant PMH] who presents with [chief complaint] for [duration].\n\nHPI: [onset, location, duration, character, aggravating/alleviating, radiation, timing, severity]...", rows: 5 },
  { id: "o", label: "Objective (Physical Exam + Labs)", placeholder: "VS: T [temp] HR [rate] BP [value] RR [rate] O2 [sat] on [room air/O2]\n\nGen: [appearance]\nCV: [findings]\nPulm: [findings]\nAbd: [findings]\n\nLabs: Na [value] K [value] Cr [value] WBC [value]...", rows: 6 },
  { id: "a", label: "Assessment", placeholder: "1. [Primary diagnosis]: [supporting evidence]\n2. [Secondary problem]: [supporting evidence]\n\nDDx: [differential diagnoses]", rows: 4 },
  { id: "p", label: "Plan", placeholder: "1. [Problem 1]\n   - [Diagnostic step]\n   - [Treatment]\n   - [Monitoring]\n\n2. [Problem 2]\n   - ...\n\nDispo: [Admit/Discharge/Observation]\nFollow-up: [plan]", rows: 5 },
];

const PEARLS = [
  { system: "Cardiology", pearl: "Troponin rises 3-6h after MI. Serial troponins at 0h and 3h rule out NSTEMI. Don't send a single troponin.", urgent: true },
  { system: "Pulmonology", pearl: "New oxygen requirement in a hospitalized patient → PE, HAP, fluid overload? Always check EKG + bilateral comparison CXR.", urgent: false },
  { system: "Renal", pearl: "Contrast nephropathy risk peaks at 48-72h post-contrast. Check creatinine before and 48h after if at risk.", urgent: false },
  { system: "ID", pearl: "If blood cultures drawn before antibiotics? Never delay antibiotics >1h in septic shock to get cultures.", urgent: true },
];

export default function ClinicalPage() {
  const [tab, setTab] = useState<"rounds" | "soap" | "encounters" | "pearls">("rounds");
  const [soap, setSoap] = useState<Record<string, string>>({});
  const [aiFeedback, setAiFeedback] = useState(false);

  const tabs = [
    { id: "rounds", label: "Lifeline Rounds™", icon: Brain },
    { id: "soap", label: "SOAP Trainer", icon: ClipboardList },
    { id: "encounters", label: "Encounter Log", icon: Stethoscope },
    { id: "pearls", label: "Clinical Pearls", icon: "💎" },
  ] as const;

  return (
    <div className="flex h-[calc(100vh-57px)]">

      {/* Sidebar — rotations */}
      <div className="hidden lg:flex flex-col w-56 bg-[#090c13] border-r border-white/[0.05] flex-shrink-0 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-2 mb-3">Clerkships</p>
        {ROTATIONS.map((r) => (
          <div key={r.id}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer transition-colors",
              r.status === "active" ? "bg-white/[0.06] text-white" : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
            )}>
            <span className="text-base">{r.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{r.label}</div>
              <div className="text-[10px] text-white/25">{r.weeks}</div>
            </div>
            {r.status === "active" && (
              <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-white/[0.05] bg-[#060810] overflow-x-auto flex-shrink-0">
          {tabs.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id as typeof tab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                tab === id
                  ? "bg-white/[0.08] text-white border border-white/[0.1]"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              )}>
              {typeof icon === "string" ? <span>{icon}</span> : <>{React.createElement(icon, { className: "w-4 h-4" })}</>}
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">

          {/* Lifeline Rounds */}
          {tab === "rounds" && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Lifeline Rounds™</h2>
                <p className="text-white/50">Virtual clinical rounds with an AI attending. Choose your level and specialty.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                {[
                  { icon: "👨‍⚕️", label: "Attending Mode", desc: "Full presentation. AI acts as attending — expect to be pushed.", color: "border-rose-400/20 bg-rose-400/5", badge: "Most realistic" },
                  { icon: "👩‍⚕️", label: "Resident Mode", desc: "Co-manage patients. More collaborative, guidance available.", color: "border-blue-400/20 bg-blue-400/5", badge: null },
                  { icon: "📋", label: "Consult Mode", desc: "Present a consult. AI acts as the specialist you called.", color: "border-violet-400/20 bg-violet-400/5", badge: null },
                  { icon: "🚑", label: "Emergency Mode", desc: "Rapid clinical decisions under time pressure.", color: "border-amber-400/20 bg-amber-400/5", badge: "High pressure" },
                ].map(({ icon, label, desc, color, badge }) => (
                  <Link key={label} href="/recall"
                    className={cn("relative flex flex-col gap-3 p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] group", color)}>
                    {badge && (
                      <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2 py-0.5 rounded-full">
                        {badge}
                      </span>
                    )}
                    <div className="text-3xl">{icon}</div>
                    <div>
                      <div className="font-bold text-white mb-1">{label}</div>
                      <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* SOAP Trainer */}
          {tab === "soap" && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">SOAP Note Trainer</h2>
                  <p className="text-white/45 text-sm">Write a SOAP note. AI grades your HPI, assessment, and plan.</p>
                </div>
                <button onClick={() => setAiFeedback(!aiFeedback)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] text-sm font-semibold hover:bg-[#4ade80]/15 transition-colors">
                  <Brain className="w-4 h-4" /> Grade with AI
                </button>
              </div>

              <div className="space-y-5">
                {SOAP_SECTIONS.map((section) => (
                  <div key={section.id} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                      <div className="w-7 h-7 rounded-lg bg-[#4ade80]/10 flex items-center justify-center font-black text-[#4ade80] text-sm">
                        {section.id.toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-white">{section.label}</span>
                    </div>
                    <textarea
                      value={soap[section.id] ?? ""}
                      onChange={(e) => setSoap((s) => ({ ...s, [section.id]: e.target.value }))}
                      rows={section.rows}
                      placeholder={section.placeholder}
                      className="w-full bg-transparent px-5 py-4 text-sm text-white/75 font-mono leading-relaxed outline-none resize-none placeholder:text-white/15"
                    />
                  </div>
                ))}
              </div>

              {aiFeedback && (
                <div className="mt-6 bg-[#0d1117] border border-[#4ade80]/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-[#4ade80]" />
                    <span className="text-sm font-bold text-[#4ade80]">AI Feedback</span>
                    <span className="ml-auto text-lg font-black text-white">82/100</span>
                  </div>
                  <div className="space-y-3 text-sm text-white/60">
                    <p><strong className="text-[#4ade80]">✓ Strengths:</strong> Clear chief complaint, good onset/duration documentation, appropriate differential.</p>
                    <p><strong className="text-amber-400">⚠ Improve:</strong> Assessment is missing a concise one-liner. Plan lacks follow-up timeline and escalation criteria.</p>
                    <p><strong className="text-white/35">💡 Tip:</strong> Start each assessment problem with a clear diagnosis statement, then evidence. Attendings read assessment first.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Encounter Log */}
          {tab === "encounters" && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">Patient Encounters</h2>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#4ade80] text-[#06080f] font-bold text-sm transition-all active:scale-95">
                  <Plus className="w-4 h-4" /> Log Encounter
                </button>
              </div>
              <div className="space-y-3">
                {ENCOUNTERS.map((enc) => (
                  <div key={enc.id} className="flex items-center gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl px-5 py-4 hover:border-white/[0.14] transition-colors cursor-pointer group">
                    {enc.status === "complete"
                      ? <CheckCircle2 className="w-5 h-5 text-[#4ade80] flex-shrink-0" />
                      : <Circle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{enc.chief}</div>
                      <div className="text-xs text-white/40">{enc.diagnosis} · {enc.date}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Pearls */}
          {tab === "pearls" && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-black text-white mb-6">Clinical Pearls</h2>
              <div className="space-y-4">
                {PEARLS.map((pearl, i) => (
                  <div key={i} className={cn(
                    "bg-[#0d1117] border rounded-2xl p-5",
                    pearl.urgent ? "border-amber-400/20" : "border-white/[0.07]"
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#4ade80]">{pearl.system}</span>
                      {pearl.urgent && <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">High-yield</span>}
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed">{pearl.pearl}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
