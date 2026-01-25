import { and, asc, eq, inArray } from "drizzle-orm";

import { attemptItems, attempts, questions } from "@/data-access/schema";
import { db } from "@/lib/db";

export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type AttemptItem = typeof attemptItems.$inferSelect;
export type NewAttemptItem = typeof attemptItems.$inferInsert;
export type AttemptResults = NonNullable<Attempt["results"]>;
export type Question = typeof questions.$inferSelect;
export type AttemptItemWithQuestion = AttemptItem & { question: Question };

export async function getAttemptById(attemptId: string) {
  const [attempt] = await db
    .select()
    .from(attempts)
    .where(eq(attempts.id, attemptId))
    .limit(1);

  return attempt ?? null;
}

export async function createAttempt(data: NewAttempt) {
  const [created] = await db.insert(attempts).values(data).returning();
  return created ?? null;
}

export async function updateAttempt(
  attemptId: string,
  data: Partial<NewAttempt>,
) {
  const [updated] = await db
    .update(attempts)
    .set(data)
    .where(eq(attempts.id, attemptId))
    .returning();
  return updated ?? null;
}

export async function updateAttemptForUser(
  attemptId: string,
  userId: string,
  data: Partial<NewAttempt>,
) {
  const [updated] = await db
    .update(attempts)
    .set(data)
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, userId)))
    .returning();

  return updated ?? null;
}

export async function completeAttempt(
  attemptId: string,
  results: AttemptResults,
  totalTimeSeconds?: number,
) {
  const updateData: Partial<NewAttempt> = {
    status: "completed",
    completedAt: new Date(),
    results,
  };

  if (typeof totalTimeSeconds === "number") {
    updateData.totalTimeSeconds = totalTimeSeconds;
  }

  return updateAttempt(attemptId, updateData);
}

export async function createAttemptItems(items: NewAttemptItem[]) {
  if (items.length === 0) return [];
  return db.insert(attemptItems).values(items).returning();
}

export async function updateAttemptItem(
  attemptItemId: string,
  data: Partial<NewAttemptItem>,
) {
  const [updated] = await db
    .update(attemptItems)
    .set(data)
    .where(eq(attemptItems.id, attemptItemId))
    .returning();

  return updated ?? null;
}

export async function getAttemptWithItems(attemptId: string) {
  const [attempt] = await db
    .select()
    .from(attempts)
    .where(eq(attempts.id, attemptId))
    .limit(1);

  if (!attempt) return null;

  const items = await db
    .select()
    .from(attemptItems)
    .where(eq(attemptItems.attemptId, attemptId))
    .orderBy(asc(attemptItems.sortOrder));

  if (items.length === 0) {
    return { ...attempt, items: [] };
  }

  const questionIds = items.map((item) => item.questionId);
  const questionRows = await db
    .select()
    .from(questions)
    .where(inArray(questions.id, questionIds));

  const questionMap = new Map<string, Question>(
    questionRows.map((question) => [question.id, question]),
  );

  const itemsWithQuestions = items
    .map((item) => ({
      ...item,
      question: questionMap.get(item.questionId) ?? null,
    }))
    .filter((item): item is AttemptItemWithQuestion => item.question !== null);

  return { ...attempt, items: itemsWithQuestions };
}

export async function getAttemptItemWithQuestion(attemptItemId: string) {
  const [item] = await db
    .select()
    .from(attemptItems)
    .where(eq(attemptItems.id, attemptItemId))
    .limit(1);

  if (!item) return null;

  const [question] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, item.questionId))
    .limit(1);

  const [attempt] = await db
    .select()
    .from(attempts)
    .where(eq(attempts.id, item.attemptId))
    .limit(1);

  if (!question || !attempt) return null;

  return { ...item, question, attempt };
}
