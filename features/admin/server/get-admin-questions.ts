"use server";

import {
  getQuestionsByFiltersAdmin,
  getQuestionsCountAdmin,
} from "@/data-access/queries/admin";

import { questionFiltersSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionWithSubtest } from "@/features/admin/server/serializers";

type AdminQuestionsInput = Partial<{
  subtestId: string;
  status: "draft" | "published";
  difficulty: "easy" | "medium" | "hard";
  questionType: "single_choice" | "complex_selection" | "fill_in";
  search: string;
  limit: number;
  offset: number;
}>;

export async function getAdminQuestionsAction(input?: AdminQuestionsInput) {
  await getAdminUserOrThrow();
  const filters = questionFiltersSchema.parse(input ?? {});
  const { limit, offset, ...countFilters } = filters;

  const [questions, total] = await Promise.all([
    getQuestionsByFiltersAdmin(filters),
    getQuestionsCountAdmin(countFilters),
  ]);

  return {
    questions: questions.map((question) =>
      serializeQuestionWithSubtest({
        question,
        subtest: question.subtest,
      }),
    ),
    total,
    limit,
    offset,
  };
}
