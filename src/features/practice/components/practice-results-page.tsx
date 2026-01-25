"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { ResultsSummary } from "@/features/practice/components/results-summary";
import {
  useCompletePracticeSession,
  usePracticeSession,
} from "@/features/practice/hooks/use-practice-session";
import { calculatePracticeResults } from "@/features/practice/utils/calculate-results";

type PracticeResultsPageProps = {
  attemptId: string;
};

export function PracticeResultsPage({ attemptId }: PracticeResultsPageProps) {
  const router = useRouter();
  const { data, isLoading, error } = usePracticeSession(attemptId);
  const { mutateAsync, isPending } = useCompletePracticeSession(attemptId);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!data || data.status === "completed" || completedRef.current) return;
    completedRef.current = true;
    const { results, totalTimeSeconds } = calculatePracticeResults(data);
    void mutateAsync({ attemptId, totalTimeSeconds, results });
  }, [attemptId, data, mutateAsync]);

  const handleRestart = () => {
    router.push("/practice");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
        <header className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">SESSION_COMPLETE</p>
          <h1 className="text-3xl font-semibold">Practice results</h1>
          <p className="text-sm text-muted-foreground">
            Review your accuracy and decide your next step.
          </p>
        </header>

        {isLoading && (
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Loading results...
          </div>
        )}

        {error && (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load practice results.
          </div>
        )}

        {isPending && (
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Finalizing session...
          </div>
        )}

        {data && <ResultsSummary session={data} onRestart={handleRestart} />}
      </div>
    </div>
  );
}
