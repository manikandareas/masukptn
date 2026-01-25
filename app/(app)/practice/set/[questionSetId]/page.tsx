import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { PracticeSetDetailPage } from "@/features/practice/components/practice-set-detail-page";
import { getPracticeCatalog } from "@/features/practice/server/get-practice-catalog";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

export default async function PracticeSetRoute({
  params,
}: {
  params: Promise<{ questionSetId: string }>;
}) {
  await requireAuth();
  const { questionSetId } = await params;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["practice-catalog"],
    queryFn: getPracticeCatalog,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PracticeSetDetailPage questionSetId={questionSetId} />
    </HydrationBoundary>
  );
}
