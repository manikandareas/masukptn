"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import {
  QuestionSetForm,
  type QuestionInSet,
  type QuestionSetFormValues,
} from "@/features/admin/components/question-set-form";
import { useQuestionSet } from "@/features/admin/hooks/use-question-set";
import {
  useAdminExams,
  useAdminSubtestsForSets,
} from "@/features/admin/hooks/use-question-sets";
import {
  useDeleteQuestionSet,
  usePublishQuestionSet,
  useUnpublishQuestionSet,
  useUpdateQuestionSet,
  useUpdateQuestionSetItems,
} from "@/features/admin/hooks/use-question-set-mutations";

type AdminQuestionSetEditPageProps = {
  id: string;
};

export function AdminQuestionSetEditPage({ id }: AdminQuestionSetEditPageProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: questionSet,
    isLoading: questionSetLoading,
    error: questionSetError,
  } = useQuestionSet(id);
  const { data: exams = [], isLoading: examsLoading } = useAdminExams();
  const { data: subtests = [], isLoading: subtestsLoading } = useAdminSubtestsForSets();

  const updateQuestionSet = useUpdateQuestionSet();
  const updateQuestionSetItems = useUpdateQuestionSetItems();
  const deleteQuestionSet = useDeleteQuestionSet();
  const publishQuestionSet = usePublishQuestionSet();
  const unpublishQuestionSet = useUnpublishQuestionSet();

  const handleSubmit = async (data: QuestionSetFormValues, questionIds: string[]) => {
    try {
      await updateQuestionSet.mutateAsync({
        id,
        examId: data.examId,
        subtestId: data.subtestId ?? null,
        name: data.name,
        description: data.description ?? null,
      });

      await updateQuestionSetItems.mutateAsync({
        id,
        questionIds,
      });

      toast.success("Question set updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update question set");
    }
  };

  const handlePublish = async () => {
    if (!questionSet) return;

    const questionCount = questionSet.questions?.length ?? 0;
    if (questionCount === 0) {
      toast.error("Cannot publish an empty question set. Add at least one question.");
      return;
    }

    try {
      await publishQuestionSet.mutateAsync(id);
      toast.success("Question set published successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish question set");
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishQuestionSet.mutateAsync(id);
      toast.success("Question set unpublished successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unpublish question set");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteQuestionSet.mutateAsync(id);
      toast.success("Question set deleted successfully");
      router.push("/admin/question-sets");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete question set");
    }
  };

  const questionSetFormData = questionSet
    ? {
        id: questionSet.id,
        name: questionSet.name,
        description: questionSet.description ?? "",
        examId: questionSet.examId,
        subtestId: questionSet.subtestId,
        status: questionSet.status,
        questions:
          questionSet.questions?.map((item): QuestionInSet => ({
            id: item.question.id,
            stem: item.question.stem,
            questionType: item.question.questionType,
            difficulty: item.question.difficulty ?? "medium",
            status: item.question.status,
            createdAt: item.question.createdAt,
            subtest: {
              id: item.question.subtest.id,
              code: item.question.subtest.code,
              name: item.question.subtest.name,
            },
            sortOrder: item.sortOrder,
          })) ?? [],
      }
    : undefined;

  const isLoading = questionSetLoading || examsLoading || subtestsLoading;
  const isSubmitting = updateQuestionSet.isPending || updateQuestionSetItems.isPending;
  const isPublishing = publishQuestionSet.isPending || unpublishQuestionSet.isPending;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6 mx-auto max-w-4xl">
        <header className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            QUESTION_SET_MANAGEMENT
          </p>
          <h1 className="text-2xl font-semibold">Edit Question Set</h1>
          <p className="text-sm text-muted-foreground">
            Update question set content and manage questions.
          </p>
        </header>

        {questionSetError ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              {questionSetError instanceof Error && questionSetError.message === "Question set not found"
                ? "Question set not found. It may have been deleted."
                : "Failed to load question set. Please try again."}
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
        ) : questionSetFormData ? (
          <QuestionSetForm
            questionSet={questionSetFormData}
            exams={exams}
            subtests={subtests}
            onSubmit={handleSubmit}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onDelete={async () => setShowDeleteDialog(true)}
            isSubmitting={isSubmitting}
            isPublishing={isPublishing}
          />
        ) : null}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question Set</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question set? This action cannot be undone.
              {questionSet?.status === "published" ? (
                <span className="mt-2 block text-destructive">
                  Warning: This question set is currently published.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
