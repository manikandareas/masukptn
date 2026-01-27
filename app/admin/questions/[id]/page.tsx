import type { Metadata } from "next";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AdminQuestionEditPage } from "@/features/admin/components/admin-question-edit-page";
import { getAdminQuestionAction } from "@/features/admin/server/get-admin-question";
import { getAdminSubtestsAction } from "@/features/admin/server/get-admin-subtests";
import { requireAdminUserPage } from "@/features/admin/server/require-admin-user";
import { getQueryClient } from "@/lib/react-query/client";

type AdminQuestionEditRouteProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Soal | MasukPTN",
  description: "Edit detail soal dan jawaban.",
};

export default async function AdminQuestionEditRoute({ params }: AdminQuestionEditRouteProps) {
  const { id } = await params;
  await requireAdminUserPage();

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin-question", id],
      queryFn: () => getAdminQuestionAction({ id }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-subtests"],
      queryFn: getAdminSubtestsAction,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminQuestionEditPage id={id} />
    </HydrationBoundary>
  );
}
