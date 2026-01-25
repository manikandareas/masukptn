import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { PracticeSessionPage } from "@/features/practice/components/practice-session-page";
import { getPracticeSession } from "@/features/practice/server/get-practice-session";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

export default async function PracticeSessionRoute({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  await requireAuth();
  const { attemptId } = await params;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["practice-session", attemptId],
    queryFn: () => getPracticeSession({ attemptId }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PracticeSessionPage attemptId={attemptId} />
    </HydrationBoundary>
  );
}
