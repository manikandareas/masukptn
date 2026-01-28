import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AdminQuestionImportDetailPage } from "@/features/admin/components/admin-question-import-detail-page";
import { getAdminQuestionImportAction } from "@/features/admin/server/get-admin-question-import";
import { getAdminExamsAction } from "@/features/admin/server/get-admin-exams";
import { getAdminSubtestsAction } from "@/features/admin/server/get-admin-subtests";
import { requireAdminUserPage } from "@/features/admin/server/require-admin-user";
import { getQueryClient } from "@/lib/react-query/client";

export const metadata: Metadata = {
  title: "Review Import | MasukPTN",
  description: "Review hasil OCR + AI sebelum menyimpan ke bank soal.",
};

export default async function AdminQuestionImportDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUserPage();
  const { id } = await params;

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin-import", id],
      queryFn: () => getAdminQuestionImportAction({ id }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-exams"],
      queryFn: getAdminExamsAction,
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-subtests"],
      queryFn: getAdminSubtestsAction,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminQuestionImportDetailPage id={id} />
    </HydrationBoundary>
  );
}
