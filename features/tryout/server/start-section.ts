"use server";

import { z } from "zod";

import { getAttemptById, updateAttemptForUser } from "@/data-access/queries/attempts";
import { getBlueprintWithSections } from "@/data-access/queries/exams";
import { logServerError } from "@/features/tryout/server/log-server-error";
import { requireAuthUser } from "@/features/tryout/server/require-auth-user";

const startSectionSchema = z.object({
  attemptId: z.string().min(1),
  sectionIndex: z.number().int().nonnegative(),
});

export type StartSectionInput = z.infer<typeof startSectionSchema>;

export async function startSection(input: StartSectionInput) {
  const data = startSectionSchema.parse(input);
  const user = await requireAuthUser();

  let attempt: Awaited<ReturnType<typeof getAttemptById>> | null = null;
  try {
    attempt = await getAttemptById(data.attemptId);
  } catch (error) {
    logServerError(
      {
        scope: "start-section:load-attempt",
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

  const section = blueprint.sections[data.sectionIndex];
  if (!section) {
    throw new Error("Invalid section index.");
  }

  const snapshot = attempt.configSnapshot ?? {};
  const existingIndex = snapshot.currentSectionIndex;
  const existingStart = snapshot.sectionStartedAt;

  if (existingIndex === data.sectionIndex && existingStart) {
    return {
      sectionIndex: data.sectionIndex,
      sectionStartedAt: existingStart,
      serverTime: new Date().toISOString(),
      section,
    } as const;
  }

  const nowIso = new Date().toISOString();

  let updated: Awaited<ReturnType<typeof updateAttemptForUser>> | null = null;
  try {
    updated = await updateAttemptForUser(data.attemptId, user.id, {
      configSnapshot: {
        ...snapshot,
        currentSectionIndex: data.sectionIndex,
        sectionStartedAt: nowIso,
      },
    });
  } catch (error) {
    logServerError(
      {
        scope: "start-section:update-attempt",
        userId: user.id,
        attemptId: data.attemptId,
      },
      error,
    );
    throw error;
  }

  if (!updated) {
    throw new Error("Unable to start section.");
  }

  return {
    sectionIndex: data.sectionIndex,
    sectionStartedAt: nowIso,
    serverTime: new Date().toISOString(),
    section,
  } as const;
}
