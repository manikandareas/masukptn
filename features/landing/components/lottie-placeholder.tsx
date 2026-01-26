"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import type { LottiePlaceholderProps } from "../types";

export function LottiePlaceholder({
  className,
  label = "Animation",
}: LottiePlaceholderProps) {
  return (
    <motion.div
      className={cn(
        "flex items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/50 p-4",
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <motion.div
          className="h-12 w-12 rounded-full bg-muted-foreground/20"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs font-mono uppercase tracking-wider">
          {label}
        </span>
      </div>
    </motion.div>
  );
}
