import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { TryoutSessionPage } from "@/features/tryout/components/tryout-session-page";
import { getTryoutSession } from "@/features/tryout/server/get-tryout-session";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

type TryoutSessionRouteProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function TryoutSessionRoute({ params }: TryoutSessionRouteProps) {
  const { attemptId } = await params;
  await requireAuth();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["tryout-session", attemptId],
    queryFn: () => getTryoutSession({ attemptId }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TryoutSessionPage attemptId={attemptId} />
    </HydrationBoundary>
  );
}
