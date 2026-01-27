import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { PracticeResultsPage } from "@/features/practice/components/practice-results-page";
import { getPracticeSession } from "@/features/practice/server/get-practice-session";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

export const metadata: Metadata = {
  title: "Hasil Latihan | MasukPTN",
  description: "Lihat hasil dan review latihan soal Anda.",
};

export default async function PracticeResultsRoute({
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
      <PracticeResultsPage attemptId={attemptId} />
    </HydrationBoundary>
  );
}
