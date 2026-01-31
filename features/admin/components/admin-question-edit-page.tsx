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
import { QuestionForm } from "@/features/admin/components/question-form";
import { useAdminSubtests } from "@/features/admin/hooks/use-questions";
import {
  useDeleteQuestion,
  usePublishQuestion,
  useUnpublishQuestion,
  useUpdateQuestion,
} from "@/features/admin/hooks/use-question-mutations";
import { useQuestion } from "@/features/admin/hooks/use-question";
import type { QuestionFormValues, QuestionType } from "@/features/admin/types";
import { validateForPublish } from "@/features/admin/types";

type AdminQuestionEditPageProps = {
  id: string;
};

export function AdminQuestionEditPage({ id }: AdminQuestionEditPageProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: question,
    isLoading: questionLoading,
    error: questionError,
  } = useQuestion(id);
  const { data: subtests = [], isLoading: subtestsLoading } = useAdminSubtests();

  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const publishQuestion = usePublishQuestion();
  const unpublishQuestion = useUnpublishQuestion();

  const handleSubmit = async (data: QuestionFormValues) => {
    try {
      await updateQuestion.mutateAsync({
        id,
        ...data,
        sourceYear: data.sourceYear ?? undefined,
      });
      toast.success("Question updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update question");
    }
  };

  const handlePublish = async () => {
    if (!question || !questionFormData) return;

    const validation = validateForPublish(questionFormData);

    if (!validation.valid) {
      if (validation.errors.length === 1) {
        toast.error(validation.errors[0]);
      } else {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-medium">Cannot publish question:</span>
            <ul className="list-inside list-disc text-xs">
              {validation.errors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>,
        );
      }
      return;
    }

    try {
      await publishQuestion.mutateAsync(id);
      toast.success("Question published successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish question");
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishQuestion.mutateAsync(id);
      toast.success("Question unpublished successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unpublish question");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteQuestion.mutateAsync(id);
      toast.success("Question deleted successfully");
      router.push("/admin/questions");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete question");
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

  const questionFormData = question
    ? {
        id: question.id,
        subtestId: question.subtestId,
        questionType: question.questionType as QuestionType,
        stimulus: question.stimulus ?? "",
        stem: question.stem,
        options: question.options ?? ["", "", "", "", ""],
        complexOptions: question.complexOptions ?? [],
        answerKey: question.answerKey,
        explanation:
          question.explanation ?? { level1: "", level1WrongOptions: {}, level2: [] },
        difficulty: question.difficulty ?? "medium",
        topicTags: question.topicTags ?? [],
        sourceYear: question.sourceYear ?? undefined,
        sourceInfo: question.sourceInfo ?? "",
        status: question.status,
      }
    : undefined;

  const isLoading = questionLoading || subtestsLoading;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        <header className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            QUESTION_MANAGEMENT
          </p>
          <h1 className="text-2xl font-semibold">Edit Question</h1>
          <p className="text-sm text-muted-foreground">Update question content and settings.</p>
        </header>

        {questionError ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              {questionError instanceof Error && questionError.message === "Question not found"
                ? "Question not found. It may have been deleted."
                : "Failed to load question. Please try again."}
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : questionFormData ? (
          <QuestionForm
            question={questionFormData}
            subtests={subtestOptions}
            onSubmit={handleSubmit}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onDelete={async () => setShowDeleteDialog(true)}
            isSubmitting={updateQuestion.isPending}
            isPublishing={publishQuestion.isPending || unpublishQuestion.isPending}
          />
        ) : null}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
              {question?.status === "published" ? (
                <span className="mt-2 block text-destructive">
                  Warning: This question is currently published.
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
