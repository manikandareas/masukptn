"use client";

import type { TryoutSessionItem } from "@/features/tryout/types";

type TryoutPaletteProps = {
  items: TryoutSessionItem[];
  activeIndex: number;
  onJump: (index: number) => void;
};

export function TryoutPalette({
  items,
  activeIndex,
  onJump,
}: TryoutPaletteProps) {
  return (
    <div className="grid grid-cols-5 h-fit gap-2 sm:grid-cols-8">
      {items.map((item, index) => {
        const isAnswered = Boolean(item.answeredAt);
        const isActive = index === activeIndex;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onJump(index)}
            className={`h-9 rounded border text-xs font-mono transition ${
              isAnswered
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border/60 bg-background/40 text-muted-foreground"
            } ${isActive ? "ring-2 ring-primary/70" : "hover:border-primary/40"}`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
