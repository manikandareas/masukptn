"use server";

import {
  getQuestionSetByIdAdmin,
  replaceQuestionSetItems,
  updateQuestionSetById,
} from "@/data-access/queries/admin";

import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { questionSetItemsInputSchema } from "@/features/admin/server/question-set-schemas";
import { serializeQuestionSet } from "@/features/admin/server/serializers";

export async function updateAdminQuestionSetItemsAction(input: {
  id: string;
  questionIds: string[];
}) {
  await getAdminUserOrThrow();
  const parsed = questionSetItemsInputSchema.parse(input);

  const existing = await getQuestionSetByIdAdmin(parsed.id);
  if (!existing) {
    throw new Error("Question set not found");
  }

  await replaceQuestionSetItems(parsed.id, parsed.questionIds);
  const updated = await updateQuestionSetById(parsed.id, {});

  if (!updated) {
    throw new Error("Unable to update question set items");
  }

  return serializeQuestionSet(updated);
}
