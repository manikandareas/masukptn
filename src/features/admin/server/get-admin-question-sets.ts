"use server";

import {
  getQuestionSetsByFiltersAdmin,
  getQuestionSetsCountAdmin,
} from "@/data-access/queries/admin";

import { questionSetFiltersSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeExam, serializeQuestionSet, serializeSubtest } from "@/features/admin/server/serializers";

type AdminQuestionSetsInput = Partial<{
  examId: string;
  subtestId: string;
  status: "draft" | "published";
  limit: number;
  offset: number;
}>;

export async function getAdminQuestionSetsAction(input?: AdminQuestionSetsInput) {
  await getAdminUserOrThrow();
  const filters = questionSetFiltersSchema.parse(input ?? {});
  const { limit, offset, ...countFilters } = filters;

  const [questionSets, total] = await Promise.all([
    getQuestionSetsByFiltersAdmin(filters),
    getQuestionSetsCountAdmin(countFilters),
  ]);

  return {
    questionSets: questionSets.map((item) => ({
      ...serializeQuestionSet(item),
      exam: serializeExam(item.exam),
      subtest: item.subtest ? serializeSubtest(item.subtest) : null,
      questionCount: item.questionCount,
    })),
    total,
    limit,
    offset,
  };
}
