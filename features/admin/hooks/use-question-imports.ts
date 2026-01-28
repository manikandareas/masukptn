"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminQuestionImportsAction } from "@/features/admin/server/get-admin-question-imports";
import type { QuestionImportFilters } from "@/features/admin/types";

export const questionImportsQueryKey = ["admin-imports"] as const;

export function useQuestionImports(filters: QuestionImportFilters) {
  return useQuery({
    queryKey: [...questionImportsQueryKey, filters],
    queryFn: () => getAdminQuestionImportsAction(filters),
    refetchInterval: (data) => {
      const imports = data?.imports ?? [];
      const hasProcessing = imports.some((item) =>
        ["queued", "processing"].includes(item.status),
      );
      return hasProcessing ? 3000 : false;
    },
  });
}
