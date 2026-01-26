"use server";

import { getQuestionByIdAdmin, insertQuestion } from "@/data-access/queries/admin";

import { questionSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionWithSubtest } from "@/features/admin/server/serializers";

type CreateAdminQuestionInput = Parameters<typeof questionSchema.parse>[0];

export async function createAdminQuestionAction(input: CreateAdminQuestionInput) {
  await getAdminUserOrThrow();
  const data = questionSchema.parse(input);

  const created = await insertQuestion(data);
  const fullQuestion = await getQuestionByIdAdmin(created.id);

  if (!fullQuestion) {
    throw new Error("Unable to load created question");
  }

  return serializeQuestionWithSubtest({
    question: fullQuestion,
    subtest: fullQuestion.subtest,
  });
}
