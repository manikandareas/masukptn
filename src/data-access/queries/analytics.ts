import { and, asc, desc, eq, gte, or, sql } from "drizzle-orm";

import {
  attemptItems,
  attempts,
  blueprints,
  questionSets,
  questions,
  subtests,
} from "@/data-access/schema";
import { db } from "@/lib/db";

export type UserSummaryStats = {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  accuracy: number;
  avgTimeSeconds: number;
  totalTimeSeconds: number;
};

export type SubtestPerformance = {
  subtestId: string;
  subtestName: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  avgTimeSeconds: number;
};

export type PerformanceTrendPoint = {
  date: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  avgTimeSeconds: number;
};

type AttemptRecord = typeof attempts.$inferSelect;

export type RecentAttemptRow = {
  attemptId: string;
  mode: AttemptRecord["mode"];
  status: AttemptRecord["status"];
  createdAt: AttemptRecord["createdAt"];
  completedAt: AttemptRecord["completedAt"];
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  questionSetName: string | null;
  blueprintName: string | null;
  subtestName: string | null;
};

export async function getUserSummaryStats(
  userId: string,
): Promise<UserSummaryStats> {
  const [row] = await db
    .select({
      totalQuestions:
        sql<number>`coalesce(count(${attemptItems.id}), 0)`.mapWith(Number),
      correctCount:
        sql<number>`coalesce(sum(case when ${attemptItems.isCorrect} = true then 1 else 0 end), 0)`.mapWith(
          Number,
        ),
      wrongCount:
        sql<number>`coalesce(sum(case when ${attemptItems.isCorrect} = false then 1 else 0 end), 0)`.mapWith(
          Number,
        ),
      blankCount:
        sql<number>`coalesce(sum(case when ${attemptItems.userAnswer} is null then 1 else 0 end), 0)`.mapWith(
          Number,
        ),
      totalTimeSeconds:
        sql<number>`coalesce(sum(coalesce(${attemptItems.timeSpentSeconds}, 0)), 0)`.mapWith(
          Number,
        ),
      avgTimeSeconds:
        sql<number>`coalesce(avg(coalesce(${attemptItems.timeSpentSeconds}, 0)), 0)`.mapWith(
          Number,
        ),
    })
    .from(attemptItems)
    .innerJoin(attempts, eq(attemptItems.attemptId, attempts.id))
    .where(eq(attempts.userId, userId));

  const totalQuestions = row?.totalQuestions ?? 0;
  const correctCount = row?.correctCount ?? 0;
  const wrongCount = row?.wrongCount ?? 0;
  const blankCount = row?.blankCount ?? 0;
  const totalTimeSeconds = row?.totalTimeSeconds ?? 0;
  const avgTimeSeconds = row?.avgTimeSeconds ?? 0;

  return {
    totalQuestions,
    correctCount,
    wrongCount,
    blankCount,
    accuracy: totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0,
    avgTimeSeconds,
    totalTimeSeconds,
  };
}

export async function getUserSubtestPerformance(
  userId: string,
): Promise<SubtestPerformance[]> {
  const rows = await db
    .select({
      subtestId: subtests.id,
      subtestName: subtests.name,
      sortOrder: subtests.sortOrder,
      totalQuestions:
        sql<number>`coalesce(count(${attemptItems.id}), 0)`.mapWith(Number),
      correctCount:
        sql<number>`coalesce(sum(case when ${attemptItems.isCorrect} = true then 1 else 0 end), 0)`.mapWith(
          Number,
        ),
      avgTimeSeconds:
        sql<number>`coalesce(avg(coalesce(${attemptItems.timeSpentSeconds}, 0)), 0)`.mapWith(
          Number,
        ),
    })
    .from(attemptItems)
    .innerJoin(attempts, eq(attemptItems.attemptId, attempts.id))
    .innerJoin(questions, eq(attemptItems.questionId, questions.id))
    .innerJoin(subtests, eq(questions.subtestId, subtests.id))
    .where(eq(attempts.userId, userId))
    .groupBy(subtests.id, subtests.name, subtests.sortOrder)
    .orderBy(asc(subtests.sortOrder));

  return rows.map((row) => ({
    subtestId: row.subtestId,
    subtestName: row.subtestName,
    totalQuestions: row.totalQuestions,
    correctCount: row.correctCount,
    accuracy:
      row.totalQuestions > 0
        ? (row.correctCount / row.totalQuestions) * 100
        : 0,
    avgTimeSeconds: row.avgTimeSeconds,
  }));
}

export async function getUserPerformanceTrend(
  userId: string,
  days: number,
): Promise<PerformanceTrendPoint[]> {
  if (days <= 0) return [];

  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

  const rows = await db
    .select({
      answeredAt: attemptItems.answeredAt,
      createdAt: attemptItems.createdAt,
      isCorrect: attemptItems.isCorrect,
      timeSpentSeconds: attemptItems.timeSpentSeconds,
    })
    .from(attemptItems)
    .innerJoin(attempts, eq(attemptItems.attemptId, attempts.id))
    .where(
      and(
        eq(attempts.userId, userId),
        or(
          gte(attemptItems.answeredAt, startDate),
          gte(attemptItems.createdAt, startDate),
        ),
      ),
    )
    .orderBy(asc(attemptItems.createdAt));

  const rowMap = new Map<
    string,
    { totalQuestions: number; correctCount: number; timeSum: number }
  >();

  rows.forEach((row) => {
    const eventDate = row.answeredAt ?? row.createdAt;
    if (!eventDate) return;
    const key = eventDate.toISOString().slice(0, 10);
    const current = rowMap.get(key) ?? {
      totalQuestions: 0,
      correctCount: 0,
      timeSum: 0,
    };

    current.totalQuestions += 1;
    if (row.isCorrect === true) {
      current.correctCount += 1;
    }
    current.timeSum += row.timeSpentSeconds ?? 0;
    rowMap.set(key, current);
  });

  const points: PerformanceTrendPoint[] = [];
  const cursor = new Date(startDate);

  for (let index = 0; index < days; index += 1) {
    const key = cursor.toISOString().slice(0, 10);
    const row = rowMap.get(key);
    const totalQuestions = row?.totalQuestions ?? 0;
    const correctCount = row?.correctCount ?? 0;
    const avgTimeSeconds =
      totalQuestions > 0 ? (row?.timeSum ?? 0) / totalQuestions : 0;

    points.push({
      date: key,
      totalQuestions,
      correctCount,
      accuracy: totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0,
      avgTimeSeconds,
    });

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return points;
}

export async function getRecentAttempts(
  userId: string,
  limit = 5,
): Promise<RecentAttemptRow[]> {
  const rows = await db
    .select({
      attemptId: attempts.id,
      mode: attempts.mode,
      status: attempts.status,
      createdAt: attempts.createdAt,
      completedAt: attempts.completedAt,
      questionSetName: questionSets.name,
      blueprintName: blueprints.name,
      subtestName: subtests.name,
      totalQuestions:
        sql<number>`coalesce(count(${attemptItems.id}), 0)`.mapWith(Number),
      correctCount:
        sql<number>`coalesce(sum(case when ${attemptItems.isCorrect} = true then 1 else 0 end), 0)`.mapWith(
          Number,
        ),
    })
    .from(attempts)
    .leftJoin(attemptItems, eq(attemptItems.attemptId, attempts.id))
    .leftJoin(questionSets, eq(attempts.questionSetId, questionSets.id))
    .leftJoin(blueprints, eq(attempts.blueprintId, blueprints.id))
    .leftJoin(subtests, eq(attempts.subtestId, subtests.id))
    .where(eq(attempts.userId, userId))
    .groupBy(
      attempts.id,
      attempts.mode,
      attempts.status,
      attempts.createdAt,
      attempts.completedAt,
      questionSets.name,
      blueprints.name,
      subtests.name,
    )
    .orderBy(desc(attempts.createdAt))
    .limit(Math.max(1, limit));

  return rows.map((row) => {
    const accuracy =
      row.totalQuestions > 0
        ? (row.correctCount / row.totalQuestions) * 100
        : 0;
    return {
      attemptId: row.attemptId,
      mode: row.mode,
      status: row.status,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
      totalQuestions: row.totalQuestions,
      correctCount: row.correctCount,
      accuracy,
      questionSetName: row.questionSetName ?? null,
      blueprintName: row.blueprintName ?? null,
      subtestName: row.subtestName ?? null,
    };
  });
}
