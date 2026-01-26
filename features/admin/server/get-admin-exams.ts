"use server";

import { getAllExams } from "@/data-access/queries/admin";

import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeExam } from "@/features/admin/server/serializers";

export async function getAdminExamsAction() {
  await getAdminUserOrThrow();
  const rows = await getAllExams();
  return rows.map((exam) => serializeExam(exam));
}
