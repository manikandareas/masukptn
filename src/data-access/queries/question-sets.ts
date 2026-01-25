import { and, asc, eq, sql } from "drizzle-orm";

import {
  questionSetItems,
  questionSets,
  questions,
  subtests,
  exams,
} from "@/data-access/schema";
import { db } from "@/lib/db";

export type QuestionSet = typeof questionSets.$inferSelect;
export type QuestionSetItem = typeof questionSetItems.$inferSelect;
export type QuestionSetItemWithQuestion = QuestionSetItem & {
  question: typeof questions.$inferSelect;
};

export type QuestionSetSummary = QuestionSet & {
  subtest: typeof subtests.$inferSelect | null;
  questionCount: number;
};

export async function getPublishedQuestionSets(): Promise<
  QuestionSetSummary[]
> {
  const counts = await db
    .select({
      questionSetId: questionSetItems.questionSetId,
      questionCount:
        sql<number>`coalesce(count(${questionSetItems.id}), 0)`.mapWith(Number),
    })
    .from(questionSetItems)
    .innerJoin(questions, eq(questionSetItems.questionId, questions.id))
    .where(eq(questions.status, "published"))
    .groupBy(questionSetItems.questionSetId);

  const countById = new Map(
    counts.map((row) => [row.questionSetId, row.questionCount]),
  );

  const rows = await db
    .select({
      questionSet: questionSets,
      subtest: subtests,
    })
    .from(questionSets)
    .innerJoin(exams, eq(questionSets.examId, exams.id))
    .leftJoin(subtests, eq(questionSets.subtestId, subtests.id))
    .where(and(eq(questionSets.status, "published"), eq(exams.isActive, true)))
    .orderBy(asc(exams.name), asc(questionSets.name));

  return rows.map((row) => ({
    ...row.questionSet,
    subtest: row.subtest,
    questionCount: countById.get(row.questionSet.id) ?? 0,
  }));
}

export async function getPublishedQuestionSetById(questionSetId: string) {
  const [row] = await db
    .select()
    .from(questionSets)
    .where(
      and(
        eq(questionSets.id, questionSetId),
        eq(questionSets.status, "published"),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function getQuestionSetItemsWithQuestions(questionSetId: string) {
  const rows = await db
    .select({
      item: questionSetItems,
      question: questions,
    })
    .from(questionSetItems)
    .innerJoin(questions, eq(questionSetItems.questionId, questions.id))
    .where(
      and(
        eq(questionSetItems.questionSetId, questionSetId),
        eq(questions.status, "published"),
      ),
    )
    .orderBy(asc(questionSetItems.sortOrder));

  return rows.map((row) => ({
    ...row.item,
    question: row.question,
  }));
}
