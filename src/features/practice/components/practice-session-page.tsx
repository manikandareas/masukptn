"use client";

import { QuestionPlayer } from "@/features/practice/components/question-player";
import { usePracticeSession } from "@/features/practice/hooks/use-practice-session";

type PracticeSessionPageProps = {
  attemptId: string;
};

export function PracticeSessionPage({ attemptId }: PracticeSessionPageProps) {
  const { data, isLoading, error } = usePracticeSession(attemptId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        {isLoading && (
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Loading practice session...
          </div>
        )}

        {error && (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load practice session.
          </div>
        )}

        {data && <QuestionPlayer session={data} />}
      </div>
    </div>
  );
}
