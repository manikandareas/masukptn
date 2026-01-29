import "server-only";

import {
  deleteQuestionImportQuestionsByImportId,
  getQuestionImportById,
  insertQuestionImportQuestions,
  updateQuestionImportById,
  type NewQuestionImportQuestion,
} from "@/data-access/queries/question-imports";
import { getAllSubtests } from "@/data-access/queries/admin";
import { serializeQuestionImportDetail } from "@/features/admin/server/serializers";
import {
  generateQuestionDraftsFromChunks,
  runMistralOcr,
  OCR_MAX_CHARS,
  type MistralOcrPage,
  type GeneratedQuestionDraft,
} from "@/lib/ai/question-import";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_QUESTIONS = 200;

function normalizeAnswerKey(params: {
  questionType: "single_choice" | "complex_selection" | "fill_in";
  answerKey: NewQuestionImportQuestion["answerKey"];
  complexOptions?: NewQuestionImportQuestion["complexOptions"] | null;
}): NewQuestionImportQuestion["answerKey"] {
  const { questionType, answerKey, complexOptions } = params;

  if (questionType === "single_choice") {
    if (answerKey?.type === "single_choice") {
      const correct = (answerKey.correct || "").toUpperCase();
      if (["A", "B", "C", "D", "E"].includes(correct)) {
        return { type: "single_choice", correct };
      }
    }
    return { type: "single_choice", correct: "A" };
  }

  if (questionType === "complex_selection") {
    if (answerKey?.type === "complex_selection" && answerKey.rows?.length) {
      return answerKey;
    }
    const rowCount = complexOptions?.length ?? 1;
    return {
      type: "complex_selection",
      rows: Array.from({ length: rowCount }, () => ({ correct: "" })),
    };
  }

  if (answerKey?.type === "fill_in") {
    return answerKey;
  }

  return { type: "fill_in", accepted: [""] };
}

type UploadedOcrImage = {
  page?: number;
  index: number;
  mimeType: string;
  storagePath: string;
  publicUrl: string;
};

type MistralOcrImage = NonNullable<MistralOcrPage["images"]>[number];

const DATA_URL_REGEX =
  /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/_=-]+/g;
const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*]\(([^)]+)\)/g;
const INLINE_IMAGE_REGEX = /!\[[^\]]*]\(([^)]+)\)/;
const QUESTION_HEADER_REGEX =
  /(?:^|\n)\s*(?:#+\s*)?(?:No\.?|Nomor)\s*(\d+)\b/gi;
const OPTION_LINE_REGEX = /^\s*([A-E])[\.\)]\s*/i;
const INCOMPLETE_PLACEHOLDER = "[OCR tidak lengkap]";

function normalizeBase64(value: string) {
  const cleaned = value.replace(/\s+/g, "");
  const normalized = cleaned.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = normalized.length % 4;
  if (remainder === 2) return `${normalized}==`;
  if (remainder === 3) return `${normalized}=`;
  return normalized;
}

function parseDataUrl(dataUrl: string) {
  if (!dataUrl.startsWith("data:")) return null;
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) return null;
  const header = dataUrl.slice(5, commaIndex);
  const [mimeType] = header.split(";");
  if (!mimeType?.startsWith("image/")) return null;
  const base64 = normalizeBase64(dataUrl.slice(commaIndex + 1));
  if (!base64) return null;
  return { mimeType, base64 };
}

function extractMarkdownImageTags(markdown: string) {
  const tags: Array<{ tag: string; url: string; start: number; end: number }> = [];
  MARKDOWN_IMAGE_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MARKDOWN_IMAGE_REGEX.exec(markdown)) !== null) {
    const url = match[1]?.trim();
    if (!url) continue;
    tags.push({
      tag: match[0],
      url,
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return tags;
}

function isHttpUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function extractImageUrls(markdown: string) {
  return extractMarkdownImageTags(markdown)
    .map((tag) => tag.url)
    .filter((url) => isHttpUrl(url));
}

function extractUrlFromTag(tag: string) {
  const match = tag.match(INLINE_IMAGE_REGEX);
  return match?.[1]?.trim() ?? null;
}

function mimeTypeToExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "png";
  }
}

function extractDataUrls(markdown: string) {
  const matches: Array<{
    dataUrl: string;
    mimeType: string;
    base64: string;
    start: number;
    end: number;
  }> = [];
  DATA_URL_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = DATA_URL_REGEX.exec(markdown)) !== null) {
    const dataUrl = match[0];
    const parsed = parseDataUrl(dataUrl);
    if (!parsed) continue;
    const start = match.index;
    matches.push({
      dataUrl,
      mimeType: parsed.mimeType,
      base64: parsed.base64,
      start,
      end: start + dataUrl.length,
    });
  }
  return matches;
}

function appendImages(markdown: string, imageTags: string[]) {
  if (imageTags.length === 0) return markdown;
  const existingUrls = new Set(extractImageUrls(markdown));
  const toAppend = imageTags.filter((tag) => {
    const url = extractUrlFromTag(tag);
    if (!url) return false;
    if (!isHttpUrl(url)) return false;
    return !existingUrls.has(url);
  });
  if (toAppend.length === 0) return markdown;
  return [markdown, ...toAppend]
    .filter((value) => value.trim().length > 0)
    .join("\n\n");
}

function replaceDataUrlsWithPublicUrls(
  markdown: string,
  replacements: Array<{ start: number; end: number; publicUrl: string }>,
) {
  if (replacements.length === 0) return markdown;
  const sorted = [...replacements].sort((a, b) => b.start - a.start);
  let output = markdown;
  for (const replacement of sorted) {
    output =
      output.slice(0, replacement.start) +
      replacement.publicUrl +
      output.slice(replacement.end);
  }
  return output;
}

function normalizeMistralImage(image: MistralOcrImage | undefined | null) {
  if (!image) return null;
  const raw =
    image.image_base64 ||
    image.base64 ||
    image.image ||
    "";
  if (!raw) return null;
  if (raw.startsWith("data:")) {
    return parseDataUrl(raw);
  }
  const mimeType =
    image.mime_type ||
    image.media_type ||
    image.content_type ||
    "image/png";
  return {
    mimeType,
    base64: normalizeBase64(raw),
  };
}

function hasQuestionImage(question: GeneratedQuestionDraft) {
  if (question.stimulus && INLINE_IMAGE_REGEX.test(question.stimulus)) {
    return true;
  }
  if (INLINE_IMAGE_REGEX.test(question.stem)) {
    return true;
  }
  if (question.options?.some((option) => INLINE_IMAGE_REGEX.test(option))) {
    return true;
  }
  return false;
}

type OcrChunk = {
  number?: number;
  text: string;
  images: string[];
  optionImages: Record<string, string[]>;
};

function parseOcrChunks(ocrText: string): OcrChunk[] {
  QUESTION_HEADER_REGEX.lastIndex = 0;
  const matches = Array.from(ocrText.matchAll(QUESTION_HEADER_REGEX));
  if (matches.length === 0) {
    return [
      {
        text: ocrText,
        images: extractMarkdownImageTags(ocrText)
          .map((tag) => tag.tag)
          .filter((tag) => isHttpUrl(extractUrlFromTag(tag) ?? "")),
        optionImages: {},
      },
    ];
  }

  const chunks: OcrChunk[] = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = match.index ?? 0;
    const end =
      index + 1 < matches.length
        ? matches[index + 1]?.index ?? ocrText.length
        : ocrText.length;
    const text = ocrText.slice(start, end);
    const number = Number(match[1]);
    const optionImages: Record<string, string[]> = {};
    const images: string[] = [];

    const lines = text.split("\n");
    for (const line of lines) {
      const optionMatch = line.match(OPTION_LINE_REGEX);
      const lineImages = extractMarkdownImageTags(line).filter((tag) =>
        isHttpUrl(tag.url),
      );
      if (lineImages.length === 0) continue;

      if (optionMatch?.[1]) {
        const optionKey = optionMatch[1].toUpperCase();
        if (!optionImages[optionKey]) optionImages[optionKey] = [];
        optionImages[optionKey].push(...lineImages.map((tag) => tag.tag));
      } else {
        images.push(...lineImages.map((tag) => tag.tag));
      }
    }

    const uniqueImages = Array.from(new Set(images));
    const normalizedOptionImages: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(optionImages)) {
      normalizedOptionImages[key] = Array.from(new Set(value));
    }

    chunks.push({
      number: Number.isFinite(number) ? number : undefined,
      text,
      images: uniqueImages,
      optionImages: normalizedOptionImages,
    });
  }

  return chunks;
}

function injectOcrImagesIntoDrafts(params: {
  ocrText: string;
  questions: GeneratedQuestionDraft[];
}) {
  const chunks = parseOcrChunks(params.ocrText);
  const chunkByNumber = new Map(
    chunks
      .filter((chunk) => chunk.number !== undefined)
      .map((chunk) => [chunk.number as number, chunk]),
  );
  const chunksByIndex: Array<OcrChunk | undefined> = [];
  for (const chunk of chunks) {
    if (chunk.number === undefined) continue;
    const index = chunk.number - 1;
    if (index >= 0 && index < params.questions.length) {
      chunksByIndex[index] = chunk;
    }
  }
  const usedNumbers = new Set<number>();

  return params.questions.map((question, questionIndex) => {
    if (hasQuestionImage(question)) return question;

    const stemMatch = question.stem.match(/(?:^|\b)(?:No\.?|Nomor)\s*(\d+)\b/i);
    const stemNumber = stemMatch ? Number(stemMatch[1]) : undefined;
    let chunk = chunksByIndex[questionIndex];
    if (chunk?.number !== undefined && usedNumbers.has(chunk.number)) {
      chunk = undefined;
    }

    if (!chunk && stemNumber !== undefined) {
      const stemChunk = chunkByNumber.get(stemNumber);
      if (stemChunk && (!stemChunk.number || !usedNumbers.has(stemChunk.number))) {
        chunk = stemChunk;
      }
    }

    if (!chunk) return question;

    if (chunk.number !== undefined) {
      usedNumbers.add(chunk.number);
    }

    const nextQuestion = { ...question };

    if (nextQuestion.options && nextQuestion.options.length > 0) {
      const updatedOptions = [...nextQuestion.options];
      for (const [letter, images] of Object.entries(chunk.optionImages)) {
        const index = letter.charCodeAt(0) - 65;
        if (index < 0 || index >= updatedOptions.length) continue;
        const optionValue = updatedOptions[index] ?? "";
        updatedOptions[index] = appendImages(optionValue, images);
      }
      nextQuestion.options = updatedOptions;
    }

    if (chunk.images.length > 0) {
      if (nextQuestion.stimulus && nextQuestion.stimulus.trim().length > 0) {
        nextQuestion.stimulus = appendImages(nextQuestion.stimulus, chunk.images);
      } else {
        nextQuestion.stem = appendImages(nextQuestion.stem, chunk.images);
      }
    }

    return nextQuestion;
  });
}

async function uploadOcrImage(params: {
  importId: string;
  pageIndex: number;
  pageNumber?: number;
  imageIndex: number;
  mimeType: string;
  base64: string;
  bucket: string;
  supabase: ReturnType<typeof createSupabaseAdminClient>;
}): Promise<UploadedOcrImage> {
  const extension = mimeTypeToExtension(params.mimeType);
  const storagePath = `imports/${params.importId}/page-${params.pageIndex + 1}/image-${params.imageIndex + 1}.${extension}`;
  const buffer = Buffer.from(params.base64, "base64");
  const { error } = await params.supabase.storage
    .from(params.bucket)
    .upload(storagePath, buffer, {
      contentType: params.mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload OCR image: ${error.message}`);
  }

  const { data } = params.supabase.storage
    .from(params.bucket)
    .getPublicUrl(storagePath);

  if (!data?.publicUrl) {
    throw new Error("Failed to get public URL for OCR image");
  }

  return {
    page: params.pageNumber,
    index: params.imageIndex,
    mimeType: params.mimeType,
    storagePath,
    publicUrl: data.publicUrl,
  };
}

async function normalizeOcrPage(params: {
  page: MistralOcrPage;
  pageIndex: number;
  importId: string;
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  bucket: string;
}) {
  const pageNumber = params.page.page ?? params.pageIndex + 1;
  let markdown = params.page.markdown ?? params.page.text ?? "";
  const uploadedImages: UploadedOcrImage[] = [];
  const uploadedByBase64 = new Map<string, UploadedOcrImage>();
  const replacements: Array<{ start: number; end: number; publicUrl: string }> = [];

  const dataUrls = extractDataUrls(markdown);
  let imageIndex = 0;

  for (const item of dataUrls) {
    if (uploadedByBase64.has(item.base64)) {
      const existing = uploadedByBase64.get(item.base64)!;
      replacements.push({
        start: item.start,
        end: item.end,
        publicUrl: existing.publicUrl,
      });
      continue;
    }
    const uploaded = await uploadOcrImage({
      importId: params.importId,
      pageIndex: params.pageIndex,
      pageNumber,
      imageIndex,
      mimeType: item.mimeType,
      base64: item.base64,
      bucket: params.bucket,
      supabase: params.supabase,
    });
    imageIndex += 1;
    uploadedImages.push(uploaded);
    uploadedByBase64.set(item.base64, uploaded);
    replacements.push({
      start: item.start,
      end: item.end,
      publicUrl: uploaded.publicUrl,
    });
  }

  const markdownImages = extractMarkdownImageTags(markdown).filter(
    (image) => !isHttpUrl(image.url) && !image.url.startsWith("data:"),
  );

  const pageImages = Array.isArray(params.page.images) ? params.page.images : [];
  const pageUploads: UploadedOcrImage[] = [];
  for (const image of pageImages) {
    const normalized = normalizeMistralImage(image);
    if (!normalized) continue;
    if (uploadedByBase64.has(normalized.base64)) {
      pageUploads.push(uploadedByBase64.get(normalized.base64)!);
      continue;
    }
    const uploaded = await uploadOcrImage({
      importId: params.importId,
      pageIndex: params.pageIndex,
      pageNumber,
      imageIndex,
      mimeType: normalized.mimeType,
      base64: normalized.base64,
      bucket: params.bucket,
      supabase: params.supabase,
    });
    imageIndex += 1;
    uploadedImages.push(uploaded);
    uploadedByBase64.set(normalized.base64, uploaded);
    pageUploads.push(uploaded);
  }

  if (markdownImages.length > 0 && pageUploads.length > 0) {
    markdownImages.forEach((image, index) => {
      const upload = pageUploads[index];
      if (!upload) return;
      replacements.push({
        start: image.start,
        end: image.end,
        publicUrl: `![OCR Image](${upload.publicUrl})`,
      });
    });
  }

  if (replacements.length > 0) {
    markdown = replaceDataUrlsWithPublicUrls(markdown, replacements);
  }

  return {
    markdown,
    images: uploadedImages,
  };
}

export async function processQuestionImport(importId: string) {
  const importRecord = await getQuestionImportById(importId);
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

    const imageBucket =
      process.env.SUPABASE_OCR_IMAGE_BUCKET ?? "question-import-images";

    const normalizedPages = await Promise.all(
      ocrResult.pages.map((page, index) =>
        normalizeOcrPage({
          page,
          pageIndex: index,
          importId: importRecord.id,
          supabase,
          bucket: imageBucket,
        }),
      ),
    );

    const ocrText = normalizedPages
      .map((page) => page.markdown)
      .filter((value) => value.trim().length > 0)
      .join("\n\n");

    if (!ocrText.trim()) {
      throw new Error("OCR returned empty text");
    }

    const uploadedImages = normalizedPages.flatMap((page) => page.images);
    const truncated = ocrText.length > OCR_MAX_CHARS;
    const ocrChunks = parseOcrChunks(ocrText);

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

    const generatedQuestions = await generateQuestionDraftsFromChunks({
      ocrChunks: ocrChunks.map((chunk) => ({
        number: chunk.number,
        text: chunk.text,
      })),
      examLabel: importRecord.exam
        ? `${importRecord.exam.name} (${importRecord.exam.code})`
        : null,
      subtests: filteredSubtests.map((subtest) => ({
        code: subtest.code,
        name: subtest.name,
      })),
      sourceFileName: importRecord.sourceFilename,
    });

    const enhancedQuestions = injectOcrImagesIntoDrafts({
      ocrText,
      questions: generatedQuestions,
    });

    const normalizedQuestions = enhancedQuestions.map((question, index) => {
      let next = { ...question };
      const fallbackText = ocrChunks[index]?.text?.trim();

      if (!next.stem?.trim()) {
        next.stem = fallbackText
          ? `${INCOMPLETE_PLACEHOLDER} ${fallbackText}`.trim()
          : INCOMPLETE_PLACEHOLDER;
      }

      if (next.questionType === "single_choice") {
        const optionCount = next.options?.length ?? 0;
        if (optionCount < 4) {
          next = {
            ...next,
            questionType: "fill_in",
            options: null,
            complexOptions: null,
            answerKey: { type: "fill_in", accepted: ["N/A"] },
          };
          if (!next.stem.trim().startsWith(INCOMPLETE_PLACEHOLDER)) {
            next.stem = `${INCOMPLETE_PLACEHOLDER} ${next.stem}`.trim();
          }
        }
      }

      return next;
    });

    const fallbackName = importRecord.sourceFilename.replace(/\.[^/.]+$/, "");
    const draftName =
      importRecord.draftName?.trim() || fallbackName || "Imported Question Set";
    const draftDescription =
      importRecord.draftDescription ?? null;

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

    const draftQuestions: NewQuestionImportQuestion[] = normalizedQuestions
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
      ocrText,
      ocrMetadata: {
        pageCount: normalizedPages.length,
        truncated,
        imageCount: uploadedImages.length,
        images: uploadedImages,
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
