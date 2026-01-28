"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminQuestionImportsAction } from "@/features/admin/server/get-admin-question-imports";
import type { QuestionImportFilters } from "@/features/admin/types";

export const questionImportsQueryKey = ["admin-imports"] as const;

export function useQuestionImports(filters: QuestionImportFilters) {
  return useQuery({
    queryKey: [...questionImportsQueryKey, filters],
    queryFn: () => getAdminQuestionImportsAction(filters),
    refetchInterval: (query) => {
      const imports = query.state.data?.imports ?? [];
      const hasProcessing = imports.some(
        (item) => item.status === "queued" || item.status === "processing",
      );
      return hasProcessing ? 3000 : false;
    },
  });
}
