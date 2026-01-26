"use server";

import { insertQuestionSet } from "@/data-access/queries/admin";

import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import {
  questionSetInputSchema,
  type QuestionSetInput,
} from "@/features/admin/server/question-set-schemas";
import { serializeQuestionSet } from "@/features/admin/server/serializers";

type CreateAdminQuestionSetInput = QuestionSetInput;

export async function createAdminQuestionSetAction(input: CreateAdminQuestionSetInput) {
  await getAdminUserOrThrow();
  const data = questionSetInputSchema.parse(input);

  const created = await insertQuestionSet({
    examId: data.examId,
    subtestId: data.subtestId ?? null,
    name: data.name,
    description: data.description ?? null,
    status: data.status ?? "draft",
  });

  return serializeQuestionSet(created);
}
