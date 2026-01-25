"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { ResultsBreakdown } from "@/features/tryout/components/results-breakdown";
import {
  useCalculateTryoutResults,
  useTryoutSession,
} from "@/features/tryout/hooks/use-tryout-session";

type TryoutResultsPageProps = {
  attemptId: string;
};

export function TryoutResultsPage({ attemptId }: TryoutResultsPageProps) {
  const router = useRouter();
  const { data, isLoading, error } = useTryoutSession(attemptId);
  const { mutateAsync, isPending } = useCalculateTryoutResults(attemptId);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!data || data.status === "completed" || completedRef.current) {
      return;
    }
    completedRef.current = true;
    void mutateAsync({ attemptId });
  }, [attemptId, data, mutateAsync]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
        <header className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">TRYOUT_COMPLETE</p>
          <h1 className="text-3xl font-semibold">Tryout results</h1>
          <p className="text-sm text-muted-foreground">
            Review your section performance and continue to explanations.
          </p>
        </header>

        {isLoading ? (
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Loading results...
          </div>
        ) : null}

        {error ? (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load tryout results.
          </div>
        ) : null}

        {isPending ? (
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Finalizing tryout results...
          </div>
        ) : null}

        {data?.results ? (
          <ResultsBreakdown
            results={data.results}
            sections={data.blueprint.sections}
            onReview={() => router.push(`/tryout/${attemptId}/review`)}
            onRestart={() => router.push("/tryout")}
          />
        ) : null}
      </div>
    </div>
  );
}
