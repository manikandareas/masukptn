"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useCreatePracticeSession,
  usePracticeCatalog,
} from "@/features/practice/hooks/use-practice-session";
import type { PracticeCatalog } from "@/features/practice/types";

type PracticeSetDetailPageProps = {
  questionSetId: string;
};

type PracticeSelection = {
  exam: PracticeCatalog["exams"][number];
  questionSet: PracticeCatalog["exams"][number]["questionSets"][number];
};

export function PracticeSetDetailPage({ questionSetId }: PracticeSetDetailPageProps) {
  const router = useRouter();
  const { data, isLoading } = usePracticeCatalog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeMode, setTimeMode] = useState<"relaxed" | "timed">("relaxed");
  const { mutateAsync, isPending, error } = useCreatePracticeSession();

  let selection: PracticeSelection | null = null;
  if (data) {
    for (const exam of data.exams) {
      const questionSet = exam.questionSets.find((item) => item.id === questionSetId);
      if (questionSet) {
        selection = { exam, questionSet };
        break;
      }
    }
  }

  const errorMessage = error instanceof Error ? error.message : null;

  const handleStart = async () => {
    if (!selection) return;
    const result = await mutateAsync({
      questionSetId: selection.questionSet.id,
      timeMode,
    });

    if (result?.attemptId) {
      setDialogOpen(false);
      router.push(`/practice/${result.attemptId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Loading question set...
          </div>
        </div>
      </div>
    );
  }

  if (!selection) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Question set not found. <Link href="/practice" className="text-primary underline">Return to selection</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
        <header className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">QUESTION_SET</p>
          <h1 className="text-3xl font-semibold">{selection.questionSet.name}</h1>
          <p className="text-sm text-muted-foreground">{selection.exam.name}</p>
        </header>

        <div className="rounded border border-border/60 bg-card/70 p-6">
          <div className="space-y-3">
            <div className="text-xs font-mono text-muted-foreground">
              {selection.questionSet.subtest?.code.toUpperCase() ?? "MIXED"}
            </div>
            <p className="text-sm text-foreground">
              {selection.questionSet.description ?? "No description available."}
            </p>
            <p className="text-xs text-muted-foreground">
              Total questions: {selection.questionSet.questionCount}. This set runs in fixed order.
            </p>
            {selection.questionSet.questionCount === 0 && (
              <p className="text-xs text-muted-foreground">
                This set does not have published questions yet.
              </p>
            )}
          </div>
        </div>

        <div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="font-mono"
            disabled={selection.questionSet.questionCount === 0}
          >
            START_PRACTICE
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose practice mode</DialogTitle>
            <DialogDescription>
              Relaxed mode lets you work at your own pace. Timed mode sets a time limit automatically based on the question count.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label className="text-xs font-mono">MODE</Label>
            <RadioGroup
              value={timeMode}
              onValueChange={(value) => setTimeMode(value as "relaxed" | "timed")}
              className="grid gap-2"
            >
              <label className="flex items-center gap-2 text-xs">
                <RadioGroupItem value="relaxed" />
                RELAXED
              </label>
              <label className="flex items-center gap-2 text-xs">
                <RadioGroupItem value="timed" />
                TIMED
              </label>
            </RadioGroup>
          </div>

          {errorMessage && (
            <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              CANCEL
            </Button>
            <Button
              onClick={handleStart}
              disabled={isPending || selection.questionSet.questionCount === 0}
            >
              {isPending ? "STARTING..." : "START"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
