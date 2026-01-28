"use server";

import { getQuestionImportsByFilters, getQuestionImportsCount } from "@/data-access/queries/question-imports";
import { questionImportFiltersSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionImportSummary } from "@/features/admin/server/serializers";

export async function getAdminQuestionImportsAction(input?: unknown) {
  await getAdminUserOrThrow();
  const filters = questionImportFiltersSchema.parse(input ?? {});

  const { limit, offset, ...countFilters } = filters;

  const [imports, total] = await Promise.all([
    getQuestionImportsByFilters(filters),
    getQuestionImportsCount(countFilters),
  ]);

  return {
    imports: imports.map(serializeQuestionImportSummary),
    total,
    limit,
    offset,
  };
}
