"use server";

import { eq } from "drizzle-orm";

import { getQuestionImportById } from "@/data-access/queries/question-imports";
import {
  questionImportQuestions,
  questionImports,
  questionSetItems,
  questionSets,
  questions,
} from "@/data-access/schema";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionSet } from "@/features/admin/server/serializers";
import { db } from "@/lib/db";

export async function finalizeAdminQuestionImportAction(input: { id: string }) {
  await getAdminUserOrThrow();

  const importRecord = await getQuestionImportById(input.id);
  if (!importRecord) {
    throw new Error("Question import not found");
  }

  if (importRecord.status !== "ready") {
    throw new Error("Import is not ready to be finalized");
  }

  if (!importRecord.draftExamId) {
    throw new Error("Exam is required before saving");
  }

  const draftQuestions = importRecord.questions ?? [];
  if (draftQuestions.length === 0) {
    throw new Error("No draft questions to save");
  }

  if (!importRecord.draftSubtestId) {
    const missingSubtest = draftQuestions.find((question) => !question.subtestId);
    if (missingSubtest) {
      throw new Error("All questions must have a subtest before saving");
    }
  }

  const setName =
    importRecord.draftName?.trim() ||
    importRecord.sourceFilename.replace(/\.[^/.]+$/, "") ||
    "Imported Question Set";

  const created = await db.transaction(async (tx) => {
    const [createdSet] = await tx
      .insert(questionSets)
      .values({
        examId: importRecord.draftExamId,
        subtestId: importRecord.draftSubtestId ?? null,
        name: setName,
        description: importRecord.draftDescription ?? null,
        status: "draft",
      })
      .returning();

    const insertedQuestions = await tx
      .insert(questions)
      .values(
        draftQuestions.map((question) => ({
          subtestId: question.subtestId ?? importRecord.draftSubtestId!,
          stimulus: question.stimulus ?? null,
          stem: question.stem,
          options: question.options ?? null,
          complexOptions: question.complexOptions ?? null,
          questionType: question.questionType,
          answerKey: question.answerKey,
          explanation: question.explanation,
          difficulty: question.difficulty ?? "medium",
          topicTags: question.topicTags ?? [],
          sourceYear: question.sourceYear ?? null,
          sourceInfo: question.sourceInfo ?? null,
          status: "draft",
        })),
      )
      .returning();

    if (insertedQuestions.length > 0) {
      await tx.insert(questionSetItems).values(
        insertedQuestions.map((question, index) => ({
          questionSetId: createdSet.id,
          questionId: question.id,
          sortOrder: index,
        })),
      );
    }

    await tx
      .update(questionImports)
      .set({
        status: "saved",
        savedQuestionSetId: createdSet.id,
        savedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(questionImports.id, importRecord.id));

    await tx
      .update(questionImportQuestions)
      .set({ updatedAt: new Date() })
      .where(eq(questionImportQuestions.importId, importRecord.id));

    return createdSet;
  });

  return serializeQuestionSet(created);
}
