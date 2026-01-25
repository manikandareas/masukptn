"use server";

import { z } from "zod";

import {
  getAttemptItemWithQuestion,
  updateAttemptItem,
  type NewAttemptItem,
} from "@/data-access/queries/attempts";
import { getBlueprintWithSections } from "@/data-access/queries/exams";
import type { AnswerKey } from "@/data-access/schema";
import { logServerError } from "@/features/tryout/server/log-server-error";
import { requireAuthUser } from "@/features/tryout/server/require-auth-user";

const userAnswerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("single_choice"),
    selected: z.string().nullable(),
  }),
  z.object({
    type: z.literal("complex_selection"),
    rows: z.array(z.object({ selected: z.string().nullable() })),
  }),
  z.object({
    type: z.literal("fill_in"),
    value: z.string().nullable(),
  }),
]);

const submitAnswerSchema = z.object({
  attemptId: z.string().min(1),
  attemptItemId: z.string().min(1),
  userAnswer: userAnswerSchema,
  timeSpentSeconds: z.number().int().nonnegative().optional(),
});

export type SubmitTryoutAnswerInput = z.infer<typeof submitAnswerSchema>;

function normalizeInput(value: string, caseSensitive?: boolean) {
  const trimmed = value.trim();
  return caseSensitive ? trimmed : trimmed.toLowerCase();
}

function gradeAnswer(answerKey: AnswerKey, userAnswer: z.infer<typeof userAnswerSchema>) {
  if (userAnswer.type === "single_choice" && answerKey.type === "single_choice") {
    if (!userAnswer.selected) {
      return { isCorrect: null, partialScore: undefined } as const;
    }
    return {
      isCorrect: userAnswer.selected === answerKey.correct,
      partialScore: undefined,
    } as const;
  }

  if (userAnswer.type === "fill_in" && answerKey.type === "fill_in") {
    if (!userAnswer.value || userAnswer.value.trim().length === 0) {
      return { isCorrect: null, partialScore: undefined } as const;
    }

    const normalized = normalizeInput(userAnswer.value, answerKey.caseSensitive);
    const accepted = answerKey.accepted.map((value) =>
      normalizeInput(value, answerKey.caseSensitive),
    );

    let matches = accepted.includes(normalized);

    if (!matches && answerKey.regex) {
      try {
        const flags = answerKey.caseSensitive ? "" : "i";
        const pattern = new RegExp(answerKey.regex, flags);
        matches = pattern.test(userAnswer.value);
      } catch {
        matches = false;
      }
    }

    return { isCorrect: matches, partialScore: undefined } as const;
  }

  if (userAnswer.type === "complex_selection" && answerKey.type === "complex_selection") {
    const totalRows = answerKey.rows.length;
    const selectedCount = userAnswer.rows.filter((row) => row.selected).length;

    if (selectedCount === 0) {
      return { isCorrect: null, partialScore: undefined } as const;
    }

    const correctCount = answerKey.rows.reduce((count, row, index) => {
      const selected = userAnswer.rows[index]?.selected;
      if (selected && selected === row.correct) {
        return count + 1;
      }
      return count;
    }, 0);

    const partialScore = totalRows > 0 ? Math.round((correctCount / totalRows) * 100) : 0;
    const isCorrect = correctCount === totalRows && selectedCount === totalRows;

    return { isCorrect, partialScore } as const;
  }

  return { isCorrect: null, partialScore: undefined } as const;
}

export async function submitAnswer(input: SubmitTryoutAnswerInput) {
  const data = submitAnswerSchema.parse(input);
  const user = await requireAuthUser();

  let attemptItem: Awaited<ReturnType<typeof getAttemptItemWithQuestion>> | null = null;
  try {
    attemptItem = await getAttemptItemWithQuestion(data.attemptItemId);
  } catch (error) {
    logServerError(
      {
        scope: "submit-answer:load-item",
        userId: user.id,
        attemptId: data.attemptId,
        attemptItemId: data.attemptItemId,
      },
      error,
    );
    throw error;
  }

  if (!attemptItem || attemptItem.attemptId !== data.attemptId) {
    throw new Error("Attempt item not found.");
  }

  if (!attemptItem.attempt || attemptItem.attempt.userId !== user.id) {
    throw new Error("Unauthorized attempt access.");
  }

  if (attemptItem.attempt.mode !== "tryout") {
    throw new Error("Attempt is not a tryout session.");
  }

  if (!attemptItem.attempt.blueprintId) {
    throw new Error("Tryout session blueprint missing.");
  }

  if (attemptItem.sectionIndex == null) {
    throw new Error("Section not assigned for this question.");
  }

  const snapshot = attemptItem.attempt.configSnapshot ?? {};
  const currentSectionIndex = snapshot.currentSectionIndex ?? 0;

  if (currentSectionIndex !== attemptItem.sectionIndex) {
    throw new Error("This question is not in the active section.");
  }

  if (!snapshot.sectionStartedAt) {
    throw new Error("Section has not started yet.");
  }

  const blueprint = await getBlueprintWithSections(attemptItem.attempt.blueprintId);
  const section = blueprint?.sections?.[attemptItem.sectionIndex];
  if (!section) {
    throw new Error("Section timing not found.");
  }

  const startedAt = new Date(snapshot.sectionStartedAt);
  const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);

  if (elapsedSeconds >= section.durationSeconds) {
    throw new Error("Section time expired.");
  }

  const { isCorrect, partialScore } = gradeAnswer(attemptItem.question.answerKey, data.userAnswer);

  const updateData: Partial<NewAttemptItem> = {
    userAnswer: data.userAnswer,
    isCorrect,
    partialScore,
    answeredAt: new Date(),
  };

  if (typeof data.timeSpentSeconds === "number") {
    updateData.timeSpentSeconds = data.timeSpentSeconds;
  }

  let updated: Awaited<ReturnType<typeof updateAttemptItem>> | null = null;
  try {
    updated = await updateAttemptItem(data.attemptItemId, updateData);
  } catch (error) {
    logServerError(
      {
        scope: "submit-answer:update-item",
        userId: user.id,
        attemptId: data.attemptId,
        attemptItemId: data.attemptItemId,
      },
      error,
    );
    throw error;
  }

  if (!updated) {
    throw new Error("Unable to save answer.");
  }

  return { item: updated } as const;
}
