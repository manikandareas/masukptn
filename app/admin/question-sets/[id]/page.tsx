import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AdminQuestionSetEditPage } from "@/features/admin/components/admin-question-set-edit-page";
import { getAdminQuestionSetAction } from "@/features/admin/server/get-admin-question-set";
import { getAdminExamsAction } from "@/features/admin/server/get-admin-exams";
import { getAdminSubtestsForSetsAction } from "@/features/admin/server/get-admin-subtests-for-sets";
import { requireAdminUserPage } from "@/features/admin/server/require-admin-user";
import { getQueryClient } from "@/lib/react-query/client";

type AdminQuestionSetEditRouteProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Question Set | MasukPTN",
  description: "Edit detail dan soal dalam question set.",
};

export default async function AdminQuestionSetEditRoute({ params }: AdminQuestionSetEditRouteProps) {
  const { id } = await params;
  await requireAdminUserPage();

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin-question-set", id],
      queryFn: () => getAdminQuestionSetAction({ id }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-exams"],
      queryFn: getAdminExamsAction,
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-subtests-for-sets"],
      queryFn: getAdminSubtestsForSetsAction,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminQuestionSetEditPage id={id} />
    </HydrationBoundary>
  );
}
