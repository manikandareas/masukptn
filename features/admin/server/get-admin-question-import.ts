"use server";

import { getQuestionImportById } from "@/data-access/queries/question-imports";
import { deleteSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionImportDetail } from "@/features/admin/server/serializers";

export async function getAdminQuestionImportAction(input: { id: string }) {
  await getAdminUserOrThrow();
  const { id } = deleteSchema.parse(input);

  const result = await getQuestionImportById(id);
  if (!result) {
    throw new Error("Question import not found");
  }

  return serializeQuestionImportDetail(result);
}
