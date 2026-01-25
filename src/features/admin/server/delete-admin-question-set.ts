"use server";

import { deleteQuestionSetById, getQuestionSetByIdAdmin } from "@/data-access/queries/admin";

import { deleteSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";

export async function deleteAdminQuestionSetAction(input: { id: string }) {
  await getAdminUserOrThrow();
  const { id } = deleteSchema.parse(input);

  const existing = await getQuestionSetByIdAdmin(id);
  if (!existing) {
    throw new Error("Question set not found");
  }

  await deleteQuestionSetById(id);
  return { success: true } as const;
}
