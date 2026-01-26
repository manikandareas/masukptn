"use server";

import { getQuestionSetByIdAdmin, updateQuestionSetById } from "@/data-access/queries/admin";

import { deleteSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import {
  questionSetInputSchema,
  type QuestionSetInput,
} from "@/features/admin/server/question-set-schemas";
import { serializeQuestionSet } from "@/features/admin/server/serializers";

type UpdateAdminQuestionSetInput = {
  id: string;
} & Partial<QuestionSetInput>;

export async function updateAdminQuestionSetAction(input: UpdateAdminQuestionSetInput) {
  await getAdminUserOrThrow();
  const { id } = deleteSchema.parse({ id: input.id });

  const existing = await getQuestionSetByIdAdmin(id);
  if (!existing) {
    throw new Error("Question set not found");
  }

  const existingForm = {
    examId: existing.examId,
    subtestId: existing.subtestId,
    name: existing.name,
    description: existing.description ?? undefined,
    status: existing.status,
  };

  const { id: omittedId, ...updates } = input;
  void omittedId;
  const candidate = {
    ...existingForm,
    ...updates,
  };

  const data = questionSetInputSchema.parse(candidate);
  const nextStatus = data.status ?? existing.status;

  const updated = await updateQuestionSetById(id, {
    examId: data.examId,
    subtestId: data.subtestId ?? null,
    name: data.name,
    description: data.description ?? null,
    status: nextStatus,
  });

  if (!updated) {
    throw new Error("Unable to update question set");
  }

  return serializeQuestionSet(updated);
}
