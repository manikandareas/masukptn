"use server";

import { z } from "zod";

import { getAttemptWithItems } from "@/data-access/queries/attempts";
import { getBlueprintWithSections } from "@/data-access/queries/exams";
import { logServerError } from "@/features/tryout/server/log-server-error";
import { requireAuthUser } from "@/features/tryout/server/require-auth-user";

const sessionSchema = z.object({
  attemptId: z.string().min(1),
});

export type GetTryoutSessionInput = z.infer<typeof sessionSchema>;

export async function getTryoutSession(input: GetTryoutSessionInput) {
  const data = sessionSchema.parse(input);
  const user = await requireAuthUser();

  let attempt: Awaited<ReturnType<typeof getAttemptWithItems>> | null = null;
  try {
    attempt = await getAttemptWithItems(data.attemptId);
  } catch (error) {
    logServerError(
      {
        scope: "get-tryout-session",
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

  const blueprint = await getBlueprintWithSections(attempt.blueprintId);
  if (!blueprint) {
    throw new Error("Blueprint not found for this tryout.");
  }

  return {
    ...attempt,
    blueprint,
    serverTime: new Date().toISOString(),
  } as const;
}
