"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { QuestionForm } from "@/features/admin/components/question-form";
import { useQuestionImport } from "@/features/admin/hooks/use-question-import";
import { useUpdateQuestionImportQuestion } from "@/features/admin/hooks/use-question-import-mutations";
import { useAdminSubtests } from "@/features/admin/hooks/use-questions";
import type { QuestionFormValues } from "@/features/admin/types";

export function AdminQuestionImportQuestionEditPage({
  importId,
  questionId,
}: {
  importId: string;
  questionId: string;
}) {
  const router = useRouter();
  const { data, isLoading, error } = useQuestionImport(importId);
  const { data: subtests = [], isLoading: subtestsLoading } = useAdminSubtests();
  const updateQuestion = useUpdateQuestionImportQuestion();

  const question = data?.questions?.find((item) => item.id === questionId);

  const handleSubmit = async (values: QuestionFormValues) => {
    try {
      await updateQuestion.mutateAsync({
        id: questionId,
        ...values,
      });
      toast.success("Draft question updated");
      router.push(`/admin/imports/${importId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update question");
    }
  };

  const questionFormData: (QuestionFormValues & { id: string; status: "draft" }) | undefined =
    question
      ? {
          id: question.id,
          status: "draft",
          subtestId: question.subtestId ?? "",
          questionType: question.questionType,
          stimulus: question.stimulus ?? "",
          stem: question.stem,
          options: question.options ?? ["", "", "", "", ""],
          complexOptions: question.complexOptions ?? [],
          answerKey: question.answerKey,
          explanation: question.explanation,
          difficulty: question.difficulty ?? "medium",
          topicTags: question.topicTags ?? [],
          sourceYear: question.sourceYear ?? null,
          sourceInfo: question.sourceInfo ?? "",
        }
      : undefined;

  const isLoadingState = isLoading || subtestsLoading;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            OCR_IMPORT_REVIEW
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Edit Draft Question</h1>
              <p className="text-sm text-muted-foreground">
                {data?.sourceFilename || "Import draft"}
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link href={`/admin/imports/${importId}`} />}>
              Back to Import
            </Button>
          </div>
        </header>

        {error ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              {error instanceof Error ? error.message : "Failed to load import"}
            </CardContent>
          </Card>
        ) : null}

        {isLoadingState ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : questionFormData ? (
          <QuestionForm
            question={questionFormData}
            subtests={subtests}
            onSubmit={handleSubmit}
            isSubmitting={updateQuestion.isPending}
          />
        ) : (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              Draft question not found.
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
