"use server";

import { getActiveExams } from "@/data-access/queries/exams";
import { getPublishedQuestionSets } from "@/data-access/queries/question-sets";
import { requireAuthUser } from "@/features/practice/server/require-auth-user";

export async function getPracticeCatalog() {
  await requireAuthUser();

  const exams = await getActiveExams();
  const questionSets = await getPublishedQuestionSets();
  const setsByExamId = new Map<string, typeof questionSets>();

  questionSets.forEach((set) => {
    const existing = setsByExamId.get(set.examId) ?? [];
    existing.push(set);
    setsByExamId.set(set.examId, existing);
  });

  const examsWithSets = exams.map((exam) => ({
    ...exam,
    questionSets: setsByExamId.get(exam.id) ?? [],
  }));

  return { exams: examsWithSets } as const;
}
