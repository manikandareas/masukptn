"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { PracticeCatalogTreeNode } from "@/features/practice/types";

type PracticeCatalogTreeProps = {
  data: PracticeCatalogTreeNode[];
  className?: string;
  selectedId?: string;
  onSelect?: (nodeId: string) => void;
};

type PracticeCatalogTreeItemProps = {
  node: PracticeCatalogTreeNode;
  depth: number;
  selectedId?: string;
  onSelect?: (nodeId: string) => void;
};

function PracticeCatalogTreeItem({
  node,
  depth,
  selectedId,
  onSelect,
}: PracticeCatalogTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isExam = node.type === "exam";
  const children = node.children ?? [];
  const hasChildren = isExam && children.length > 0;
  const isSelected = selectedId === node.id;
  const isActive = isHovered || isSelected;

  const handleClick = () => {
    if (isExam) {
      setIsOpen(!isOpen);
    }
    onSelect?.(node.id);
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "group relative flex items-center gap-2 rounded-md border border-transparent px-2 py-1",
          "transition-all duration-200 ease-out",
          isSelected
            ? "border-border/60 bg-accent/40"
            : isHovered && "bg-muted/60",
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {depth > 0 && (
          <div
            className="absolute bottom-0 left-0 top-0 flex"
            style={{ left: `${(depth - 1) * 16 + 16}px` }}
          >
            <div
              className={cn(
                "w-px transition-colors duration-200",
                isActive ? "bg-primary/40" : "bg-border/50",
              )}
            />
          </div>
        )}

        <div
          className={cn(
            "flex h-3 w-3 items-center justify-center transition-transform duration-200 ease-out",
            isExam && isOpen && "rotate-90",
          )}
        >
          {isExam ? (
            <svg
              width="5"
              height="7"
              viewBox="0 0 6 8"
              fill="none"
              className={cn(
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <path
                d="M1 1L5 4L1 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span
              className={cn(
                "text-[10px] transition-opacity duration-200",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              ●
            </span>
          )}
        </div>

        <div
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded transition-all duration-200",
            isExam
              ? isActive
                ? "text-foreground scale-110"
                : "text-muted-foreground"
              : isHovered
                ? "text-foreground scale-110"
                : "text-muted-foreground/70",
          )}
        >
          {isExam ? (
            <svg width="14" height="12" viewBox="0 0 16 14" fill="currentColor">
              <path d="M1.5 1C0.671573 1 0 1.67157 0 2.5V11.5C0 12.3284 0.671573 13 1.5 13H14.5C15.3284 13 16 12.3284 16 11.5V4.5C16 3.67157 15.3284 3 14.5 3H8L6.5 1H1.5Z" />
            </svg>
          ) : (
            <svg
              width="12"
              height="14"
              viewBox="0 0 14 16"
              fill="currentColor"
              opacity="0.8"
            >
              <path d="M1.5 0C0.671573 0 0 0.671573 0 1.5V14.5C0 15.3284 0.671573 16 1.5 16H12.5C13.3284 16 14 15.3284 14 14.5V4.5L9.5 0H1.5Z" />
              <path d="M9 0V4.5H14" fill="currentColor" fillOpacity="0.5" />
            </svg>
          )}
        </div>

        <span
          className={cn(
            "font-mono text-xs transition-colors duration-200",
            isExam
              ? isHovered
                ? "text-foreground"
                : "text-foreground/90"
              : isHovered
                ? "text-foreground"
                : "text-muted-foreground",
            isSelected && "text-foreground",
          )}
        >
          {node.name}
        </span>

        <div
          className={cn(
            "absolute right-2 h-1 w-1 rounded-full bg-primary transition-all duration-200",
            isActive ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        />
      </div>

      {hasChildren && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            isOpen ? "opacity-100" : "h-0 opacity-0",
          )}
          style={{
            maxHeight: isOpen ? `${children.length * 32}px` : "0px",
          }}
        >
          {children.map((child) => (
            <PracticeCatalogTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PracticeCatalogTree({
  data,
  className,
  selectedId,
  onSelect,
}: PracticeCatalogTreeProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-card/70 p-3 font-mono",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2 border-b border-border/30 pb-3">
        <div className="flex gap-1.5">
          <div className="size-2 rounded-full bg-[oklch(0.65_0.2_25)]" />
          <div className="size-2 rounded-full bg-[oklch(0.75_0.18_85)]" />
          <div className="size-2 rounded-full bg-[oklch(0.65_0.18_150)]" />
        </div>
        <span className="ml-2 text-[10px] text-muted-foreground">Catalog</span>
      </div>

      <div className="space-y-0.5">
        {data.map((node) => (
          <PracticeCatalogTreeItem
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
