"use server";

import { z } from "zod";

import { updateAttemptForUser } from "@/data-access/queries/attempts";
import { logServerError } from "@/features/practice/server/log-server-error";
import { requireAuthUser } from "@/features/practice/server/require-auth-user";

const resultsSchema = z.object({
  totalQuestions: z.number().int().nonnegative(),
  correctCount: z.number().int().nonnegative(),
  wrongCount: z.number().int().nonnegative(),
  blankCount: z.number().int().nonnegative(),
  accuracy: z.number().nonnegative(),
  avgTimePerQuestion: z.number().int().nonnegative(),
});

const completeSchema = z.object({
  attemptId: z.string().min(1),
  totalTimeSeconds: z.number().int().nonnegative().optional(),
  results: resultsSchema,
});

export type CompletePracticeSessionInput = z.infer<typeof completeSchema>;

export async function completeSession(input: CompletePracticeSessionInput) {
  const data = completeSchema.parse(input);
  const user = await requireAuthUser();

  const updateData: Parameters<typeof updateAttemptForUser>[2] = {
    status: "completed",
    completedAt: new Date(),
    results: data.results,
  };

  if (typeof data.totalTimeSeconds === "number") {
    updateData.totalTimeSeconds = data.totalTimeSeconds;
  }

  let updated: Awaited<ReturnType<typeof updateAttemptForUser>> | null = null;
  try {
    updated = await updateAttemptForUser(data.attemptId, user.id, updateData);
  } catch (error) {
    logServerError(
      {
        scope: "complete-session",
        userId: user.id,
        attemptId: data.attemptId,
      },
      error,
    );
    throw error;
  }

  if (!updated) {
    throw new Error("Practice session not found.");
  }

  if (updated.mode !== "practice") {
    throw new Error("Attempt is not a practice session.");
  }

  return data.results;
}
