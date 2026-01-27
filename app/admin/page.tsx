import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AdminDashboardPage } from "@/features/admin/components/admin-dashboard-page";
import { getAdminStatsAction } from "@/features/admin/server/get-admin-stats";
import { requireAdminUserPage } from "@/features/admin/server/require-admin-user";
import { getQueryClient } from "@/lib/react-query/client";

export const metadata: Metadata = {
  title: "Admin Dashboard | MasukPTN",
  description: "Kelola soal, question set, dan konten MasukPTN.",
};

export default async function AdminDashboardRoute() {
  await requireAdminUserPage();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStatsAction,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardPage />
    </HydrationBoundary>
  );
}
