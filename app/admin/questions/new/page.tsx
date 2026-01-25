import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AdminQuestionNewPage } from "@/features/admin/components/admin-question-new-page";
import { getAdminSubtestsAction } from "@/features/admin/server/get-admin-subtests";
import { requireAdminUserPage } from "@/features/admin/server/require-admin-user";
import { getQueryClient } from "@/lib/react-query/client";

export default async function AdminQuestionNewRoute() {
  await requireAdminUserPage();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["admin-subtests"],
    queryFn: getAdminSubtestsAction,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminQuestionNewPage />
    </HydrationBoundary>
  );
}
