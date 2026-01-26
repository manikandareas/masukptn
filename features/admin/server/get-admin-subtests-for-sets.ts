"use server";

import { getAllSubtests } from "@/data-access/queries/admin";

import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeSubtest } from "@/features/admin/server/serializers";

export async function getAdminSubtestsForSetsAction() {
  await getAdminUserOrThrow();
  const rows = await getAllSubtests();
  return rows.map((row) => serializeSubtest(row.subtest));
}
