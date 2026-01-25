import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { TryoutCountdownPage } from "@/features/tryout/components/tryout-countdown-page";
import { getTryoutSession } from "@/features/tryout/server/get-tryout-session";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

type TryoutCountdownRouteProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function TryoutCountdownRoute({ params }: TryoutCountdownRouteProps) {
  const { attemptId } = await params;
  await requireAuth();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["tryout-session", attemptId],
    queryFn: () => getTryoutSession({ attemptId }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TryoutCountdownPage attemptId={attemptId} />
    </HydrationBoundary>
  );
}
