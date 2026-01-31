# Admin Question Imports List Page

## Route
`/admin/imports`

## Purpose
Admin page for listing and managing PDF question imports (AI-powered OCR and question extraction).

## Features
- Paginated import list
- Filter by status (queued, processing, ready, failed, saved)
- Source file information
- Question count per import
- Status indicators
- View import detail action
- Delete import action
- Retry failed import

## Data Schema

### Prefetched Query Data
```typescript
interface QuestionImportListResponse {
  imports: QuestionImportListItem[];
  totalCount: number;
  filters: QuestionImportFilters;
}

interface QuestionImportListItem {
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
  questionCount: number;
}

interface QuestionImportFilters {
  status?: "queued" | "processing" | "ready" | "failed" | "saved";
  createdBy?: string;
  limit?: number;
  offset?: number;
}
```

## Props Passed to Component
```typescript
// No props - data prefetched via React Query
interface Props {
  // None
}
```

## Component Used
- `AdminImportsPage` from `@/features/admin/components/admin-imports-page`

## Server Functions Used
- `requireAdminUserPage()` from `@/features/admin/server/require-admin-user`
- `getAdminQuestionImportsAction(filters)` from `@/features/admin/server/get-admin-question-imports`

## Authentication
**Required**: Yes (admin only) - redirects to `/signin` if not authenticated
