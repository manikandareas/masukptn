import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AdminQuestionSetNewPage } from "@/features/admin/components/admin-question-set-new-page";
import { getAdminExamsAction } from "@/features/admin/server/get-admin-exams";
import { getAdminSubtestsForSetsAction } from "@/features/admin/server/get-admin-subtests-for-sets";
import { requireAdminUserPage } from "@/features/admin/server/require-admin-user";
import { getQueryClient } from "@/lib/react-query/client";

export default async function AdminQuestionSetNewRoute() {
  await requireAdminUserPage();

  const queryClient = getQueryClient();
  await Promise.all([
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
      <AdminQuestionSetNewPage />
    </HydrationBoundary>
  );
}
