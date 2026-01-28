"use server";

import { getQuestionImportById, updateQuestionImportById } from "@/data-access/queries/question-imports";
import { updateQuestionImportSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionImportDetail } from "@/features/admin/server/serializers";

export async function updateAdminQuestionImportAction(input: unknown) {
  await getAdminUserOrThrow();
  const parsed = updateQuestionImportSchema.parse(input);

  const existing = await getQuestionImportById(parsed.id);
  if (!existing) {
    throw new Error("Question import not found");
  }

  await updateQuestionImportById(parsed.id, {
    draftExamId:
      parsed.examId === undefined ? existing.draftExamId : parsed.examId,
    draftSubtestId:
      parsed.subtestId === undefined
        ? existing.draftSubtestId
        : parsed.subtestId,
    draftName: parsed.name ?? existing.draftName,
    draftDescription: parsed.description ?? existing.draftDescription,
  });

  const updated = await getQuestionImportById(parsed.id);
  if (!updated) {
    throw new Error("Unable to load updated import");
  }

  return serializeQuestionImportDetail(updated);
}
