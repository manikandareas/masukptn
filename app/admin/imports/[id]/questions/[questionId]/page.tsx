import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AdminQuestionImportQuestionEditPage } from "@/features/admin/components/admin-question-import-question-edit-page";
import { getAdminQuestionImportAction } from "@/features/admin/server/get-admin-question-import";
import { getAdminSubtestsAction } from "@/features/admin/server/get-admin-subtests";
import { requireAdminUserPage } from "@/features/admin/server/require-admin-user";
import { getQueryClient } from "@/lib/react-query/client";

export const metadata: Metadata = {
  title: "Edit Draft Question | MasukPTN",
  description: "Edit pertanyaan hasil OCR + AI sebelum disimpan.",
};

export default async function AdminQuestionImportQuestionEditRoute({
  params,
}: {
  params: Promise<{ id: string; questionId: string }>;
}) {
  await requireAdminUserPage();
  const { id, questionId } = await params;

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin-import", id],
      queryFn: () => getAdminQuestionImportAction({ id }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-subtests"],
      queryFn: getAdminSubtestsAction,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminQuestionImportQuestionEditPage
        importId={id}
        questionId={questionId}
      />
    </HydrationBoundary>
  );
}
