"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TutorialModal } from "@/features/tryout/components/tutorial-modal";
import {
  useBlueprintDetail,
  useCreateTryoutSession,
} from "@/features/tryout/hooks/use-tryout-session";

type BlueprintDetailPageProps = {
  blueprintId: string;
};

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  return `${minutes} min`;
}

export function BlueprintDetailPage({ blueprintId }: BlueprintDetailPageProps) {
  const router = useRouter();
  const { data: blueprint, isLoading, error } = useBlueprintDetail(blueprintId);
  const { mutateAsync: createSession, isPending } = useCreateTryoutSession();
  const [showTutorial, setShowTutorial] = useState(false);

  const handleStart = async () => {
    const response = await createSession({ blueprintId });
    if (response?.attemptId) {
      router.push(`/tryout/${response.attemptId}/countdown`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Loading blueprint details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
          <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load blueprint.{" "}
            <Link href="/tryout" className="underline">
              Return to selection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEmptyBlueprint = blueprint.totalQuestions === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
        <header className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">TRYOUT_BLUEPRINT</p>
          <h1 className="text-3xl font-semibold">{blueprint.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-[10px]">
              VERSION {blueprint.version}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {blueprint.totalQuestions} questions
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDuration(blueprint.totalDurationSeconds)}
            </span>
          </div>
        </header>

        {blueprint.description ? (
          <Card className="border-border/60 bg-card/70 p-6">
            <p className="text-xs font-mono text-muted-foreground">DESCRIPTION</p>
            <p className="mt-2 text-sm text-foreground">{blueprint.description}</p>
          </Card>
        ) : null}

        <Card className="border-border/60 bg-card/70 p-6">
          <p className="text-xs font-mono text-muted-foreground">SECTIONS</p>
          <div className="mt-4 space-y-3">
            {blueprint.sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center justify-between rounded border border-border/40 bg-background/40 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-mono">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{section.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {section.subtest?.code?.toUpperCase() ?? "SECTION"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{section.questionCount} soal</span>
                  <span>{formatDuration(section.durationSeconds)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/60 bg-card/70 p-6">
          <p className="text-xs font-mono text-muted-foreground">EXAM_CONDITIONS</p>
          <ul className="mt-3 space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">-</span>
              Each section is timed independently.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">-</span>
              You cannot return to previous sections once completed.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">-</span>
              A 30-second countdown precedes each section.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">-</span>
              Answers auto-submit when time expires.
            </li>
          </ul>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/tryout" className="mr-auto">
            <Button type="button" variant="ghost">
              Back to selection
            </Button>
          </Link>
          <Button type="button" variant="outline" onClick={() => setShowTutorial(true)}>
            View tutorial
          </Button>
          <Button
            type="button"
            onClick={handleStart}
            disabled={isPending || isEmptyBlueprint}
            className="font-mono"
          >
            {isPending ? "PREPARING..." : "START_TRYOUT"}
          </Button>
        </div>

        {isEmptyBlueprint ? (
          <div className="rounded border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
            This blueprint does not have any questions configured yet.
          </div>
        ) : null}
      </div>

      <TutorialModal open={showTutorial} onOpenChange={setShowTutorial} />
    </div>
  );
}
