import { and, asc, desc, eq, ilike, sql, type SQL } from "drizzle-orm";

import {
  questions,
  questionSets,
  questionSetItems,
  subtests,
  exams,
} from "@/data-access/schema";
import { db } from "@/lib/db";

export type AdminStats = {
  questions: {
    total: number;
    published: number;
    draft: number;
  };
  questionSets: {
    total: number;
    published: number;
  };
};

export type QuestionFiltersAdmin = {
  subtestId?: string;
  status?: "draft" | "published";
  difficulty?: "easy" | "medium" | "hard";
  questionType?: "single_choice" | "complex_selection" | "fill_in";
  search?: string;
  limit?: number;
  offset?: number;
};

export type QuestionSetFiltersAdmin = {
  examId?: string;
  subtestId?: string;
  status?: "draft" | "published";
  limit?: number;
  offset?: number;
};

export type NewQuestion = typeof questions.$inferInsert;
export type NewQuestionSet = typeof questionSets.$inferInsert;

// Helper to build filter conditions for question queries
function buildQuestionFilters(filters: QuestionFiltersAdmin): SQL[] {
  const conditions: SQL[] = [];

  if (filters.subtestId) {
    conditions.push(eq(questions.subtestId, filters.subtestId));
  }

  if (filters.status) {
    conditions.push(eq(questions.status, filters.status));
  }

  if (filters.difficulty) {
    conditions.push(eq(questions.difficulty, filters.difficulty));
  }

  if (filters.questionType) {
    conditions.push(eq(questions.questionType, filters.questionType));
  }

  if (filters.search) {
    conditions.push(ilike(questions.stem, `%${filters.search}%`));
  }

  return conditions;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [questionStats] = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
      published:
        sql<number>`count(*) filter (where ${questions.status} = 'published')`.mapWith(
          Number,
        ),
      draft:
        sql<number>`count(*) filter (where ${questions.status} = 'draft')`.mapWith(
          Number,
        ),
    })
    .from(questions);

  const [questionSetStats] = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
      published:
        sql<number>`count(*) filter (where ${questionSets.status} = 'published')`.mapWith(
          Number,
        ),
    })
    .from(questionSets);

  return {
    questions: questionStats ?? { total: 0, published: 0, draft: 0 },
    questionSets: questionSetStats ?? { total: 0, published: 0 },
  };
}

export async function getQuestionsByFiltersAdmin(
  filters: QuestionFiltersAdmin,
) {
  const conditions = buildQuestionFilters(filters);

  const rows = await db
    .select({
      question: questions,
      subtest: subtests,
    })
    .from(questions)
    .innerJoin(subtests, eq(questions.subtestId, subtests.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(questions.createdAt))
    .limit(filters.limit ?? 20)
    .offset(filters.offset ?? 0);

  return rows.map((row) => ({
    ...row.question,
    subtest: row.subtest,
  }));
}

export async function getQuestionByIdAdmin(questionId: string) {
  const [row] = await db
    .select({
      question: questions,
      subtest: subtests,
    })
    .from(questions)
    .innerJoin(subtests, eq(questions.subtestId, subtests.id))
    .where(eq(questions.id, questionId))
    .limit(1);

  if (!row) return null;

  return {
    ...row.question,
    subtest: row.subtest,
  };
}

export async function getQuestionsCountAdmin(
  filters: Omit<QuestionFiltersAdmin, "limit" | "offset">,
) {
  const conditions = buildQuestionFilters(filters);

  const [result] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(questions)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result?.count ?? 0;
}

export async function insertQuestion(data: NewQuestion) {
  const [result] = await db.insert(questions).values(data).returning();
  return result;
}

export async function updateQuestionById(
  id: string,
  data: Partial<NewQuestion>,
) {
  const [result] = await db
    .update(questions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(questions.id, id))
    .returning();
  return result;
}

export async function deleteQuestionById(id: string) {
  await db.delete(questions).where(eq(questions.id, id));
}

export async function getQuestionSetsByFiltersAdmin(
  filters: QuestionSetFiltersAdmin,
) {
  const conditions: SQL[] = [];

  if (filters.examId) {
    conditions.push(eq(questionSets.examId, filters.examId));
  }

  if (filters.subtestId) {
    conditions.push(eq(questionSets.subtestId, filters.subtestId));
  }

  if (filters.status) {
    conditions.push(eq(questionSets.status, filters.status));
  }

  // Get question counts per set
  const counts = await db
    .select({
      questionSetId: questionSetItems.questionSetId,
      questionCount: sql<number>`count(${questionSetItems.id})`.mapWith(Number),
    })
    .from(questionSetItems)
    .groupBy(questionSetItems.questionSetId);

  const countById = new Map(
    counts.map((row) => [row.questionSetId, row.questionCount]),
  );

  const rows = await db
    .select({
      questionSet: questionSets,
      exam: exams,
      subtest: subtests,
    })
    .from(questionSets)
    .innerJoin(exams, eq(questionSets.examId, exams.id))
    .leftJoin(subtests, eq(questionSets.subtestId, subtests.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(questionSets.createdAt))
    .limit(filters.limit ?? 20)
    .offset(filters.offset ?? 0);

  return rows.map((row) => ({
    ...row.questionSet,
    exam: row.exam,
    subtest: row.subtest,
    questionCount: countById.get(row.questionSet.id) ?? 0,
  }));
}

export async function getQuestionSetByIdAdmin(questionSetId: string) {
  const [row] = await db
    .select({
      questionSet: questionSets,
      exam: exams,
      subtest: subtests,
    })
    .from(questionSets)
    .innerJoin(exams, eq(questionSets.examId, exams.id))
    .leftJoin(subtests, eq(questionSets.subtestId, subtests.id))
    .where(eq(questionSets.id, questionSetId))
    .limit(1);

  if (!row) return null;

  // Get questions in the set
  const items = await db
    .select({
      item: questionSetItems,
      question: questions,
      subtest: subtests,
    })
    .from(questionSetItems)
    .innerJoin(questions, eq(questionSetItems.questionId, questions.id))
    .innerJoin(subtests, eq(questions.subtestId, subtests.id))
    .where(eq(questionSetItems.questionSetId, questionSetId))
    .orderBy(asc(questionSetItems.sortOrder));

  return {
    ...row.questionSet,
    exam: row.exam,
    subtest: row.subtest,
    questions: items.map((item) => ({
      ...item.item,
      question: {
        ...item.question,
        subtest: item.subtest,
      },
    })),
  };
}

export async function getQuestionSetsCountAdmin(
  filters: Omit<QuestionSetFiltersAdmin, "limit" | "offset">,
) {
  const conditions: SQL[] = [];

  if (filters.examId) {
    conditions.push(eq(questionSets.examId, filters.examId));
  }

  if (filters.subtestId) {
    conditions.push(eq(questionSets.subtestId, filters.subtestId));
  }

  if (filters.status) {
    conditions.push(eq(questionSets.status, filters.status));
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(questionSets)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result?.count ?? 0;
}

export async function insertQuestionSet(data: NewQuestionSet) {
  const [result] = await db.insert(questionSets).values(data).returning();
  return result;
}

export async function updateQuestionSetById(
  id: string,
  data: Partial<NewQuestionSet>,
) {
  const [result] = await db
    .update(questionSets)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(questionSets.id, id))
    .returning();
  return result;
}

export async function deleteQuestionSetById(id: string) {
  // Items are deleted via cascade
  await db.delete(questionSets).where(eq(questionSets.id, id));
}

export async function replaceQuestionSetItems(
  questionSetId: string,
  questionIds: string[],
) {
  await db.transaction(async (tx) => {
    // Delete existing items
    await tx
      .delete(questionSetItems)
      .where(eq(questionSetItems.questionSetId, questionSetId));

    // Insert new items with sort order
    if (questionIds.length > 0) {
      await tx.insert(questionSetItems).values(
        questionIds.map((questionId, index) => ({
          questionSetId,
          questionId,
          sortOrder: index,
        })),
      );
    }
  });
}

export async function getAllSubtests() {
  return db
    .select({
      subtest: subtests,
      exam: exams,
    })
    .from(subtests)
    .innerJoin(exams, eq(subtests.examId, exams.id))
    .where(eq(subtests.isActive, true))
    .orderBy(asc(exams.name), asc(subtests.sortOrder));
}

export async function getAllExams() {
  return db
    .select()
    .from(exams)
    .where(eq(exams.isActive, true))
    .orderBy(asc(exams.name));
}
