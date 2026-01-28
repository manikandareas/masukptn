import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";

import {
  exams,
  questionImportQuestions,
  questionImports,
  questionSets,
  subtests,
} from "@/data-access/schema";
import { db } from "@/lib/db";

export type QuestionImportFilters = {
  status?: "queued" | "processing" | "ready" | "failed" | "saved";
  createdBy?: string;
  limit?: number;
  offset?: number;
};

export type NewQuestionImport = typeof questionImports.$inferInsert;
export type NewQuestionImportQuestion = typeof questionImportQuestions.$inferInsert;

function buildImportFilters(filters: QuestionImportFilters): SQL[] {
  const conditions: SQL[] = [];

  if (filters.status) {
    conditions.push(eq(questionImports.status, filters.status));
  }

  if (filters.createdBy) {
    conditions.push(eq(questionImports.createdBy, filters.createdBy));
  }

  return conditions;
}

export async function getQuestionImportsByFilters(filters: QuestionImportFilters) {
  const conditions = buildImportFilters(filters);

  const counts = await db
    .select({
      importId: questionImportQuestions.importId,
      questionCount: sql<number>`count(${questionImportQuestions.id})`.mapWith(
        Number,
      ),
    })
    .from(questionImportQuestions)
    .groupBy(questionImportQuestions.importId);

  const countById = new Map(
    counts.map((row) => [row.importId, row.questionCount]),
  );

  const rows = await db
    .select({
      import: questionImports,
      exam: exams,
      subtest: subtests,
      savedQuestionSet: questionSets,
    })
    .from(questionImports)
    .leftJoin(exams, eq(questionImports.draftExamId, exams.id))
    .leftJoin(subtests, eq(questionImports.draftSubtestId, subtests.id))
    .leftJoin(questionSets, eq(questionImports.savedQuestionSetId, questionSets.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(questionImports.createdAt))
    .limit(filters.limit ?? 20)
    .offset(filters.offset ?? 0);

  return rows.map((row) => ({
    ...row.import,
    exam: row.exam,
    subtest: row.subtest,
    savedQuestionSet: row.savedQuestionSet,
    questionCount: countById.get(row.import.id) ?? 0,
  }));
}

export async function getQuestionImportsCount(
  filters: Omit<QuestionImportFilters, "limit" | "offset">,
) {
  const conditions = buildImportFilters(filters);

  const [result] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(questionImports)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result?.count ?? 0;
}

export async function getQuestionImportById(id: string) {
  const [row] = await db
    .select({
      import: questionImports,
      exam: exams,
      subtest: subtests,
      savedQuestionSet: questionSets,
    })
    .from(questionImports)
    .leftJoin(exams, eq(questionImports.draftExamId, exams.id))
    .leftJoin(subtests, eq(questionImports.draftSubtestId, subtests.id))
    .leftJoin(questionSets, eq(questionImports.savedQuestionSetId, questionSets.id))
    .where(eq(questionImports.id, id))
    .limit(1);

  if (!row) return null;

  const questions = await db
    .select({
      draft: questionImportQuestions,
      subtest: subtests,
    })
    .from(questionImportQuestions)
    .leftJoin(subtests, eq(questionImportQuestions.subtestId, subtests.id))
    .where(eq(questionImportQuestions.importId, id))
    .orderBy(asc(questionImportQuestions.sortOrder));

  return {
    ...row.import,
    exam: row.exam,
    subtest: row.subtest,
    savedQuestionSet: row.savedQuestionSet,
    questions: questions.map((item) => ({
      ...item.draft,
      subtest: item.subtest,
    })),
  };
}

export async function getQuestionImportQuestionById(id: string) {
  const [row] = await db
    .select({
      draft: questionImportQuestions,
      subtest: subtests,
    })
    .from(questionImportQuestions)
    .leftJoin(subtests, eq(questionImportQuestions.subtestId, subtests.id))
    .where(eq(questionImportQuestions.id, id))
    .limit(1);

  if (!row) return null;

  return {
    ...row.draft,
    subtest: row.subtest,
  };
}

export async function insertQuestionImport(data: NewQuestionImport) {
  const [result] = await db.insert(questionImports).values(data).returning();
  return result;
}

export async function updateQuestionImportById(
  id: string,
  data: Partial<NewQuestionImport>,
) {
  const [result] = await db
    .update(questionImports)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(questionImports.id, id))
    .returning();
  return result;
}

export async function deleteQuestionImportQuestionsByImportId(importId: string) {
  await db
    .delete(questionImportQuestions)
    .where(eq(questionImportQuestions.importId, importId));
}

export async function insertQuestionImportQuestions(
  questions: NewQuestionImportQuestion[],
) {
  if (questions.length === 0) return [];
  const result = await db
    .insert(questionImportQuestions)
    .values(questions)
    .returning();
  return result;
}

export async function updateQuestionImportQuestionById(
  id: string,
  data: Partial<NewQuestionImportQuestion>,
) {
  const [result] = await db
    .update(questionImportQuestions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(questionImportQuestions.id, id))
    .returning();
  return result;
}
