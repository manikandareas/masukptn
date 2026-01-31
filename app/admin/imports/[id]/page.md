# Admin Import Detail Page

## Route
`/admin/imports/[id]`

## Purpose
Admin page for viewing details of a specific question import and managing its draft questions.

## Features
- Import status and metadata
- OCR text preview
- Draft questions list with AI-extracted content
- Edit draft question action
- Delete draft question action
- Save as question set (for "ready" status imports)
- Retry failed import

## Data Schema

### Prefetched Query Data
```typescript
interface QuestionImportDetail {
  id: string;
  createdBy: string;
  sourceFilename: string;
  sourceMimeType: string;
  sourceFileSize: number;
  storageBucket: string;
  storagePath: string;
  queueMessageId: string | null;
  queueDeduplicationId: string | null;
  status: "queued" | "processing" | "ready" | "failed" | "saved";
  errorMessage: string | null;
  ocrText: string | null;
  ocrMetadata: {
    pageCount?: number;
    truncated?: boolean;
    imageCount?: number;
    images?: Array<{
      page?: number;
      index: number;
      mimeType: string;
      storagePath: string;
      publicUrl: string;
    }>;
  } | null;
  processedAt: Date | null;
  draftExamId: string | null;
  draftSubtestId: string | null;
  draftName: string | null;
  draftDescription: string | null;
  savedQuestionSetId: string | null;
  savedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  exam: {
    id: string;
    code: string;
    name: string;
    type: "utbk" | "tka";
    isActive: boolean;
  } | null;
  subtest: {
    id: string;
    code: string;
    name: string;
    examId: string;
    isActive: boolean;
    isMandatory: boolean;
  } | null;
  savedQuestionSet: {
    id: string;
    name: string;
    status: "draft" | "published";
  } | null;
  questions: Array<QuestionImportQuestionItem>;
}

interface QuestionImportQuestionItem {
  id: string;
  importId: string;
  subtestId: string | null;
  stimulus: string | null;
  stem: string;
  options: string[] | null;
  complexOptions: Array<{ statement: string; choices: string[] }> | null;
  questionType: "single_choice" | "complex_selection" | "fill_in";
  answerKey:
    | { type: "single_choice"; correct: string }
    | { type: "complex_selection"; rows: Array<{ correct: string }> }
    | { type: "fill_in"; accepted: string[]; caseSensitive?: boolean; regex?: string };
  explanation: {
    level1: string;
    level1WrongOptions?: Record<string, string>;
    level2?: string[];
  };
  difficulty: "easy" | "medium" | "hard";
  topicTags: string[];
  sourceYear: number | null;
  sourceInfo: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  subtest: {
    id: string;
    examId: string;
    code: string;
    name: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
    isMandatory: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}
```

### URL Parameters
```typescript
interface RouteParams {
  id: string; // UUID of the question import
}
```

## Props Passed to Component
```typescript
interface AdminImportDetailPageProps {
  importId: string; // UUID from URL
}
```

## Component Used
- `AdminImportDetailPage` from `@/features/admin/components/admin-import-detail-page`

## Server Functions Used
- `requireAdminUserPage()` from `@/features/admin/server/require-admin-user`
- `getAdminQuestionImportAction({ importId })` from `@/features/admin/server/get-admin-question-import`

## Authentication
**Required**: Yes (admin only) - redirects to `/signin` if not authenticated
