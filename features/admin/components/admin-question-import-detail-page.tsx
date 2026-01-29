"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { AdminLayout } from "@/features/admin/components/admin-layout";
import { useQuestionImport } from "@/features/admin/hooks/use-question-import";
import {
  useDeleteQuestionImport,
  useFinalizeQuestionImport,
  useProcessQuestionImport,
  useUpdateQuestionImport,
} from "@/features/admin/hooks/use-question-import-mutations";
import { useAdminExams } from "@/features/admin/hooks/use-question-sets";
import { useAdminSubtests } from "@/features/admin/hooks/use-questions";
import {
  questionImportFormSchema,
  type QuestionImportFormData,
} from "@/features/admin/types";

const statusBadgeVariant: Record<
  "queued" | "processing" | "ready" | "failed" | "saved",
  "default" | "secondary" | "outline" | "destructive"
> = {
  queued: "outline",
  processing: "secondary",
  ready: "default",
  failed: "destructive",
  saved: "secondary",
};

function truncateText(value: string, maxLength = 80) {
  const plainText = value
    .replace(/[#*_`~\[\]()]/g, "")
    .replace(/\n/g, " ")
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength)}...`;
}

export function AdminQuestionImportDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data, isLoading, error } = useQuestionImport(id);
  const { data: exams = [] } = useAdminExams();
  const { data: subtests = [] } = useAdminSubtests();

  const updateImport = useUpdateQuestionImport();
  const processImport = useProcessQuestionImport();
  const finalizeImport = useFinalizeQuestionImport();
  const deleteImport = useDeleteQuestionImport();

  const form = useForm<QuestionImportFormData>({
    resolver: zodResolver(questionImportFormSchema),
    defaultValues: {
      examId: "",
      subtestId: null,
      name: "",
      description: "",
    },
  });
  const selectedExamId = useWatch({ control: form.control, name: "examId" });
  const selectedSubtestId = useWatch({
    control: form.control,
    name: "subtestId",
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      examId: data.draftExamId ?? "",
      subtestId: data.draftSubtestId ?? null,
      name: data.draftName ?? "",
      description: data.draftDescription ?? "",
    });
  }, [data, form]);

  const handleUpdate = form.handleSubmit(async (values) => {
    try {
      await updateImport.mutateAsync({
        id,
        examId: values.examId,
        subtestId: values.subtestId ?? null,
        name: values.name,
        description: values.description ?? null,
      });
      toast.success("Draft metadata updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update import");
    }
  });

  const handleProcess = async () => {
    try {
      await processImport.mutateAsync(id);
      toast.success("Processing started");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process import");
    }
  };

  const handleFinalize = async () => {
    try {
      const result = await finalizeImport.mutateAsync(id);
      toast.success("Questions saved to bank");
      router.push(`/admin/question-sets/${result.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to finalize import");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteImport.mutateAsync(id);
      toast.success("Import deleted");
      router.push("/admin/imports");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete import");
    }
  };

  const importStatus = data?.status ?? "queued";
  const questions = data?.questions ?? [];
  const missingSubtestCount = questions.filter(
    (q) => !q.subtestId && !data?.draftSubtestId,
  ).length;
  const canFinalize =
    importStatus === "ready" &&
    questions.length > 0 &&
    missingSubtestCount === 0;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            OCR_IMPORT_REVIEW
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Review Import</h1>
              <p className="text-sm text-muted-foreground">
                {data?.sourceFilename || "PDF import"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusBadgeVariant[importStatus]}>
                {importStatus}
              </Badge>
              {importStatus === "queued" && (
                <Button size="sm" variant="outline" disabled>
                  Queued...
                </Button>
              )}
              {importStatus === "processing" && (
                <Button size="sm" variant="outline" disabled>
                  Processing...
                </Button>
              )}
              {importStatus === "failed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleProcess}
                  disabled={processImport.isPending}
                >
                  {processImport.isPending ? "Processing..." : "Retry Processing"}
                </Button>
              )}
              {importStatus === "ready" && (
                <Button
                  size="sm"
                  onClick={handleFinalize}
                  disabled={!canFinalize || finalizeImport.isPending}
                >
                  {finalizeImport.isPending ? "Saving..." : "Save to Bank"}
                </Button>
              )}
              {importStatus === "saved" && data?.savedQuestionSetId && (
                <Button size="sm" variant="outline" render={
                  <Link href={`/admin/question-sets/${data.savedQuestionSetId}`} />
                }>
                  View Question Set
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteImport.isPending}
              >
                Delete Import
              </Button>
            </div>
          </div>
        </header>

        {error ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              {error instanceof Error ? error.message : "Failed to load import"}
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data ? (
          <>
            {data.errorMessage ? (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="py-4 text-xs text-destructive">
                  {data.errorMessage}
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardContent className="py-5">
                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Question Set Name</FieldLabel>
                      <Input {...form.register("name")} />
                      {form.formState.errors.name ? (
                        <FieldError>{form.formState.errors.name.message}</FieldError>
                      ) : null}
                    </Field>
                    <Field>
                      <FieldLabel>Description</FieldLabel>
                      <Textarea rows={3} {...form.register("description")} />
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel>Exam</FieldLabel>
                      <Select
                        value={selectedExamId ?? ""}
                        onValueChange={(value) =>
                          form.setValue("examId", value ?? "", { shouldValidate: true })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((exam) => (
                            <SelectItem key={exam.id} value={exam.id}>
                              {exam.code.toUpperCase()} - {exam.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.examId ? (
                        <FieldError>{form.formState.errors.examId.message}</FieldError>
                      ) : null}
                    </Field>
                    <Field>
                      <FieldLabel>Subtest (optional)</FieldLabel>
                      <Select
                        value={selectedSubtestId ?? ""}
                        onValueChange={(value) =>
                          form.setValue("subtestId", value || null, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subtest" />
                        </SelectTrigger>
                        <SelectContent>
                          {subtests
                            .filter((subtest) =>
                              selectedExamId
                                ? subtest.exam?.id === selectedExamId
                                : true,
                            )
                            .map((subtest) => (
                              <SelectItem key={subtest.id} value={subtest.id}>
                                {subtest.code.toUpperCase()} - {subtest.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>

                  <div className="flex justify-end">
                    <Button size="sm" type="submit" disabled={updateImport.isPending}>
                      {updateImport.isPending ? "Saving..." : "Update Draft"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {data.ocrText ? (
              <Card>
                <CardContent className="py-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium">OCR Preview</h2>
                    <Badge variant="outline" className="text-[10px]">
                      {data.ocrMetadata?.pageCount ?? 0} pages
                      {data.ocrMetadata?.imageCount
                        ? ` / ${data.ocrMetadata.imageCount} images`
                        : ""}
                    </Badge>
                  </div>
                  <Textarea
                    readOnly
                    className="mt-3 min-h-[160px] text-xs"
                    value={data.ocrText}
                  />
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium">Generated Questions</h2>
                    <p className="text-[11px] text-muted-foreground">
                      {questions.length} question(s)
                    </p>
                  </div>
                  {missingSubtestCount > 0 ? (
                    <Badge variant="destructive" className="text-[10px]">
                      {missingSubtestCount} missing subtest
                    </Badge>
                  ) : null}
                </div>

                {questions.length === 0 ? (
                  <p className="mt-4 text-xs text-muted-foreground">
                    No questions generated yet.
                  </p>
                ) : (
                  <div className="mt-4 border border-border/60">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[55%]">Question</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Subtest</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {questions.map((question) => (
                          <TableRow key={question.id}>
                            <TableCell className="text-[11px]">
                              {truncateText(question.stem)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">
                                {question.questionType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {question.subtest ? (
                                <Badge variant="secondary" className="text-[10px]">
                                  {question.subtest.code}
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px]">
                                  Unassigned
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">
                                {question.difficulty ?? "medium"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                render={
                                  <Link
                                    href={`/admin/imports/${id}/questions/${question.id}`}
                                  />
                                }
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Import</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this import? This will remove the source
              PDF and OCR images. This action cannot be undone.
              {data?.savedQuestionSetId ? (
                <span className="mt-2 block text-muted-foreground">
                  This import was already saved. Deleting it will not delete the question
                  set.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteImport.isPending}
            >
              {deleteImport.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
