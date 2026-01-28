"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAdminQuestionImportAction } from "@/features/admin/server/create-admin-question-import";
import { processAdminQuestionImportAction } from "@/features/admin/server/process-admin-question-import";
import { updateAdminQuestionImportAction } from "@/features/admin/server/update-admin-question-import";
import { updateAdminQuestionImportQuestionAction } from "@/features/admin/server/update-admin-question-import-question";
import { finalizeAdminQuestionImportAction } from "@/features/admin/server/finalize-admin-question-import";
import type { QuestionFormValues, UpdateQuestionImportData } from "@/features/admin/types";
import { adminStatsQueryKey } from "./use-admin-stats";
import { questionImportQueryKey } from "./use-question-import";
import { questionImportsQueryKey } from "./use-question-imports";

async function createImport(formData: FormData) {
  return createAdminQuestionImportAction(formData);
}

async function processImport(id: string) {
  return processAdminQuestionImportAction({ id });
}

async function updateImport(data: UpdateQuestionImportData) {
  return updateAdminQuestionImportAction(data);
}

async function updateImportQuestion(data: QuestionFormValues & { id: string }) {
  return updateAdminQuestionImportQuestionAction(data);
}

async function finalizeImport(id: string) {
  return finalizeAdminQuestionImportAction({ id });
}

export function useCreateQuestionImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createImport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionImportsQueryKey });
    },
  });
}

export function useProcessQuestionImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processImport,
    onSuccess: (data) => {
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: [...questionImportQueryKey, data.id],
        });
      }
      queryClient.invalidateQueries({ queryKey: questionImportsQueryKey });
    },
  });
}

export function useUpdateQuestionImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateImport,
    onSuccess: (data) => {
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: [...questionImportQueryKey, data.id],
        });
      }
      queryClient.invalidateQueries({ queryKey: questionImportsQueryKey });
    },
  });
}

export function useUpdateQuestionImportQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateImportQuestion,
    onSuccess: (data) => {
      if (data?.importId) {
        queryClient.invalidateQueries({
          queryKey: [...questionImportQueryKey, data.importId],
        });
      }
      queryClient.invalidateQueries({ queryKey: questionImportsQueryKey });
    },
  });
}

export function useFinalizeQuestionImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: finalizeImport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionImportsQueryKey });
      queryClient.invalidateQueries({ queryKey: ["admin-question-sets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey });
    },
  });
}
