"use server";

import { z } from "zod";

import { getAttemptWithItems } from "@/data-access/queries/attempts";
import { logServerError } from "@/features/practice/server/log-server-error";
import { requireAuthUser } from "@/features/practice/server/require-auth-user";

const sessionSchema = z.object({
  attemptId: z.string().min(1),
});

export type GetPracticeSessionInput = z.infer<typeof sessionSchema>;

export async function getPracticeSession(input: GetPracticeSessionInput) {
  const data = sessionSchema.parse(input);
  const user = await requireAuthUser();

  let attempt: Awaited<ReturnType<typeof getAttemptWithItems>> | null = null;
  try {
    attempt = await getAttemptWithItems(data.attemptId);
  } catch (error) {
    logServerError(
      {
        scope: "get-practice-session",
        userId: user.id,
        attemptId: data.attemptId,
      },
      error,
    );
    throw error;
  }

  if (!attempt) {
    throw new Error("Practice session not found.");
  }

  if (attempt.userId !== user.id) {
    throw new Error("Unauthorized access to practice session.");
  }

  if (attempt.mode !== "practice") {
    throw new Error("Attempt is not a practice session.");
  }

  return attempt;
}
