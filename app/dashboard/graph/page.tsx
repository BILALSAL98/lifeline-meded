"use client";

import { useState } from "react";
import { Search, ZoomIn, ZoomOut, Filter, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  color: string;
  mastered: boolean;
  system: string;
  connections: number;
}

interface GraphEdge {
  from: string;
  to: string;
  type: "strong" | "weak";
}

const NODES: GraphNode[] = [
  { id: "hf", label: "Heart Failure", x: 400, y: 300, r: 30, color: "#f87171", mastered: true, system: "Cardiology", connections: 8 },
  { id: "raas", label: "RAAS", x: 220, y: 180, r: 22, color: "#fb923c", mastered: true, system: "Cardiology", connections: 6 },
  { id: "bnp", label: "BNP", x: 580, y: 160, r: 16, color: "#94a3b8", mastered: false, system: "Cardiology", connections: 3 },
  { id: "acei", label: "ACE Inhibitors", x: 170, y: 340, r: 20, color: "#4ade80", mastered: true, system: "Pharmacology", connections: 7 },
  { id: "diuretics", label: "Loop Diuretics", x: 560, y: 400, r: 22, color: "#60a5fa", mastered: true, system: "Pharmacology", connections: 5 },
  { id: "edema", label: "Pulm. Edema", x: 300, y: 450, r: 18, color: "#94a3b8", mastered: false, system: "Cardiology", connections: 4 },
  { id: "echo", label: "Echo / EF", x: 580, y: 280, r: 17, color: "#a78bfa", mastered: true, system: "Diagnostics", connections: 5 },
  { id: "aldosterone", label: "Aldosterone", x: 250, y: 90, r: 18, color: "#fbbf24", mastered: true, system: "Endocrine", connections: 4 },
  { id: "na_retention", label: "Na+ Retention", x: 100, y: 200, r: 16, color: "#94a3b8", mastered: false, system: "Renal", connections: 3 },
  { id: "preload", label: "Preload", x: 460, y: 160, r: 19, color: "#34d399", mastered: true, system: "Physiology", connections: 5 },
  { id: "afterload", label: "Afterload", x: 280, y: 220, r: 19, color: "#34d399", mastered: true, system: "Physiology", connections: 6 },
  { id: "fs", label: "Frank-Starling", x: 460, y: 220, r: 24, color: "#2dd4bf", mastered: true, system: "Physiology", connections: 7 },
  { id: "renal", label: "Renal Hypoperfusion", x: 530, y: 470, r: 18, color: "#94a3b8", mastered: false, system: "Renal", connections: 4 },
  { id: "cardiac_output", label: "Cardiac Output", x: 380, y: 180, r: 26, color: "#f472b6", mastered: true, system: "Physiology", connections: 9 },
];

const EDGES: GraphEdge[] = [
  { from: "hf", to: "raas", type: "strong" },
  { from: "hf", to: "bnp", type: "strong" },
  { from: "hf", to: "edema", type: "strong" },
  { from: "hf", to: "echo", type: "strong" },
  { from: "hf", to: "diuretics", type: "strong" },
  { from: "raas", to: "acei", type: "strong" },
  { from: "raas", to: "aldosterone", type: "strong" },
  { from: "raas", to: "na_retention", type: "strong" },
  { from: "acei", to: "afterload", type: "weak" },
  { from: "diuretics", to: "preload", type: "weak" },
  { from: "preload", to: "fs", type: "strong" },
  { from: "afterload", to: "fs", type: "strong" },
  { from: "fs", to: "cardiac_output", type: "strong" },
  { from: "cardiac_output", to: "hf", type: "strong" },
  { from: "renal", to: "raas", type: "strong" },
  { from: "hf", to: "renal", type: "strong" },
];

const SYSTEMS = ["All", "Cardiology", "Pharmacology", "Physiology", "Renal", "Diagnostics", "Endocrine"];

export default function GraphPage() {
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [filter, setFilter] = useState("All");
  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState("");

  const mastered = NODES.filter((n) => n.mastered).length;

  const filteredNodes = NODES.filter((n) => {
    if (filter !== "All" && n.system !== filter) return false;
    if (search && !n.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = EDGES.filter((e) => filteredIds.has(e.from) && filteredIds.has(e.to));

  return (
    <div className="flex h-[calc(100vh-57px)] bg-[#060810]">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-60 bg-[#090c13] border-r border-white/[0.05] flex-shrink-0 p-4">
        <div className="mb-6">
          <h3 className="text-sm font-black text-white mb-1">Knowledge Graph</h3>
          <p className="text-xs text-white/35">Your mastery map across all systems</p>
        </div>

        {/* Mastery stats */}
        <div className="bg-[#0d1117] rounded-xl border border-white/[0.07] p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/40">Mastery</span>
            <span className="text-sm font-black text-[#4ade80]">{mastered}/{NODES.length}</span>
          </div>
          <div className="h-1.5 bg-white/[0.07] rounded-full">
            <div className="h-full bg-gradient-to-r from-[#4ade80] to-[#2dd4bf] rounded-full"
              style={{ width: `${(mastered / NODES.length) * 100}%` }} />
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-white/30">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4ade80] inline-block" /> Mastered</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/20 inline-block" /> Weak</span>
          </div>
        </div>

        {/* System filter */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Filter System</p>
          {SYSTEMS.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-xs font-medium mb-0.5 transition-colors",
                filter === s ? "bg-white/[0.07] text-white" : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"
              )}>
              {s}
            </button>
          ))}
        </div>

        {/* Selected node info */}
        {selected && (
          <div className="mt-auto border-t border-white/[0.06] pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Selected</p>
            <div className="bg-[#0d1117] rounded-xl border border-white/[0.07] p-3">
              <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: selected.color }} />
              <div className="text-sm font-bold text-white mb-1">{selected.label}</div>
              <div className="text-xs text-white/40">{selected.system}</div>
              <div className={cn("text-xs font-semibold mt-2", selected.mastered ? "text-[#4ade80]" : "text-amber-400")}>
                {selected.mastered ? "✓ Mastered" : "⚠ Needs review"}
              </div>
              <div className="text-xs text-white/30 mt-1">{selected.connections} connections</div>
            </div>
          </div>
        )}
      </div>

      {/* Graph canvas */}
      <div className="flex-1 relative overflow-hidden">

        {/* Toolbar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0d1117]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search concepts..."
              className="bg-transparent text-xs text-white/70 outline-none flex-1 placeholder:text-white/25"
            />
          </div>
          <div className="flex items-center gap-1 bg-[#0d1117]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl p-1">
            <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="bg-[#0d1117]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/40">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* SVG Knowledge Graph */}
        <svg
          className="w-full h-full"
          viewBox="0 0 700 600"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center", transition: "transform 0.2s" }}
        >
          <defs>
            <filter id="glow-node" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-node-lg" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {filteredEdges.map((edge, i) => {
            const from = NODES.find((n) => n.id === edge.from);
            const to = NODES.find((n) => n.id === edge.to);
            if (!from || !to) return null;
            const bothMastered = from.mastered && to.mastered;
            return (
              <line key={i}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={bothMastered ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.06)"}
                strokeWidth={edge.type === "strong" ? "1.5" : "0.8"}
                strokeDasharray={edge.type === "weak" ? "4,4" : undefined}
              />
            );
          })}

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const isSelected = selected?.id === node.id;
            return (
              <g key={node.id} className="cursor-pointer" onClick={() => setSelected(isSelected ? null : node)}>
                {/* Glow ring for mastered */}
                {node.mastered && (
                  <circle cx={node.x} cy={node.y} r={node.r + 6}
                    fill="none" stroke={node.color} strokeWidth="0.5" opacity="0.3" />
                )}
                {/* Selection ring */}
                {isSelected && (
                  <circle cx={node.x} cy={node.y} r={node.r + 10}
                    fill="none" stroke="white" strokeWidth="1.5" opacity="0.5"
                    strokeDasharray="4,3" />
                )}
                {/* Node circle */}
                <circle cx={node.x} cy={node.y} r={node.r}
                  fill={node.mastered ? node.color : "#1e293b"}
                  stroke={node.mastered ? node.color : "#334155"}
                  strokeWidth={isSelected ? "2" : "1"}
                  opacity={node.mastered ? 0.9 : 0.6}
                  filter={node.mastered ? "url(#glow-node)" : undefined}
                />
                {/* Label */}
                <text x={node.x} y={node.y + node.r + 12}
                  textAnchor="middle" fill="white" fontSize="9"
                  opacity={node.mastered ? 0.7 : 0.4}
                  fontFamily="Inter, system-ui, sans-serif"
                  fontWeight="600">
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-[#0d1117]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl p-3 text-xs text-white/40">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
            <span>Mastered concept</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-3 h-3 rounded-full bg-white/20" />
            <span>Weak / not reviewed</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-px w-5 bg-[#4ade80]/50" />
            <span>Strong connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px w-5 border-t border-dashed border-white/30" />
            <span>Weak connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
