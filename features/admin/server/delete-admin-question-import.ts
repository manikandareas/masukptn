"use server";

import {
  deleteQuestionImportById,
  getQuestionImportById,
} from "@/data-access/queries/question-imports";
import { deleteSchema } from "@/features/admin/types";
import { getAdminUserOrThrow } from "@/features/admin/server/require-admin-user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function deleteAdminQuestionImportAction(input: { id: string }) {
  await getAdminUserOrThrow();
  const { id } = deleteSchema.parse(input);

  const importRecord = await getQuestionImportById(id);
  if (!importRecord) {
    throw new Error("Question import not found");
  }

  const supabase = createSupabaseAdminClient();

  const sourcePath = importRecord.storagePath;
  if (sourcePath) {
    const { error } = await supabase.storage
      .from(importRecord.storageBucket)
      .remove([sourcePath]);

    if (error) {
      throw new Error(`Failed to delete source file: ${error.message}`);
    }
  }

  const imageBucket =
    process.env.SUPABASE_OCR_IMAGE_BUCKET ?? "question-import-images";
  const imagePaths = new Set<string>();
  const images = importRecord.ocrMetadata?.images ?? [];

  for (const image of images) {
    if (image.storagePath) {
      imagePaths.add(image.storagePath);
    }
  }

  if (imagePaths.size > 0) {
    const { error } = await supabase.storage
      .from(imageBucket)
      .remove(Array.from(imagePaths));

    if (error) {
      throw new Error(`Failed to delete OCR images: ${error.message}`);
    }
  }

  await deleteQuestionImportById(id);
  return { success: true } as const;
}
