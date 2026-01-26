"use client";

import { TryoutPlayer } from "@/features/tryout/components/tryout-player";
import { useTryoutSession } from "@/features/tryout/hooks/use-tryout-session";

type TryoutSessionPageProps = {
  attemptId: string;
};

export function TryoutSessionPage({ attemptId }: TryoutSessionPageProps) {
  const { data, isLoading, error } = useTryoutSession(attemptId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        {isLoading ? (
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Loading tryout session...
          </div>
        ) : null}

        {error ? (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load tryout session.
          </div>
        ) : null}

        {data ? <TryoutPlayer session={data} /> : null}
      </div>
    </div>
  );
}
