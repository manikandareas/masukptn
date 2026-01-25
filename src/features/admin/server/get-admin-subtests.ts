"use server";

import { getAllSubtests } from "@/data-access/queries/admin";

import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeSubtestWithExam } from "@/features/admin/server/serializers";

export async function getAdminSubtestsAction() {
  await getAdminUserOrThrow();
  const rows = await getAllSubtests();
  return rows.map((row) =>
    serializeSubtestWithExam({
      subtest: row.subtest,
      exam: row.exam,
    }),
  );
}
