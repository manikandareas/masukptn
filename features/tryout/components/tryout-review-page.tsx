"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ReviewPlayer } from "@/features/tryout/components/review-player";
import { useTryoutSession } from "@/features/tryout/hooks/use-tryout-session";

type TryoutReviewPageProps = {
  attemptId: string;
};

export function TryoutReviewPage({ attemptId }: TryoutReviewPageProps) {
  const router = useRouter();
  const { data, isLoading, error } = useTryoutSession(attemptId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">REVIEW_MODE</p>
          <h1 className="text-3xl font-semibold">Tryout review</h1>
          <p className="text-sm text-muted-foreground">
            Review every question with explanations after finishing the tryout.
          </p>
          <Button type="button" variant="outline" onClick={() => router.push(`/tryout/${attemptId}/results`)}>
            Back to results
          </Button>
        </header>

        {isLoading ? (
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Loading review...
          </div>
        ) : null}

        {error ? (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load tryout review.
          </div>
        ) : null}

        {data ? <ReviewPlayer session={data} /> : null}
      </div>
    </div>
  );
}
