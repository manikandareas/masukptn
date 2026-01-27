import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AdminQuestionsPage } from "@/features/admin/components/admin-questions-page";
import { getAdminQuestionsAction } from "@/features/admin/server/get-admin-questions";
import { getAdminSubtestsAction } from "@/features/admin/server/get-admin-subtests";
import { requireAdminUserPage } from "@/features/admin/server/require-admin-user";
import { getQueryClient } from "@/lib/react-query/client";

const defaultFilters = {
  limit: 20,
  offset: 0,
};

export const metadata: Metadata = {
  title: "Kelola Soal | MasukPTN",
  description: "Lihat dan kelola bank soal untuk SNMPTN.",
};

export default async function AdminQuestionsRoute() {
  await requireAdminUserPage();

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin-questions", defaultFilters],
      queryFn: () => getAdminQuestionsAction(defaultFilters),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-subtests"],
      queryFn: getAdminSubtestsAction,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminQuestionsPage />
    </HydrationBoundary>
  );
}
