"use server";

import { z } from "zod";

import { getAttemptById, updateAttemptForUser } from "@/data-access/queries/attempts";
import { getBlueprintWithSections } from "@/data-access/queries/exams";
import { logServerError } from "@/features/tryout/server/log-server-error";
import { requireAuthUser } from "@/features/tryout/server/require-auth-user";

const endSectionSchema = z.object({
  attemptId: z.string().min(1),
  sectionIndex: z.number().int().nonnegative(),
});

export type EndSectionInput = z.infer<typeof endSectionSchema>;

export async function endSection(input: EndSectionInput) {
  const data = endSectionSchema.parse(input);
  const user = await requireAuthUser();

  let attempt: Awaited<ReturnType<typeof getAttemptById>> | null = null;
  try {
    attempt = await getAttemptById(data.attemptId);
  } catch (error) {
    logServerError(
      {
        scope: "end-section:load-attempt",
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

  if (attempt.status !== "in_progress") {
    throw new Error("Tryout session is already completed.");
  }

  if (!attempt.blueprintId) {
    throw new Error("Tryout session blueprint missing.");
  }

  const blueprint = await getBlueprintWithSections(attempt.blueprintId);
  if (!blueprint || !blueprint.sections || blueprint.sections.length === 0) {
    throw new Error("Blueprint sections not available.");
  }

  const currentIndex = attempt.configSnapshot?.currentSectionIndex ?? 0;
  if (currentIndex !== data.sectionIndex) {
    throw new Error("Section mismatch. Please reload your session.");
  }

  const nextIndex = data.sectionIndex + 1;
  const isCompleted = nextIndex >= blueprint.sections.length;

  const { sectionStartedAt: _omit, ...rest } = attempt.configSnapshot ?? {};
  const nextSnapshot = {
    ...rest,
    currentSectionIndex: isCompleted ? data.sectionIndex : nextIndex,
  };

  let updated: Awaited<ReturnType<typeof updateAttemptForUser>> | null = null;
  try {
    updated = await updateAttemptForUser(data.attemptId, user.id, {
      configSnapshot: nextSnapshot,
    });
  } catch (error) {
    logServerError(
      {
        scope: "end-section:update-attempt",
        userId: user.id,
        attemptId: data.attemptId,
      },
      error,
    );
    throw error;
  }

  if (!updated) {
    throw new Error("Unable to end section.");
  }

  return {
    nextSectionIndex: isCompleted ? null : nextIndex,
    isCompleted,
  } as const;
}
