import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";

import { questions } from "@/data-access/schema";
import { db } from "@/lib/db";

export type Question = typeof questions.$inferSelect;
export type QuestionStatus = Question["status"];
export type QuestionDifficulty = Question["difficulty"];
export type QuestionType = Question["questionType"];

export type QuestionFilters = {
  subtestId?: string;
  status?: QuestionStatus;
  difficulty?: QuestionDifficulty;
  questionType?: QuestionType;
  limit?: number;
  offset?: number;
  sort?: "newest" | "oldest" | "difficulty";
};

export async function getQuestionById(questionId: string) {
  const [question] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1);

  return question ?? null;
}

export async function getQuestionsByFilters(filters: QuestionFilters) {
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

  let query = db.select().from(questions).$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters.sort === "oldest") {
    query = query.orderBy(asc(questions.createdAt));
  } else if (filters.sort === "difficulty") {
    query = query.orderBy(asc(questions.difficulty));
  } else {
    query = query.orderBy(desc(questions.createdAt));
  }

  if (typeof filters.limit === "number") {
    query = query.limit(filters.limit);
  }

  if (typeof filters.offset === "number") {
    query = query.offset(filters.offset);
  }

  return query;
}

export async function getRandomQuestionsByFilters(filters: QuestionFilters) {
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

  let query = db.select().from(questions).$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  query = query.orderBy(sql`RANDOM()`);

  if (typeof filters.limit === "number") {
    query = query.limit(filters.limit);
  }

  if (typeof filters.offset === "number") {
    query = query.offset(filters.offset);
  }

  return query;
}
