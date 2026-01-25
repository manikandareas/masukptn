import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { BlueprintDetailPage } from "@/features/tryout/components/blueprint-detail-page";
import { getBlueprintDetail } from "@/features/tryout/server/get-blueprint-detail";
import { getTryoutCatalog } from "@/features/tryout/server/get-tryout-catalog";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

type BlueprintDetailRouteProps = {
  params: Promise<{ blueprintId: string }>;
};

export default async function BlueprintDetailRoute({ params }: BlueprintDetailRouteProps) {
  const { blueprintId } = await params;
  await requireAuth();

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["tryout-catalog"],
      queryFn: getTryoutCatalog,
    }),
    queryClient.prefetchQuery({
      queryKey: ["blueprint-detail", blueprintId],
      queryFn: () => getBlueprintDetail({ blueprintId }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlueprintDetailPage blueprintId={blueprintId} />
    </HydrationBoundary>
  );
}
