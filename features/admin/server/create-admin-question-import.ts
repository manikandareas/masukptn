"use server";

import { randomUUID } from "crypto";

import {
  getQuestionImportById,
  insertQuestionImport,
  updateQuestionImportById,
} from "@/data-access/queries/question-imports";
import { enqueueQuestionImport } from "@/features/admin/server/enqueue-question-import";
import { questionImportFormSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { serializeQuestionImportSummary } from "@/features/admin/server/serializers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_PDF_BYTES = 20 * 1024 * 1024;

function isPdfFile(file: File) {
  if (file.type === "application/pdf") return true;
  const lower = file.name.toLowerCase();
  return lower.endsWith(".pdf");
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function createAdminQuestionImportAction(formData: FormData) {
  const admin = await getAdminUserOrThrow();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Missing PDF file");
  }

  if (!isPdfFile(file)) {
    throw new Error("Only PDF files are supported");
  }

  if (file.size > MAX_PDF_BYTES) {
    throw new Error("PDF file is too large (max 20MB)");
  }

  const raw = {
    examId: formData.get("examId"),
    subtestId: formData.get("subtestId") || null,
    name: formData.get("name"),
    description: formData.get("description") || null,
  };

  const parsed = questionImportFormSchema.parse(raw);

  const supabase = createSupabaseAdminClient();
  const bucket = process.env.SUPABASE_OCR_BUCKET ?? "question-imports";
  const safeName = sanitizeFilename(file.name || "document.pdf");
  const path = `imports/${admin.id}/${Date.now()}-${randomUUID()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type || "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const created = await insertQuestionImport({
    createdBy: admin.id,
    sourceFilename: file.name,
    sourceMimeType: file.type || "application/pdf",
    sourceFileSize: file.size,
    storageBucket: bucket,
    storagePath: path,
    status: "queued",
    draftExamId: parsed.examId,
    draftSubtestId: parsed.subtestId ?? null,
    draftName: parsed.name,
    draftDescription: parsed.description ?? null,
  });

  try {
    const deduplicationId = `import-${created.id}`;
    await enqueueQuestionImport({
      importId: created.id,
      deduplicationId,
    });
  } catch (error) {
    await updateQuestionImportById(created.id, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Queue error",
    });
  }

  const refreshed = await getQuestionImportById(created.id);
  return serializeQuestionImportSummary(refreshed ?? created);
}
