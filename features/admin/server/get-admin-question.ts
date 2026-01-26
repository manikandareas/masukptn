"use server";

import { getQuestionByIdAdmin } from "@/data-access/queries/admin";

import { deleteSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionWithSubtest } from "@/features/admin/server/serializers";

type AdminQuestionInput = {
  id: string;
};

export async function getAdminQuestionAction(input: AdminQuestionInput) {
  await getAdminUserOrThrow();
  const { id } = deleteSchema.parse(input);

  const question = await getQuestionByIdAdmin(id);
  if (!question) {
    throw new Error("Question not found");
  }

  return serializeQuestionWithSubtest({
    question,
    subtest: question.subtest,
  });
}
