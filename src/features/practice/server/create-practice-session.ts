"use server";

import { z } from "zod";

import {
  createAttempt,
  createAttemptItems,
  type NewAttemptItem,
} from "@/data-access/queries/attempts";
import {
  getPublishedQuestionSetById,
  getQuestionSetItemsWithQuestions,
} from "@/data-access/queries/question-sets";
import { logServerError } from "@/features/practice/server/log-server-error";
import { requireAuthUser } from "@/features/practice/server/require-auth-user";

const practiceConfigSchema = z.object({
  questionSetId: z.string().min(1),
  timeMode: z.enum(["relaxed", "timed"]),
});

export type CreatePracticeSessionInput = z.infer<typeof practiceConfigSchema>;

type AttemptUserAnswer = NonNullable<NewAttemptItem["userAnswer"]>;

function buildInitialAnswer(questionType: string): AttemptUserAnswer {
  if (questionType === "single_choice") {
    return { type: "single_choice", selected: null };
  }
  if (questionType === "complex_selection") {
    return { type: "complex_selection", rows: [] };
  }
  return { type: "fill_in", value: null };
}

export async function createPracticeSession(input: CreatePracticeSessionInput) {
  const data = practiceConfigSchema.parse(input);
  const user = await requireAuthUser();

  const questionSet = await getPublishedQuestionSetById(data.questionSetId);
  if (!questionSet) {
    throw new Error("Question set not found.");
  }

  let items: Awaited<ReturnType<typeof getQuestionSetItemsWithQuestions>> = [];
  try {
    items = await getQuestionSetItemsWithQuestions(data.questionSetId);
  } catch (error) {
    logServerError(
      {
        scope: "create-practice-session:load-questions",
        userId: user.id,
        metadata: { questionSetId: data.questionSetId },
      },
      error,
    );
    throw error;
  }

  if (items.length === 0) {
    throw new Error("No published questions available in this set.");
  }

  const timeLimitSeconds =
    data.timeMode === "timed"
      ? Math.max(1, Math.ceil(items.length * 1.5)) * 60
      : undefined;

  let attempt: Awaited<ReturnType<typeof createAttempt>> | null = null;
  try {
    attempt = await createAttempt({
      userId: user.id,
      mode: "practice",
      status: "in_progress",
      timeMode: data.timeMode,
      questionSetId: data.questionSetId,
      startedAt: new Date(),
      configSnapshot: {
        questionCount: items.length,
        timeLimitSeconds,
      },
    });
  } catch (error) {
    logServerError(
      {
        scope: "create-practice-session:create-attempt",
        userId: user.id,
        metadata: { questionSetId: data.questionSetId },
      },
      error,
    );
    throw error;
  }

  if (!attempt) {
    throw new Error("Unable to create practice session.");
  }

  const attemptItems = items.map((item, index) => ({
    attemptId: attempt.id,
    questionId: item.questionId,
    sortOrder: index + 1,
    userAnswer: buildInitialAnswer(item.question.questionType),
  }));

  try {
    await createAttemptItems(attemptItems);
  } catch (error) {
    logServerError(
      {
        scope: "create-practice-session:create-items",
        userId: user.id,
        attemptId: attempt.id,
      },
      error,
    );
    throw error;
  }

  return { attemptId: attempt.id } as const;
}
