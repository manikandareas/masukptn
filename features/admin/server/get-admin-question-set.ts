"use server";

import { getQuestionSetByIdAdmin } from "@/data-access/queries/admin";

import { deleteSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import {
  serializeExam,
  serializeQuestionSet,
  serializeSubtest,
} from "@/features/admin/server/serializers";

type AdminQuestionSetInput = {
  id: string;
};

function toIso(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString();
}

export async function getAdminQuestionSetAction(input: AdminQuestionSetInput) {
  await getAdminUserOrThrow();
  const { id } = deleteSchema.parse(input);

  const questionSet = await getQuestionSetByIdAdmin(id);
  if (!questionSet) {
    throw new Error("Question set not found");
  }

  return {
    ...serializeQuestionSet(questionSet),
    exam: serializeExam(questionSet.exam),
    subtest: questionSet.subtest ? serializeSubtest(questionSet.subtest) : null,
    questions: (questionSet.questions ?? []).map((item) => ({
      id: item.id,
      questionId: item.questionId,
      questionSetId: item.questionSetId,
      sortOrder: item.sortOrder,
      question: {
        id: item.question.id,
        stem: item.question.stem,
        questionType: item.question.questionType,
        difficulty: item.question.difficulty,
        status: item.question.status,
        createdAt: toIso(item.question.createdAt),
        subtest: serializeSubtest(item.question.subtest),
      },
    })),
  };
}
