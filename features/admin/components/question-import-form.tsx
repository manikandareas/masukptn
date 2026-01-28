"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  questionImportFormSchema,
  type QuestionImportFormData,
} from "@/features/admin/types";

export type ImportExamOption = {
  id: string;
  code: string;
  name: string;
};

export type ImportSubtestOption = {
  id: string;
  code: string;
  name: string;
  exam?: {
    id: string;
    code: string;
    name: string;
  };
};

interface QuestionImportFormProps {
  exams: ImportExamOption[];
  subtests: ImportSubtestOption[];
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function QuestionImportForm({
  exams,
  subtests,
  onSubmit,
  isSubmitting = false,
}: QuestionImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const form = useForm<QuestionImportFormData>({
    resolver: zodResolver(questionImportFormSchema),
    defaultValues: {
      examId: "",
      subtestId: null,
      name: "",
      description: "",
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = form;

  const examId = useWatch({ control, name: "examId" });
  const subtestId = useWatch({ control, name: "subtestId" });
  const nameValue = useWatch({ control, name: "name" });

  const filteredSubtests = examId
    ? subtests.filter((subtest) => subtest.exam?.id === examId)
    : [];

  useEffect(() => {
    if (!examId) {
      setValue("subtestId", null);
    }
  }, [examId, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setFileError(null);

    if (selected && !nameValue) {
      const baseName = selected.name.replace(/\.[^/.]+$/, "");
      setValue("name", baseName, { shouldValidate: true });
    }
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!file) {
      setFileError("PDF file is required");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("examId", data.examId);
    formData.append("subtestId", data.subtestId ?? "");
    formData.append("name", data.name);
    formData.append("description", data.description ?? "");

    await onSubmit(formData);
  });

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel>PDF Document</FieldLabel>
          <Input type="file" accept="application/pdf" onChange={handleFileChange} />
          <FieldDescription>Upload PDF question document (max 20MB).</FieldDescription>
          {fileError ? <FieldError>{fileError}</FieldError> : null}
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel>Exam</FieldLabel>
          <Select
            value={examId || ""}
            onValueChange={(value) => setValue("examId", value ?? "", { shouldValidate: true })}
            disabled={isSubmitting}
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
          {errors.examId ? <FieldError>{errors.examId.message}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel>Subtest (optional)</FieldLabel>
          <Select
            value={subtestId ?? ""}
            onValueChange={(value) =>
              setValue("subtestId", value || null, { shouldValidate: true })
            }
            disabled={!examId || isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder={examId ? "Select subtest" : "Select exam first"} />
            </SelectTrigger>
            <SelectContent>
              {filteredSubtests.map((subtest) => (
                <SelectItem key={subtest.id} value={subtest.id}>
                  {subtest.code.toUpperCase()} - {subtest.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            If empty, the AI will try to assign subtests per question.
          </FieldDescription>
          {errors.subtestId ? <FieldError>{errors.subtestId.message}</FieldError> : null}
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel>Question Set Name</FieldLabel>
          <Input {...register("name")} placeholder="e.g. UTBK PU Paket 01" />
          {errors.name ? <FieldError>{errors.name.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel>Description</FieldLabel>
          <Textarea
            {...register("description")}
            placeholder="Optional notes for this import"
            rows={3}
          />
          {errors.description ? <FieldError>{errors.description.message}</FieldError> : null}
        </Field>
      </FieldGroup>

      <Alert>
        <AlertDescription className="text-xs">
          After upload, OCR + AI processing will start automatically. You can review and edit
          the generated questions before saving.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload & Process"}
        </Button>
      </div>
    </form>
  );
}
