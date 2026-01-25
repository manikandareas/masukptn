"use server";

import { z } from "zod";

import { getBlueprintWithSections } from "@/data-access/queries/exams";
import { logServerError } from "@/features/tryout/server/log-server-error";
import { requireAuthUser } from "@/features/tryout/server/require-auth-user";

const blueprintDetailSchema = z.object({
  blueprintId: z.string().min(1),
});

export type GetBlueprintDetailInput = z.infer<typeof blueprintDetailSchema>;

export async function getBlueprintDetail(input: GetBlueprintDetailInput) {
  const data = blueprintDetailSchema.parse(input);
  const user = await requireAuthUser();

  let blueprint: Awaited<ReturnType<typeof getBlueprintWithSections>> | null = null;
  try {
    blueprint = await getBlueprintWithSections(data.blueprintId);
  } catch (error) {
    logServerError(
      {
        scope: "get-blueprint-detail",
        userId: user.id,
        metadata: { blueprintId: data.blueprintId },
      },
      error,
    );
    throw error;
  }

  if (!blueprint) {
    throw new Error("Blueprint not found.");
  }

  const sections = blueprint.sections ?? [];
  const totalQuestions = sections.reduce((total, section) => total + section.questionCount, 0);
  const totalDurationSeconds = sections.reduce(
    (total, section) => total + section.durationSeconds,
    0,
  );

  return {
    ...blueprint,
    sections,
    totalQuestions,
    totalDurationSeconds,
  } as const;
}
