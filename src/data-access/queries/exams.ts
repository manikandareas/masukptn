import { and, asc, eq } from "drizzle-orm";

import {
  blueprints,
  blueprintSections,
  exams,
  subtests,
} from "@/data-access/schema";
import { db } from "@/lib/db";

export type Exam = typeof exams.$inferSelect;
export type Subtest = typeof subtests.$inferSelect;
export type Blueprint = typeof blueprints.$inferSelect;
export type BlueprintSection = typeof blueprintSections.$inferSelect;

export async function getActiveExams() {
  return db
    .select()
    .from(exams)
    .where(eq(exams.isActive, true))
    .orderBy(asc(exams.name));
}

export async function getExamByCode(code: string) {
  const [exam] = await db
    .select()
    .from(exams)
    .where(eq(exams.code, code))
    .limit(1);

  return exam ?? null;
}

export async function getSubtestsByExamId(examId: string) {
  return db
    .select()
    .from(subtests)
    .where(eq(subtests.examId, examId))
    .orderBy(asc(subtests.sortOrder));
}

export async function getSubtestById(subtestId: string) {
  const [subtest] = await db
    .select()
    .from(subtests)
    .where(eq(subtests.id, subtestId))
    .limit(1);

  return subtest ?? null;
}

export async function getSubtestWithExam(subtestId: string) {
  return db.query.subtests.findFirst({
    where: eq(subtests.id, subtestId),
    with: {
      exam: true,
    },
  });
}

export async function getSubtestsByExamCode(examCode: string) {
  const exam = await getExamByCode(examCode);
  if (!exam) return [];
  return getSubtestsByExamId(exam.id);
}

export async function getActiveBlueprintsByExamId(examId: string) {
  return db
    .select()
    .from(blueprints)
    .where(and(eq(blueprints.examId, examId), eq(blueprints.isActive, true)))
    .orderBy(asc(blueprints.version));
}

export async function getBlueprintWithSections(blueprintId: string) {
  return db.query.blueprints.findFirst({
    where: eq(blueprints.id, blueprintId),
    with: {
      sections: {
        with: {
          subtest: true,
        },
        orderBy: (sections, { asc }) => [asc(sections.sortOrder)],
      },
    },
  });
}
