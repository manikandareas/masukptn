import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { TryoutResultsPage } from "@/features/tryout/components/tryout-results-page";
import { getTryoutSession } from "@/features/tryout/server/get-tryout-session";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

type TryoutResultsRouteProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function TryoutResultsRoute({ params }: TryoutResultsRouteProps) {
  const { attemptId } = await params;
  await requireAuth();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["tryout-session", attemptId],
    queryFn: () => getTryoutSession({ attemptId }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TryoutResultsPage attemptId={attemptId} />
    </HydrationBoundary>
  );
}
