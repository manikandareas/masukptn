"use server";

import { z } from "zod";

import {
  getAttemptWithItems,
  updateAttemptForUser,
  type AttemptResults,
} from "@/data-access/queries/attempts";
import { getBlueprintWithSections } from "@/data-access/queries/exams";
import { logServerError } from "@/features/tryout/server/log-server-error";
import { requireAuthUser } from "@/features/tryout/server/require-auth-user";

const calculateSchema = z.object({
  attemptId: z.string().min(1),
});

export type CalculateTryoutResultsInput = z.infer<typeof calculateSchema>;

function sumTimeSeconds(items: Array<{ timeSpentSeconds?: number | null }>) {
  return items.reduce((total, item) => total + (item.timeSpentSeconds ?? 0), 0);
}

function calculateResults(
  attemptItems: Array<{
    sectionIndex: number | null;
    isCorrect: boolean | null;
    timeSpentSeconds?: number | null;
  }>,
  sections: Array<{
    subtestId: string;
    name: string;
    durationSeconds: number;
  }>,
): { results: AttemptResults; totalTimeSeconds: number } {
  const perSection = sections.map((section, index) => {
    const items = attemptItems.filter((item) => item.sectionIndex === index);
    const total = items.length;
    const correct = items.filter((item) => item.isCorrect === true).length;
    const wrong = items.filter((item) => item.isCorrect === false).length;
    const blank = items.filter((item) => item.isCorrect == null).length;
    const rawTime = sumTimeSeconds(items);
    const timeSeconds = Math.min(section.durationSeconds, Math.max(0, rawTime));
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    return {
      subtestId: section.subtestId,
      subtestName: section.name,
      correct,
      total,
      accuracy,
      timeSeconds,
      wrong,
      blank,
    };
  });

  const totalQuestions = perSection.reduce((sum, section) => sum + section.total, 0);
  const correctCount = perSection.reduce((sum, section) => sum + section.correct, 0);
  const wrongCount = perSection.reduce((sum, section) => sum + section.wrong, 0);
  const blankCount = perSection.reduce((sum, section) => sum + section.blank, 0);
  const totalTimeSeconds = perSection.reduce((sum, section) => sum + section.timeSeconds, 0);
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTimeSeconds / totalQuestions) : 0;

  return {
    totalTimeSeconds,
    results: {
      totalQuestions,
      correctCount,
      wrongCount,
      blankCount,
      accuracy,
      avgTimePerQuestion,
      perSection: perSection.map(({ wrong, blank, ...section }) => section),
    },
  };
}

export async function calculateTryoutResults(input: CalculateTryoutResultsInput) {
  const data = calculateSchema.parse(input);
  const user = await requireAuthUser();

  let attempt: Awaited<ReturnType<typeof getAttemptWithItems>> | null = null;
  try {
    attempt = await getAttemptWithItems(data.attemptId);
  } catch (error) {
    logServerError(
      {
        scope: "calculate-tryout-results:load-attempt",
        userId: user.id,
        attemptId: data.attemptId,
      },
      error,
    );
    throw error;
  }

  if (!attempt) {
    throw new Error("Tryout session not found.");
  }

  if (attempt.userId !== user.id) {
    throw new Error("Unauthorized access to tryout session.");
  }

  if (attempt.mode !== "tryout") {
    throw new Error("Attempt is not a tryout session.");
  }

  if (!attempt.blueprintId) {
    throw new Error("Tryout session blueprint missing.");
  }

  if (attempt.status === "completed" && attempt.results) {
    return attempt.results;
  }

  const blueprint = await getBlueprintWithSections(attempt.blueprintId);
  if (!blueprint || !blueprint.sections || blueprint.sections.length === 0) {
    throw new Error("Blueprint sections not available.");
  }

  const { results, totalTimeSeconds } = calculateResults(
    attempt.items,
    blueprint.sections.map((section) => ({
      subtestId: section.subtestId,
      name: section.name,
      durationSeconds: section.durationSeconds,
    })),
  );

  let updated: Awaited<ReturnType<typeof updateAttemptForUser>> | null = null;
  try {
    updated = await updateAttemptForUser(data.attemptId, user.id, {
      status: "completed",
      completedAt: new Date(),
      results,
      totalTimeSeconds,
    });
  } catch (error) {
    logServerError(
      {
        scope: "calculate-tryout-results:update-attempt",
        userId: user.id,
        attemptId: data.attemptId,
      },
      error,
    );
    throw error;
  }

  if (!updated) {
    throw new Error("Unable to update tryout results.");
  }

  return results;
}
