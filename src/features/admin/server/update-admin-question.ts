"use server";

import { getQuestionByIdAdmin, updateQuestionById } from "@/data-access/queries/admin";

import {
  contentStatusSchema,
  deleteSchema,
  questionFormSchema,
  type QuestionFormValues,
} from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionWithSubtest } from "@/features/admin/server/serializers";

type QuestionFormValuesWithNullables = Omit<
  QuestionFormValues,
  "stimulus" | "options" | "complexOptions" | "sourceInfo"
> & {
  stimulus?: string | null;
  options?: string[] | null;
  complexOptions?: QuestionFormValues["complexOptions"] | null;
  sourceInfo?: string | null;
};

type UpdateAdminQuestionInput = {
  id: string;
  status?: "draft" | "published";
} & Partial<QuestionFormValuesWithNullables>;

export async function updateAdminQuestionAction(input: UpdateAdminQuestionInput) {
  await getAdminUserOrThrow();
  const { id } = deleteSchema.parse({ id: input.id });

  const existing = await getQuestionByIdAdmin(id);
  if (!existing) {
    throw new Error("Question not found");
  }

  const existingForm: QuestionFormValues = {
    subtestId: existing.subtestId,
    questionType: existing.questionType,
    stimulus: existing.stimulus ?? undefined,
    stem: existing.stem,
    options: existing.options ?? undefined,
    complexOptions: existing.complexOptions ?? undefined,
    answerKey: existing.answerKey,
    explanation: existing.explanation,
    difficulty: existing.difficulty ?? "medium",
    topicTags: existing.topicTags ?? [],
    sourceYear: existing.sourceYear ?? null,
    sourceInfo: existing.sourceInfo ?? undefined,
  };

  const { id: omittedId, status: omittedStatus, ...updates } = input;
  void omittedId;
  void omittedStatus;

  const nullOverrides = {
    stimulus: updates.stimulus === null,
    options: updates.options === null,
    complexOptions: updates.complexOptions === null,
    sourceInfo: updates.sourceInfo === null,
  };

  if (nullOverrides.stimulus) updates.stimulus = undefined;
  if (nullOverrides.options) updates.options = undefined;
  if (nullOverrides.complexOptions) updates.complexOptions = undefined;
  if (nullOverrides.sourceInfo) updates.sourceInfo = undefined;

  const candidate = {
    ...existingForm,
    ...updates,
  };

  const parsed = questionFormSchema.parse(candidate);
  const nextStatus = input.status ? contentStatusSchema.parse(input.status) : existing.status;

  await updateQuestionById(id, {
    subtestId: parsed.subtestId,
    questionType: parsed.questionType,
    stimulus: nullOverrides.stimulus ? null : parsed.stimulus ?? null,
    stem: parsed.stem,
    options: nullOverrides.options ? null : parsed.options ?? null,
    complexOptions: nullOverrides.complexOptions ? null : parsed.complexOptions ?? null,
    answerKey: parsed.answerKey,
    explanation: parsed.explanation,
    difficulty: parsed.difficulty,
    topicTags: parsed.topicTags,
    sourceYear: parsed.sourceYear ?? null,
    sourceInfo: nullOverrides.sourceInfo ? null : parsed.sourceInfo ?? null,
    status: nextStatus,
  });

  const fullQuestion = await getQuestionByIdAdmin(id);
  if (!fullQuestion) {
    throw new Error("Unable to load updated question");
  }

  return serializeQuestionWithSubtest({
    question: fullQuestion,
    subtest: fullQuestion.subtest,
  });
}
