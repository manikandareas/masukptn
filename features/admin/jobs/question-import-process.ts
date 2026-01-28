import "server-only";

import { z } from "zod";

import { createJob } from "@/lib/qstash/jobs";
import { processQuestionImport } from "@/features/admin/server/process-question-import";

const payloadSchema = z.object({
  importId: z.string().uuid(),
});

export type QuestionImportProcessPayload = z.infer<typeof payloadSchema>;

export const questionImportProcessJob = createJob<QuestionImportProcessPayload>(
  "question-import.process",
  async (payload) => {
    const parsed = payloadSchema.parse(payload);
    await processQuestionImport(parsed.importId);
  },
);
