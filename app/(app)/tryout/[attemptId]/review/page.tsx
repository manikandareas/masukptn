import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { TryoutReviewPage } from "@/features/tryout/components/tryout-review-page";
import { getTryoutSession } from "@/features/tryout/server/get-tryout-session";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

type TryoutReviewRouteProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function TryoutReviewRoute({ params }: TryoutReviewRouteProps) {
  const { attemptId } = await params;
  await requireAuth();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["tryout-session", attemptId],
    queryFn: () => getTryoutSession({ attemptId }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TryoutReviewPage attemptId={attemptId} />
    </HydrationBoundary>
  );
}
