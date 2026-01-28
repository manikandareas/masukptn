"use server";

import {
  deleteQuestionImportQuestionsByImportId,
  getQuestionImportById,
  insertQuestionImportQuestions,
  updateQuestionImportById,
  type NewQuestionImportQuestion,
} from "@/data-access/queries/question-imports";
import { getAllSubtests } from "@/data-access/queries/admin";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionImportDetail } from "@/features/admin/server/serializers";
import {
  generateQuestionDrafts,
  runMistralOcr,
  OCR_MAX_CHARS,
} from "@/lib/ai/question-import";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_QUESTIONS = 200;

function normalizeAnswerKey(params: {
  questionType: "single_choice" | "complex_selection" | "fill_in";
  answerKey: NewQuestionImportQuestion["answerKey"];
  complexOptions?: NewQuestionImportQuestion["complexOptions"] | null;
}) {
  const { questionType, answerKey, complexOptions } = params;

  if (questionType === "single_choice") {
    if (answerKey?.type === "single_choice") {
      const correct = (answerKey.correct || "").toUpperCase();
      if (["A", "B", "C", "D", "E"].includes(correct)) {
        return { ...answerKey, correct };
      }
    }
    return { type: "single_choice", correct: "A" } as const;
  }

  if (questionType === "complex_selection") {
    if (answerKey?.type === "complex_selection" && answerKey.rows?.length) {
      return answerKey;
    }
    const rowCount = complexOptions?.length ?? 1;
    return {
      type: "complex_selection",
      rows: Array.from({ length: rowCount }, () => ({ correct: "" })),
    } as const;
  }

  if (answerKey?.type === "fill_in") {
    return answerKey;
  }

  return { type: "fill_in", accepted: [""] } as const;
}

export async function processAdminQuestionImportAction(input: { id: string }) {
  await getAdminUserOrThrow();

  const importRecord = await getQuestionImportById(input.id);
  if (!importRecord) {
    throw new Error("Question import not found");
  }

  if (importRecord.status === "saved") {
    throw new Error("Import already saved");
  }

  await updateQuestionImportById(importRecord.id, {
    status: "processing",
    errorMessage: null,
  });

  try {
    const supabase = createSupabaseAdminClient();
    const { data: signedUrl, error: signedError } = await supabase.storage
      .from(importRecord.storageBucket)
      .createSignedUrl(importRecord.storagePath, 60 * 60);

    if (signedError || !signedUrl?.signedUrl) {
      throw new Error(signedError?.message || "Failed to create signed URL");
    }

    const ocrResult = await runMistralOcr({
      documentUrl: signedUrl.signedUrl,
    });

    if (!ocrResult.text.trim()) {
      throw new Error("OCR returned empty text");
    }

    const aiText =
      ocrResult.text.length > OCR_MAX_CHARS
        ? ocrResult.text.slice(0, OCR_MAX_CHARS)
        : ocrResult.text;

    const allSubtests = await getAllSubtests();
    const filteredSubtests = importRecord.draftExamId
      ? allSubtests
          .filter((row) => row.subtest.examId === importRecord.draftExamId)
          .map((row) => row.subtest)
      : allSubtests.map((row) => row.subtest);

    const subtestByCode = new Map(
      filteredSubtests.map((subtest) => [
        subtest.code.toLowerCase(),
        subtest.id,
      ]),
    );
    const subtestByName = new Map(
      filteredSubtests.map((subtest) => [
        subtest.name.toLowerCase(),
        subtest.id,
      ]),
    );

    const generated = await generateQuestionDrafts({
      ocrText: aiText,
      examLabel: importRecord.exam
        ? `${importRecord.exam.name} (${importRecord.exam.code})`
        : null,
      subtests: filteredSubtests.map((subtest) => ({
        code: subtest.code,
        name: subtest.name,
      })),
      defaultQuestionSetName: importRecord.draftName,
      defaultQuestionSetDescription: importRecord.draftDescription,
      sourceFileName: importRecord.sourceFilename,
    });

    const fallbackName = importRecord.sourceFilename.replace(/\.[^/.]+$/, "");
    const draftName =
      importRecord.draftName?.trim() ||
      generated.questionSet.name.trim() ||
      fallbackName ||
      "Imported Question Set";
    const draftDescription =
      importRecord.draftDescription ??
      generated.questionSet.description ??
      null;

    const resolveSubtestId = (value?: string | null) => {
      if (!value) return importRecord.draftSubtestId ?? null;
      const lowered = value.toLowerCase().trim();
      return (
        subtestByCode.get(lowered) ||
        subtestByName.get(lowered) ||
        importRecord.draftSubtestId ||
        null
      );
    };

    const draftQuestions: NewQuestionImportQuestion[] = generated.questions
      .slice(0, MAX_QUESTIONS)
      .map((question, index) => {
        const questionType = question.questionType;
        const options =
          questionType === "single_choice" ? question.options ?? [] : null;
        const complexOptions =
          questionType === "complex_selection"
            ? question.complexOptions ?? []
            : null;

        return {
          importId: importRecord.id,
          subtestId: resolveSubtestId(question.subtestCode),
          questionType,
          stimulus: question.stimulus ?? null,
          stem: question.stem,
          options,
          complexOptions,
          answerKey: normalizeAnswerKey({
            questionType,
            answerKey: question.answerKey,
            complexOptions,
          }),
          explanation: {
            level1: question.explanation?.level1 ?? "",
            level1WrongOptions: question.explanation?.level1WrongOptions,
            level2: question.explanation?.level2,
          },
          difficulty: question.difficulty ?? "medium",
          topicTags: question.topicTags ?? [],
          sourceYear: question.sourceYear ?? null,
          sourceInfo: question.sourceInfo ?? null,
          sortOrder: index,
        };
      });

    await deleteQuestionImportQuestionsByImportId(importRecord.id);
    await insertQuestionImportQuestions(draftQuestions);

    await updateQuestionImportById(importRecord.id, {
      status: "ready",
      ocrText: ocrResult.text,
      ocrMetadata: {
        pageCount: ocrResult.pages.length,
        truncated: ocrResult.truncated,
      },
      processedAt: new Date(),
      draftName,
      draftDescription,
    });

    const updated = await getQuestionImportById(importRecord.id);
    if (!updated) {
      throw new Error("Unable to load updated import");
    }

    return serializeQuestionImportDetail(updated);
  } catch (error) {
    await updateQuestionImportById(importRecord.id, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}
