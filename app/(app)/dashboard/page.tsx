import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { DashboardPage } from "@/features/analytics/components/dashboard-page";
import { analyticsQueryKey } from "@/features/analytics/query-keys";
import { getUserAnalytics } from "@/features/analytics/server/get-user-analytics";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

export default async function DashboardRoute() {
  const user = await requireAuth();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: analyticsQueryKey,
    queryFn: getUserAnalytics,
  });

  const userEmail = user.email ?? "SESSION_ACTIVE";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPage userEmail={userEmail} />
    </HydrationBoundary>
  );
}
