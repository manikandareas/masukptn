import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { PracticeHomePage } from "@/features/practice/components/practice-home-page";
import { getPracticeCatalog } from "@/features/practice/server/get-practice-catalog";
import { requireAuth } from "@/lib/auth";
import { getQueryClient } from "@/lib/react-query/client";

export const metadata: Metadata = {
  title: "Latihan | MasukPTN",
  description: "Latihan soal untuk meningkatkan kemampuan Anda.",
};

export default async function PracticeRoute() {
  await requireAuth();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["practice-catalog"],
    queryFn: getPracticeCatalog,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PracticeHomePage />
    </HydrationBoundary>
  );
}
