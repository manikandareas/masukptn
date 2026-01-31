"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { QuestionForm } from "@/features/admin/components/question-form";
import { useAdminSubtests } from "@/features/admin/hooks/use-questions";
import { useCreateQuestion } from "@/features/admin/hooks/use-question-mutations";
import type { QuestionFormValues } from "@/features/admin/types";

export function AdminQuestionNewPage() {
  const router = useRouter();
  const {
    data: subtests = [],
    isLoading: subtestsLoading,
    error: subtestsError,
  } = useAdminSubtests();
  const createQuestion = useCreateQuestion();

  const handleSubmit = async (data: QuestionFormValues) => {
    try {
      const result = await createQuestion.mutateAsync({
        subtestId: data.subtestId,
        questionType: data.questionType,
        stimulus: data.stimulus || null,
        stem: data.stem,
        options: data.options || null,
        complexOptions: data.complexOptions || null,
        answerKey: data.answerKey,
        explanation: data.explanation,
        difficulty: data.difficulty,
        topicTags: data.topicTags,
        sourceYear: data.sourceYear ?? null,
        sourceInfo: data.sourceInfo || null,
        status: "draft",
      });

      toast.success("Question created successfully");
      router.push(`/admin/questions/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create question");
    }
  };

  const subtestOptions = subtests.map((subtest) => ({
    id: subtest.id,
    code: subtest.code,
    name: subtest.name,
    exam:
      subtest.exam ?? {
        id: "",
        code: "",
        name: subtest.examName ?? "",
      },
  }));

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        <header className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            QUESTION_MANAGEMENT
          </p>
          <h1 className="text-2xl font-semibold">New Question</h1>
          <p className="text-sm text-muted-foreground">
            Create a new question for the question bank.
          </p>
        </header>

        {subtestsError ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              Failed to load subtests. Please refresh the page.
            </CardContent>
          </Card>
        ) : null}

        {subtestsLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <QuestionForm
            subtests={subtestOptions}
            onSubmit={handleSubmit}
            isSubmitting={createQuestion.isPending}
          />
        )}
      </div>
    </AdminLayout>
  );
}
