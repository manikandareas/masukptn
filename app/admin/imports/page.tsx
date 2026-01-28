import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AdminQuestionImportsPage } from "@/features/admin/components/admin-question-imports-page";
import { getAdminQuestionImportsAction } from "@/features/admin/server/get-admin-question-imports";
import { getAdminExamsAction } from "@/features/admin/server/get-admin-exams";
import { getAdminSubtestsAction } from "@/features/admin/server/get-admin-subtests";
import { requireAdminUserPage } from "@/features/admin/server/require-admin-user";
import { getQueryClient } from "@/lib/react-query/client";

const defaultFilters = {
  limit: 20,
  offset: 0,
};

export const metadata: Metadata = {
  title: "Import Soal | MasukPTN",
  description: "Upload PDF dan generate question set dengan OCR + AI.",
};

export default async function AdminQuestionImportsRoute() {
  await requireAdminUserPage();

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin-imports", defaultFilters],
      queryFn: () => getAdminQuestionImportsAction(defaultFilters),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-exams"],
      queryFn: getAdminExamsAction,
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-subtests"],
      queryFn: getAdminSubtestsAction,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminQuestionImportsPage />
    </HydrationBoundary>
  );
}
