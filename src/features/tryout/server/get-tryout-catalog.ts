"use server";

import {
  getActiveBlueprintsByExamId,
  getActiveExams,
  getBlueprintWithSections,
} from "@/data-access/queries/exams";
import { logServerError } from "@/features/tryout/server/log-server-error";
import { requireAuthUser } from "@/features/tryout/server/require-auth-user";

export async function getTryoutCatalog() {
  const user = await requireAuthUser();

  let exams: Awaited<ReturnType<typeof getActiveExams>> = [];
  try {
    exams = await getActiveExams();
  } catch (error) {
    logServerError({ scope: "get-tryout-catalog:exams", userId: user.id }, error);
    throw error;
  }

  const examEntries = await Promise.all(
    exams.map(async (exam) => {
      let blueprints: Awaited<ReturnType<typeof getActiveBlueprintsByExamId>> = [];
      try {
        blueprints = await getActiveBlueprintsByExamId(exam.id);
      } catch (error) {
        logServerError(
          {
            scope: "get-tryout-catalog:blueprints",
            userId: user.id,
            metadata: { examId: exam.id },
          },
          error,
        );
        throw error;
      }

      const blueprintSummaries = await Promise.all(
        blueprints.map(async (blueprint) => {
          const full = await getBlueprintWithSections(blueprint.id);
          const sections = full?.sections ?? [];
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
          };
        }),
      );

      return {
        ...exam,
        blueprints: blueprintSummaries,
      };
    }),
  );

  return { exams: examEntries } as const;
}
