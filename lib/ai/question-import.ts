import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const MISTRAL_OCR_URL =
  process.env.MISTRAL_OCR_URL ?? "https://api.mistral.ai/v1/ocr";
const MISTRAL_OCR_MODEL =
  process.env.MISTRAL_OCR_MODEL ?? "mistral-ocr-latest";

const openrouter = createOpenRouter({
  apiKey: process.env.AI_GATEWAY_API_KEY,
})

const QUESTION_IMPORT_MODEL =
  openrouter.chat("google/gemini-3-flash-preview")

export const OCR_MAX_CHARS = 20000;
const OCR_BATCH_MAX_CHARS = 12000;
const OCR_BATCH_MAX_QUESTIONS = 6;
const INCOMPLETE_PLACEHOLDER = "[OCR tidak lengkap]";

const answerKeySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("single_choice"),
    correct: z.string().min(1),
  }),
  z.object({
    type: z.literal("complex_selection"),
    rows: z.array(z.object({ correct: z.string().min(1) })).min(1),
  }),
  z.object({
    type: z.literal("fill_in"),
    accepted: z.array(z.string().min(1)).min(1),
    caseSensitive: z.boolean().optional(),
    regex: z.string().optional(),
  }),
]);

const explanationSchema = z.object({
  level1: z.string(),
  level1WrongOptions: z.record(z.string(), z.string()).optional(),
  level2: z.array(z.string()).optional(),
});

const complexOptionSchema = z.object({
  statement: z.string(),
  choices: z.array(z.string()),
});

const generatedQuestionSchema = z.object({
  subtestCode: z.string().optional().nullable(),
  questionType: z.enum(["single_choice", "complex_selection", "fill_in"]),
  stimulus: z.string().optional().nullable(),
  stem: z.string().min(1),
  options: z.array(z.string()).optional().nullable(),
  complexOptions: z.array(complexOptionSchema).optional().nullable(),
  answerKey: answerKeySchema,
  explanation: explanationSchema,
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  topicTags: z.array(z.string()).optional().default([]),
  sourceYear: z.number().int().min(2000).max(2100).optional().nullable(),
  sourceInfo: z.string().optional().nullable(),
});

const generatedOutputSchema = z.object({
  questionSet: z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
  }),
  questions: z.array(generatedQuestionSchema).min(1),
});

const generatedBatchOutputSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1),
});

export type GeneratedQuestionDraft = z.infer<typeof generatedQuestionSchema>;
export type GeneratedImportOutput = z.infer<typeof generatedOutputSchema>;

export type MistralOcrImage = {
  image_base64?: string;
  base64?: string;
  image?: string;
  mime_type?: string;
  media_type?: string;
  content_type?: string;
};

export type MistralOcrPage = {
  page?: number;
  markdown?: string;
  text?: string;
  images?: MistralOcrImage[];
};

export type MistralOcrResult = {
  text: string;
  pages: MistralOcrPage[];
  truncated: boolean;
};

export async function runMistralOcr(params: {
  documentUrl: string;
}): Promise<MistralOcrResult> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Mistral API key");
  }

  const response = await fetch(MISTRAL_OCR_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MISTRAL_OCR_MODEL,
      document: {
        type: "document_url",
        document_url: params.documentUrl,
      },
      include_image_base64: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Mistral OCR failed (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    pages?: MistralOcrPage[];
  };

  const pages = Array.isArray(data.pages) ? data.pages : [];
  const text = pages
    .map((page) => page.markdown ?? page.text ?? "")
    .filter((value) => value.trim().length > 0)
    .join("\n\n");

  const truncated = text.length > OCR_MAX_CHARS;

  return {
    text,
    pages,
    truncated,
  };
}

export async function generateQuestionDrafts(params: {
  ocrText: string;
  examLabel?: string | null;
  subtests: Array<{ code: string; name: string }>;
  defaultQuestionSetName?: string | null;
  defaultQuestionSetDescription?: string | null;
  sourceFileName?: string | null;
}): Promise<GeneratedImportOutput> {
  const subtestList = params.subtests
    .map((subtest) => `- ${subtest.code}: ${subtest.name}`)
    .join("\n");

  const system = [
    "You are an expert Indonesian exam content editor for UTBK/TKA questions.",
    "Extract complete questions from OCR text and output ONLY the JSON object that matches the schema.",
    "Use Bahasa Indonesia. Use Markdown for math or formulas.",
    "If a question is incomplete or ambiguous, skip it.",
    "If OCR text includes markdown image tags, keep them in the relevant stimulus, stem, or options.",
    "For single_choice: provide 4-5 options (no A-E prefix). answerKey.correct must be a letter A-E.",
    "For complex_selection: provide complexOptions with statements and choices; answerKey.rows must match the number of statements.",
    "For fill_in: provide answerKey.accepted array with acceptable answers.",
    "If you can identify a subtest, set subtestCode to one of the provided codes. Otherwise leave it null.",
  ].join(" ");

  const userPrompt = [
    params.examLabel ? `Exam: ${params.examLabel}` : "",
    params.defaultQuestionSetName
      ? `Suggested set name: ${params.defaultQuestionSetName}`
      : "",
    params.defaultQuestionSetDescription
      ? `Suggested set description: ${params.defaultQuestionSetDescription}`
      : "",
    params.sourceFileName ? `Source file: ${params.sourceFileName}` : "",
    "Available subtests (code: name):",
    subtestList || "- (none)",
    "\nOCR TEXT:",
    params.ocrText,
  ]
    .filter((line) => line !== "")
    .join("\n");

  const { output } = await generateText({
    model: QUESTION_IMPORT_MODEL,
    system,
    output: Output.object({
      schema: generatedOutputSchema,
      name: "QuestionImport",
      description: "Generated question set and questions from OCR text",
    }),
    prompt: userPrompt,
  });

  return output;
}

export async function generateQuestionDraftsFromChunks(params: {
  ocrChunks: Array<{ number?: number; text: string }>;
  examLabel?: string | null;
  subtests: Array<{ code: string; name: string }>;
  sourceFileName?: string | null;
}): Promise<GeneratedQuestionDraft[]> {
  const subtestList = params.subtests
    .map((subtest) => `- ${subtest.code}: ${subtest.name}`)
    .join("\n");

  const system = [
    "You are an expert Indonesian exam content editor for UTBK/TKA questions.",
    "Extract exactly one complete question from each OCR chunk.",
    "Output ONLY the JSON object that matches the schema.",
    "Preserve inline markdown image tags and their positions.",
    "If a chunk is incomplete or ambiguous, still return a question and prepend [OCR tidak lengkap] to the stem.",
    "Use Bahasa Indonesia. Use Markdown for math or formulas.",
    "For single_choice: provide 4-5 options (no A-E prefix). answerKey.correct must be a letter A-E.",
    "For complex_selection: provide complexOptions with statements and choices; answerKey.rows must match the number of statements.",
    "For fill_in: provide answerKey.accepted array with acceptable answers.",
    "If you can identify a subtest, set subtestCode to one of the provided codes. Otherwise leave it null.",
  ].join(" ");

  const batches: Array<Array<{ number?: number; text: string }>> = [];
  let currentBatch: Array<{ number?: number; text: string }> = [];
  let currentChars = 0;

  for (const chunk of params.ocrChunks) {
    const chunkChars = chunk.text.length;
    const wouldOverflow =
      currentBatch.length >= OCR_BATCH_MAX_QUESTIONS ||
      (currentBatch.length > 0 && currentChars + chunkChars > OCR_BATCH_MAX_CHARS);
    if (wouldOverflow) {
      batches.push(currentBatch);
      currentBatch = [];
      currentChars = 0;
    }
    currentBatch.push(chunk);
    currentChars += chunkChars;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  const results: GeneratedQuestionDraft[] = [];

  for (const batch of batches) {
    const chunkBlocks = batch
      .map((chunk, index) => {
        const label = chunk.number
          ? `Chunk ${index + 1} (No. ${chunk.number})`
          : `Chunk ${index + 1}`;
        return [`### ${label}`, chunk.text].join("\n");
      })
      .join("\n\n");

    const prompt = [
      params.examLabel ? `Exam: ${params.examLabel}` : "",
      params.sourceFileName ? `Source file: ${params.sourceFileName}` : "",
      "Available subtests (code: name):",
      subtestList || "- (none)",
      "Return questions in the same order as the chunks below.",
      "\nOCR CHUNKS:",
      chunkBlocks,
    ]
      .filter((line) => line !== "")
      .join("\n");

    const { output } = await generateText({
      model: QUESTION_IMPORT_MODEL,
      system,
      output: Output.object({
        schema: generatedBatchOutputSchema,
        name: "QuestionImportBatch",
        description: "Generated questions from OCR chunks",
      }),
      prompt,
    });

    const outputQuestions = output?.questions ?? [];
    const normalized = batch.map((chunk, index): GeneratedQuestionDraft => {
      const candidate = outputQuestions[index];
      if (candidate) return candidate;
      const stem = chunk.text.trim();
      return {
        subtestCode: null,
        questionType: "fill_in",
        stimulus: null,
        stem: stem ? `${INCOMPLETE_PLACEHOLDER} ${stem}`.trim() : INCOMPLETE_PLACEHOLDER,
        options: null,
        complexOptions: null,
        answerKey: { type: "fill_in", accepted: ["N/A"] },
        explanation: { level1: "" },
        difficulty: "medium",
        topicTags: [],
        sourceYear: null,
        sourceInfo: null,
      };
    });

    results.push(...normalized);
  }

  return results;
}
