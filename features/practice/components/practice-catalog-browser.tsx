"use client";

import { Badge } from "@/components/ui/badge";
import { PracticeCatalogTree } from "@/features/practice/components/practice-catalog-tree";
import { usePracticeCatalogSelection } from "@/features/practice/hooks/use-practice-catalog-selection";
import type {
  PracticeCatalog,
  PracticeCatalogSearch,
} from "@/features/practice/types";

type PracticeCatalogBrowserProps = {
  catalog: PracticeCatalog;
  search: PracticeCatalogSearch;
  onSelectSet: (questionSetId: string) => void;
};

export function PracticeCatalogBrowser({
  catalog,
  search,
  onSelectSet,
}: PracticeCatalogBrowserProps) {
  const {
    treeData,
    selectedNodeId,
    activeExam,
    activeSubtest,
    visibleSets,
    handleSelectNode,
  } = usePracticeCatalogSelection({ catalog, search });

  if (catalog.exams.length === 0) {
    return (
      <div className="rounded border border-border/60 bg-card/60 p-6 text-sm text-muted-foreground">
        No practice sets available yet.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground">CATEGORIES</p>
          <h2 className="text-sm font-semibold text-foreground">
            Exam & Subtest
          </h2>
        </div>
        <PracticeCatalogTree
          data={treeData}
          selectedId={selectedNodeId}
          onSelect={handleSelectNode}
        />
      </aside>

      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {activeSubtest
                ? `Subtest: ${activeSubtest.name}`
                : "All subtests"}
            </p>
            <h2 className="text-sm font-semibold text-foreground">
              {activeExam?.name ?? "Exam"}
            </h2>
          </div>
          <div className="text-xs text-muted-foreground">
            {visibleSets.length} sets
          </div>
        </div>

        {visibleSets.length === 0 ? (
          <div className="rounded border border-border/60 bg-card/60 p-6 text-sm text-muted-foreground">
            No published question sets for this selection yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleSets.map((set) => {
              const hasQuestions = set.questionCount > 0;
              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => onSelectSet(set.id)}
                  disabled={!hasQuestions}
                  className="flex h-full flex-col gap-3 rounded border border-border/60 bg-card/70 p-4 text-left transition hover:border-primary/60 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border/60 disabled:hover:bg-card/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-xs font-mono text-muted-foreground">
                      {set.subtest?.code?.toUpperCase() ?? "MIXED"}
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {set.questionCount} SOAL
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {set.name}
                    </h3>
                    {set.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {set.description}
                      </p>
                    )}
                    {!hasQuestions && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        No published questions yet.
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
