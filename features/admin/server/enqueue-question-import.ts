import "server-only";

import { questionImportProcessJob } from "@/features/admin/jobs/question-import-process";
import { updateQuestionImportById } from "@/data-access/queries/question-imports";

export async function enqueueQuestionImport(params: {
  importId: string;
  deduplicationId: string;
}) {
  const response = await questionImportProcessJob.dispatch(
    { importId: params.importId },
    {
      deduplicationId: params.deduplicationId,
      retries: 3,
      label: "question-import",
    },
  );

  await updateQuestionImportById(params.importId, {
    status: "queued",
    errorMessage: null,
    queueMessageId: "messageId" in response ? response.messageId : null,
    queueDeduplicationId: params.deduplicationId,
  });

  return response;
}
