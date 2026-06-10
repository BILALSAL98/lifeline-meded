"use client";

import { useState } from "react";
import {
  Edit3,
  CheckSquare,
  Copy,
  Trash2,
  ChevronDown,
  Tag,
  Layers,
  Zap,
  BookOpen,
  GitCompare,
  Stethoscope,
} from "lucide-react";
import { type FlashCard, type CardType, CARD_TYPE_LABELS, SYSTEM_COLORS } from "@/lib/recall-types";
import { cn } from "@/lib/utils";

interface GeneratedCardsProps {
  cards: FlashCard[];
  onEdit: (card: FlashCard) => void;
  onDelete: (id: string) => void;
  onDuplicate: (card: FlashCard) => void;
  onToggleSelect: (id: string) => void;
  selectedIds: Set<string>;
}

const cardTypeConfig: Record<CardType, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  basic: { icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/25" },
  cloze: { icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/25" },
  vignette: { icon: Stethoscope, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/25" },
  comparison: { icon: GitCompare, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/25" },
};

function CardBadge({ type }: { type: CardType }) {
  const { icon: Icon, color, bg, border } = cardTypeConfig[type];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border", color, bg, border)}>
      <Icon className="w-3 h-3" />
      {CARD_TYPE_LABELS[type]}
    </span>
  );
}

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn("w-1.5 h-1.5 rounded-full", i <= level ? "bg-[#4ade80]" : "bg-white/10")}
        />
      ))}
    </div>
  );
}

function ClozePreview({ text }: { text: string }) {
  // Render cloze markers as blanks
  const rendered = text.replace(/\{\{c\d+::(.*?)\}\}/g, (_, answer) => (
    `[${answer}]`
  ));
  return (
    <p className="text-sm text-white/70 leading-relaxed font-mono">
      {rendered}
    </p>
  );
}

function CardItem({
  card,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleSelect,
  isSelected,
}: {
  card: FlashCard;
  onEdit: (c: FlashCard) => void;
  onDelete: (id: string) => void;
  onDuplicate: (c: FlashCard) => void;
  onToggleSelect: (id: string) => void;
  isSelected: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const systemColor = SYSTEM_COLORS[card.system] ?? "#94a3b8";
  const { border } = cardTypeConfig[card.type];

  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all duration-200 overflow-hidden",
        "bg-[#0d1117]",
        isSelected
          ? "border-[#4ade80]/50 ring-1 ring-[#4ade80]/20"
          : cn("hover:border-white/15", border),
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4ade80] to-[#2dd4bf]" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-0 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CardBadge type={card.type} />
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{ color: systemColor, background: `${systemColor}18` }}
          >
            {card.system}
          </span>
          <DifficultyDots level={card.difficulty} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggleSelect(card.id)}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              isSelected
                ? "bg-[#4ade80]/20 text-[#4ade80]"
                : "text-white/25 hover:text-white/60 hover:bg-white/[0.06]"
            )}
            title={isSelected ? "Deselect" : "Select"}
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(card)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors"
            title="Edit card"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicate(card)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(card.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        {card.type === "cloze" ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Cloze Text</p>
            <ClozePreview text={card.clozeText || card.front} />
          </div>
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => setFlipped(!flipped)}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                {flipped ? "Answer" : "Question"} — click to flip
              </p>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-white/20 transition-transform",
                  flipped && "rotate-180"
                )}
              />
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              {flipped ? card.back : card.front}
            </p>
          </div>
        )}

        {/* Explanation */}
        {card.explanation && (
          <details className="mt-3 group">
            <summary className="text-[10px] font-bold uppercase tracking-widest text-white/20 cursor-pointer hover:text-white/40 transition-colors list-none flex items-center gap-1">
              <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
              Why this matters
            </summary>
            <p className="mt-2 text-xs text-white/45 leading-relaxed pl-4 border-l border-white/[0.06]">
              {card.explanation}
            </p>
          </details>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.05] bg-white/[0.015]">
        <div className="flex items-center gap-2">
          <Layers className="w-3 h-3 text-white/20" />
          <span className="text-[10px] text-white/30 font-mono truncate max-w-[200px]">
            {card.deck}
          </span>
        </div>
        {card.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-white/20" />
            <span className="text-[10px] text-white/25">
              {card.tags.slice(0, 2).join(", ")}
              {card.tags.length > 2 && ` +${card.tags.length - 2}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneratedCards({
  cards,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleSelect,
  selectedIds,
}: GeneratedCardsProps) {
  const allSelected = cards.length > 0 && selectedIds.size === cards.length;

  const handleSelectAll = () => {
    if (allSelected) {
      cards.forEach((c) => selectedIds.has(c.id) && onToggleSelect(c.id));
    } else {
      cards.forEach((c) => !selectedIds.has(c.id) && onToggleSelect(c.id));
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-white">
            {cards.length} cards generated
          </h3>
          <p className="text-sm text-white/40">
            Review and edit before saving · Click a card to flip it
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/30">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleSelectAll}
            className="text-sm text-[#4ade80]/70 hover:text-[#4ade80] transition-colors font-medium"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onToggleSelect={onToggleSelect}
            isSelected={selectedIds.has(card.id)}
          />
        ))}
      </div>
    </div>
  );
}
