"use server";

import { z } from "zod";

import {
  createAttempt,
  createAttemptItems,
  type NewAttemptItem,
} from "@/data-access/queries/attempts";
import { getBlueprintWithSections } from "@/data-access/queries/exams";
import { getRandomQuestionsByFilters } from "@/data-access/queries/questions";
import { logServerError } from "@/features/tryout/server/log-server-error";
import { requireAuthUser } from "@/features/tryout/server/require-auth-user";

const tryoutConfigSchema = z.object({
  blueprintId: z.string().min(1),
});

export type CreateTryoutSessionInput = z.infer<typeof tryoutConfigSchema>;

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

export async function createTryoutSession(input: CreateTryoutSessionInput) {
  const data = tryoutConfigSchema.parse(input);
  const user = await requireAuthUser();

  const blueprint = await getBlueprintWithSections(data.blueprintId);
  if (!blueprint || !blueprint.isActive) {
    throw new Error("Blueprint not found.");
  }

  if (!blueprint.sections || blueprint.sections.length === 0) {
    throw new Error("Blueprint has no sections.");
  }

  const sectionQuestions = [] as Array<{
    sectionIndex: number;
    questionId: string;
    questionType: string;
  }>;

  for (const [index, section] of blueprint.sections.entries()) {
    let questions: Awaited<ReturnType<typeof getRandomQuestionsByFilters>> = [];
    try {
      questions = await getRandomQuestionsByFilters({
        subtestId: section.subtestId,
        status: "published",
        limit: section.questionCount,
      });
    } catch (error) {
      logServerError(
        {
          scope: "create-tryout-session:load-questions",
          userId: user.id,
          metadata: { blueprintId: data.blueprintId, subtestId: section.subtestId },
        },
        error,
      );
      throw error;
    }

    if (questions.length < section.questionCount) {
      throw new Error(`Not enough published questions for ${section.name}.`);
    }

    questions.forEach((question) => {
      sectionQuestions.push({
        sectionIndex: index,
        questionId: question.id,
        questionType: question.questionType,
      });
    });
  }

  const totalQuestions = sectionQuestions.length;

  let attempt: Awaited<ReturnType<typeof createAttempt>> | null = null;
  try {
    attempt = await createAttempt({
      userId: user.id,
      mode: "tryout",
      status: "in_progress",
      blueprintId: data.blueprintId,
      startedAt: new Date(),
      configSnapshot: {
        questionCount: totalQuestions,
        currentSectionIndex: 0,
      },
    });
  } catch (error) {
    logServerError(
      {
        scope: "create-tryout-session:create-attempt",
        userId: user.id,
        metadata: { blueprintId: data.blueprintId },
      },
      error,
    );
    throw error;
  }

  if (!attempt) {
    throw new Error("Unable to create tryout session.");
  }

  const attemptItems = sectionQuestions.map((item, index) => ({
    attemptId: attempt.id,
    questionId: item.questionId,
    sortOrder: index + 1,
    sectionIndex: item.sectionIndex,
    userAnswer: buildInitialAnswer(item.questionType),
  }));

  try {
    await createAttemptItems(attemptItems);
  } catch (error) {
    logServerError(
      {
        scope: "create-tryout-session:create-items",
        userId: user.id,
        attemptId: attempt.id,
      },
      error,
    );
    throw error;
  }

  return { attemptId: attempt.id } as const;
}
