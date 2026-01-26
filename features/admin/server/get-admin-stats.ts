"use server";

import { getAdminStats } from "@/data-access/queries/admin";

import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";

export async function getAdminStatsAction() {
  await getAdminUserOrThrow();
  return getAdminStats();
}
