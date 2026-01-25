import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { TryoutHomePage } from "@/features/tryout/components/tryout-home-page";
import { getTryoutCatalog } from "@/features/tryout/server/get-tryout-catalog";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

export default async function TryoutRoute() {
  await requireAuth();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["tryout-catalog"],
    queryFn: getTryoutCatalog,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TryoutHomePage />
    </HydrationBoundary>
  );
}
