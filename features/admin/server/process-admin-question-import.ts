"use server";

import { getQuestionImportById, updateQuestionImportById } from "@/data-access/queries/question-imports";
import { enqueueQuestionImport } from "@/features/admin/server/enqueue-question-import";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionImportDetail } from "@/features/admin/server/serializers";

export async function processAdminQuestionImportAction(input: { id: string }) {
  await getAdminUserOrThrow();

  const importRecord = await getQuestionImportById(input.id);
  if (!importRecord) {
    throw new Error("Question import not found");
  }

  if (importRecord.status === "saved") {
    throw new Error("Import already saved");
  }

  if (importRecord.status === "processing" || importRecord.status === "queued") {
    return serializeQuestionImportDetail(importRecord);
  }

  const deduplicationId = `import-${importRecord.id}-${Date.now()}`;
  try {
    await enqueueQuestionImport({ importId: importRecord.id, deduplicationId });
  } catch (error) {
    await updateQuestionImportById(importRecord.id, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Queue error",
    });
    throw error;
  }

  const updated = await getQuestionImportById(importRecord.id);
  if (!updated) {
    throw new Error("Unable to load updated import");
  }

  return serializeQuestionImportDetail(updated);
}
