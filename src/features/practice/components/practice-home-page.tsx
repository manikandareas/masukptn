"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PracticeCatalogBrowser } from "@/features/practice/components/practice-catalog-browser";
import { usePracticeCatalog } from "@/features/practice/hooks/use-practice-session";
import type { PracticeCatalogSearch } from "@/features/practice/types";

export function PracticeHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, error } = usePracticeCatalog();

  const search = useMemo<PracticeCatalogSearch>(
    () => ({
      exam: searchParams.get("exam") ?? undefined,
      subtest: searchParams.get("subtest") ?? undefined,
    }),
    [searchParams],
  );

  const handleSelectSet = (questionSetId: string) => {
    router.push(`/practice/set/${questionSetId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto flex flex-col gap-8 px-4 py-12">
        <header className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">PRACTICE_MODE</p>
          <h1 className="text-3xl font-semibold">Select a question set</h1>
          <p className="text-sm text-muted-foreground">
            Choose a fixed set and start practicing with instant feedback.
          </p>
        </header>

        {isLoading && (
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Loading question sets...
          </div>
        )}

        {error && (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load practice catalog.
          </div>
        )}

        {data && (
          <PracticeCatalogBrowser catalog={data} search={search} onSelectSet={handleSelectSet} />
        )}
      </div>
    </div>
  );
}
