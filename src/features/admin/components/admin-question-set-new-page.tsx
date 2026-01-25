"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import {
  QuestionSetForm,
  type QuestionSetFormValues,
} from "@/features/admin/components/question-set-form";
import {
  useAdminExams,
  useAdminSubtestsForSets,
} from "@/features/admin/hooks/use-question-sets";
import {
  useCreateQuestionSet,
  useUpdateQuestionSetItems,
} from "@/features/admin/hooks/use-question-set-mutations";

export function AdminQuestionSetNewPage() {
  const router = useRouter();
  const { data: exams = [], isLoading: examsLoading, error: examsError } = useAdminExams();
  const { data: subtests = [], isLoading: subtestsLoading } = useAdminSubtestsForSets();
  const createQuestionSet = useCreateQuestionSet();
  const updateQuestionSetItems = useUpdateQuestionSetItems();

  const handleSubmit = async (data: QuestionSetFormValues, questionIds: string[]) => {
    try {
      const result = await createQuestionSet.mutateAsync({
        examId: data.examId,
        subtestId: data.subtestId ?? null,
        name: data.name,
        description: data.description ?? null,
        status: "draft",
      });

      if (questionIds.length > 0) {
        await updateQuestionSetItems.mutateAsync({
          id: result.id,
          questionIds,
        });
      }

      toast.success("Question set created successfully");
      router.push(`/admin/question-sets/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create question set");
    }
  };

  const isLoading = examsLoading || subtestsLoading;
  const isSubmitting = createQuestionSet.isPending || updateQuestionSetItems.isPending;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            QUESTION_SET_MANAGEMENT
          </p>
          <h1 className="text-2xl font-semibold">New Question Set</h1>
          <p className="text-sm text-muted-foreground">
            Create a new curated question set for practice.
          </p>
        </header>

        {examsError ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              Failed to load exams. Please refresh the page.
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <QuestionSetForm
            exams={exams}
            subtests={subtests}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </AdminLayout>
  );
}
