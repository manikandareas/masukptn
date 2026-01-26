"use server";

import { deleteQuestionById, getQuestionByIdAdmin } from "@/data-access/queries/admin";

import { deleteSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";

type DeleteAdminQuestionInput = {
  id: string;
};

export async function deleteAdminQuestionAction(input: DeleteAdminQuestionInput) {
  await getAdminUserOrThrow();
  const { id } = deleteSchema.parse(input);

  const existing = await getQuestionByIdAdmin(id);
  if (!existing) {
    throw new Error("Question not found");
  }

  await deleteQuestionById(id);
  return { success: true } as const;
}
