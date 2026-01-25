import "server-only";

import { z } from "zod";

export const questionSetInputSchema = z.object({
  examId: z.string().uuid("Invalid exam ID"),
  subtestId: z.string().uuid("Invalid subtest ID").nullable().optional(),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const questionSetItemsInputSchema = z.object({
  id: z.string().uuid(),
  questionIds: z.array(z.string().uuid()),
});

export type QuestionSetInput = z.infer<typeof questionSetInputSchema>;
export type QuestionSetItemsInput = z.infer<typeof questionSetItemsInputSchema>;
