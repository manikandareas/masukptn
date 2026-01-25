import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AdminQuestionSetsPage } from "@/features/admin/components/admin-question-sets-page";
import { getAdminExamsAction } from "@/features/admin/server/get-admin-exams";
import { getAdminQuestionSetsAction } from "@/features/admin/server/get-admin-question-sets";
import { getAdminSubtestsForSetsAction } from "@/features/admin/server/get-admin-subtests-for-sets";
import { requireAdminUserPage } from "@/features/admin/server/require-admin-user";
import { getQueryClient } from "@/lib/react-query/client";

const defaultFilters = {
  limit: 20,
  offset: 0,
};

export default async function AdminQuestionSetsRoute() {
  await requireAdminUserPage();

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin-question-sets", defaultFilters],
      queryFn: () => getAdminQuestionSetsAction(defaultFilters),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-exams"],
      queryFn: getAdminExamsAction,
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-subtests-for-sets"],
      queryFn: getAdminSubtestsForSetsAction,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminQuestionSetsPage />
    </HydrationBoundary>
  );
}
