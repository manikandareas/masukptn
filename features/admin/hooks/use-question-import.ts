"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminQuestionImportAction } from "@/features/admin/server/get-admin-question-import";

export const questionImportQueryKey = ["admin-import"] as const;

export function useQuestionImport(id: string) {
  return useQuery({
    queryKey: [...questionImportQueryKey, id],
    queryFn: () => getAdminQuestionImportAction({ id }),
    enabled: Boolean(id),
    refetchInterval: (data) => {
      const status = data?.status;
      return status === "queued" || status === "processing" ? 3000 : false;
    },
  });
}
